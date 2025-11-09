import React, { useContext, useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faSolid from '@fortawesome/free-solid-svg-icons';

import { Language } from '../language';
import { Mode, GameConfig, GetGameConfig  } from '../mode';
import { SoundContext, endKey, guessKey, soundMap, soundPath } from '../sound';
import * as GameCache from './game-cache';

import Word from './word';
import ScoreBoard from './scoreboard';
import EndScreen from './end-screen';
import RoundBanner from './round-banner';

import './game.scss';
import Input from './input';

export interface GameReport {
    qualified: boolean;
    score: number | undefined;
}

export interface GameProps {
    anagrams: string[];
    mode: Mode;
    language: Language;
    accScore: number;
    round: number | undefined;
    onRequestNextGame: ((report: GameReport) => void) | undefined;
}
type WordState = { isGuessed: boolean }

const Game = ({ anagrams, mode, language, accScore, round, onRequestNextGame }: GameProps) => {
    const words: number = anagrams.length;
    const minWordLength: number = anagrams[0].length;
    const maxWordLength: number = anagrams[words - 1].length;
    //const averageWordLength = anagrams.reduce((acc, x) => acc + x.length, 0) / words;

    // --------------------------------------------------------------------------------------------
    // GAME MODE CONFIGURATION
    const numberOfChars: number = anagrams.reduce((acc, w) => acc + w.length, 0);
    const gameConfig: GameConfig = GetGameConfig(mode, numberOfChars);

    // --------------------------------------------------------------------------------------------
    // SOUND
    const [play] = useSound(soundPath, { sprite: soundMap, soundEnabled: useContext(SoundContext) });

    // --------------------------------------------------------------------------------------------
    // GAME STATE
    //
    // To improve performance, we might want to also turn the derived state below into a `useState`
    // that are updated via `useEffect`.

    // Array with the state of each word.
    const [wordStates, setWordStates] = useState<WordState[]>(
        () => {
            const cachedGuesses = GameCache.get(mode, language);
            return Array(words).fill({ isGuessed: false, hints: [] })
                               .map(({ _, hints }, i) =>
                                        ({ isGuessed: cachedGuesses.indexOf(anagrams[i]) !== -1,
                                           hints
                                        }));
        }
    );

    /** Whether any word has been guessed. */
    const guessedSome = wordStates.find(({isGuessed}) => isGuessed) !== undefined

    /** Whether all words have been guessed. */
    const guessedAll = wordStates.find(({isGuessed}) => !isGuessed) === undefined

    // Time at which the game will end (if no additional time is obtained)
    const [endTime, setEndTime] = useState<number>(
        () => new Date().getTime() + gameConfig.initialTime
    );

    // Whether the game has ended.
    const [gameEnd, setGameEnd] = useState<boolean>(
        () => guessedAll
    );

    /** The score currently obtained as part of this game. */
    const currScore: number = (() => {
        const addScore = gameConfig.addScore;
        if (!addScore) { return 0; }

        const scoreMultiplier = guessedAll ? 2 : 1;
        const score = anagrams.filter((w, i) => wordStates[i])
                              .reduce((acc, w) => acc + addScore(w), 0);
        return scoreMultiplier * score;
    })();

    /** Whether the player has qualified for another round in this session (if any). */
    const qualified: boolean =
        !!wordStates.find(({isGuessed}, idx) => isGuessed && anagrams[idx].length === maxWordLength);

    // Whether the 'Press to Continue' button should be shown/active. This is separate from `gameEnd`
    // to defer it by a small fraction of time.
    const [activatePressToContinue, setActivatePressToContinue] = useState<boolean>(
        () => false
    );
    useEffect(() => {
        if (!gameEnd) { return; }
        play({ id: endKey(qualified) });
        setTimeout(() => setActivatePressToContinue(true), 2000 /* 2s */);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameEnd]);

    // --------------------------------------------------------------------------------------------
    // GAME LOGIC

    /** Request to start the next game in the session */
    const actionNextGame = (ignorePressToContinue: boolean = false) => {
        if (!onRequestNextGame) { return; }
        if (!ignorePressToContinue && !activatePressToContinue) { return; }

        play({ id: "button" });
        onRequestNextGame({ qualified, score: currScore });
    };

    /** Logic when input selection has submitted a guess. */
    const onSubmit = (guess: string) => {
        if (!anagrams.includes(guess)) { return false; }

        let guessedANewWord = false;
        const newGuessed: WordState[] = wordStates.map((vh, idx) => {
            if (anagrams[idx] !== guess) { return vh; }
            guessedANewWord = !vh.isGuessed;
            return { isGuessed: true };
        });

        if (guessedANewWord) {
            play({ id: guessKey(guess.length === maxWordLength && !qualified) });

            setWordStates(newGuessed);
            GameCache.push(mode, language, guess);

            setEndTime(endTime + gameConfig.addTime(guess));
            setGameEnd(wordStates.find((vh) => !vh.isGuessed) === undefined);
        }
        return guessedANewWord;
    };

    /** Callback for the timer running out. */
    const onTimeout = () => {
        setGameEnd(true);
    };

    // --------------------------------------------------------------------------------------------
    // ANAGRAMS LAYOUT

    // Whether the page has been drawn. This variable is changed immediately to `true`. Doing so
    // triggers redrawing the entire component which in turn allows us to compute the layout.
    // https://stackabuse.com/how-to-set-focus-on-element-after-rendering-with-react/
    const [isDrawn, setIsDrawn] = useState<boolean>(
        () => false
    );
    useEffect(() => {
        if (!isDrawn) { setIsDrawn(true); }
    }, [isDrawn]);

    const wordLengths: number[] = Array(maxWordLength - minWordLength + 1).fill(0).map((_, i) => i + minWordLength);
    let wordColumns: [string, number][][] = wordLengths.map((word_length, i) =>
        anagrams.map((w, i) => [w, i] as [string, number]).filter(([w, _]) => w.length === word_length)
    );

    // TODO: Respond to changes to the window size:
    //   https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
    //   https://www.tutsmake.com/react-get-window-height-width/

    // Retrieve the last element with class 'Letter' which is a single symbol for the guessed words.
    // If 'null' then this is the first draw and we will just use the default 100% zoom values.
    const LetterElement = document.getElementsByClassName("Letter").item(0);
    const letterHeight = (LetterElement ? LetterElement.clientHeight : 2 * 5 + 16) + 1;
    const letterWidth = letterHeight;

    const wordElement = document.getElementsByClassName("Word").item(words - 1);
    const wordHeight = (wordElement ? wordElement.clientHeight : letterHeight + 16);
    const wordWidth = wordElement
        ? wordElement.clientWidth
        : ((letterWidth + 5) * maxWordLength);

    const scoreboardElement = document.getElementsByClassName("ScoreBoard").item(0);
    const scoreboardHeight = scoreboardElement ? scoreboardElement.clientHeight : 37;

    const bottomElement = document.getElementsByClassName("Bottom").item(0);
    const bottomHeight = bottomElement ? bottomElement.clientHeight : 190;

    const anagramsElement = document.getElementsByClassName("Anagrams").item(0);
    const anagramsHeight = anagramsElement
        ? anagramsElement.clientHeight
        : window.innerHeight - scoreboardHeight - bottomHeight;

    const maxColumns = Math.floor(window.innerWidth / wordWidth);
    const maxInColumn = anagramsHeight / wordHeight;

    if (maxColumns <= wordColumns.length || wordColumns.some((c) => maxInColumn <= c.length)) {
        wordColumns = [anagrams.map((w, i) => [w, i] as [string, number])]
    }
    const singleColumn: boolean = wordColumns.length === 1;

    let actualColumns: number = 1;
    let actualColumnSize: number = anagrams.length;
    while (actualColumns < maxColumns) {
        actualColumnSize = Math.ceil(anagrams.length / actualColumns);
        if (actualColumnSize < maxInColumn) break;
        actualColumns += 1;
    }

    // --------------------------------------------------------------------------------------------
    // VISUAL

    // Reference for Input component. This allows us to refocus on it.
    const inputRef = useRef<any>(null);

    return (
        <>
            <div className={`Game`}
                 onClick={() => { if (inputRef.current) { inputRef.current.focus(); }} }
            >
                { gameConfig.addScore && round &&
                    <ScoreBoard endTime={endTime}
                                gameEnd={gameEnd}
                                language={language}
                                qualified={qualified}
                                score={accScore + currScore}
                                round={round}
                                onTimeout={onTimeout}
                    />
                }

                {<div className={`Anagrams`}>
                    {wordColumns.map((c, i) => (
                        c.map(([w, j], ci) => {
                            const row = singleColumn ? Math.floor(j % actualColumnSize) + 1 : ci + 1;
                            const col = singleColumn ? Math.floor(j / actualColumnSize) + 1 : i + 1;
                            return <Word key={j} row={row} col={col}
                                         language={language}
                                         word={w} guessed={wordStates[j].isGuessed} show={gameEnd}
                                    />
                        })
                    ))}
                </div>}
                { round &&
                    <RoundBanner language={language} round={round} />
                }

                <div className={`Bottom`}>
                    {!gameEnd &&
                        <Input word={anagrams[words-1]} onSubmit={onSubmit} ref={inputRef} />
                    }
                    {gameEnd && onRequestNextGame &&
                        <EndScreen language={language}
                                   qualified={qualified}
                                   score={accScore + currScore}
                                   showContinue={activatePressToContinue}
                                   onClickContinue={actionNextGame}
                        />
                    }
                </div>

                {/* Add top-right game-specific buttons (see styling in '../app.scss') */}
                <div className={`Top Right`}>
                    {onRequestNextGame && !gameEnd &&
                        <button className={`Button`} onClick={() => setGameEnd(true)}>
                            <FontAwesomeIcon icon={faSolid.faForward} />
                        </button>
                    }
                    {onRequestNextGame && gameEnd &&
                        <button className={`Button`} onClick={() => actionNextGame(true)}>
                            <FontAwesomeIcon icon={faSolid.faForwardStep} />
                        </button>
                    }
                </div>
            </div>
        </>
    );
}

export default Game;
