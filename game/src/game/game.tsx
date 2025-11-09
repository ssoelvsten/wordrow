import React, { useContext, useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faSolid from '@fortawesome/free-solid-svg-icons';

import { Language } from '../language';
import { Mode, GameConfig, GetGameConfig  } from '../mode';
import { SoundContext, endKey, guessKey, soundMap, soundPath } from '../sound';
import * as GameCache from './game-cache';

import ScoreBoard from './scoreboard';
import EndScreen from './end-screen';
import RoundBanner from './round-banner';

import './game.scss';
import Input from './input';
import WordGrid from './word-grid';

export interface GameReport {
    qualified: boolean;
    score: number | undefined;
}

export interface GameProps {
    words: string[];
    mode: Mode;
    language: Language;
    accScore: number;
    round: number | undefined;
    onRequestNextGame: ((report: GameReport) => void) | undefined;
}
type WordState = { isGuessed: boolean }

const Game = ({ words, mode, language, accScore, round, onRequestNextGame }: GameProps) => {
    const maxWord = words[words.length - 1];

    // --------------------------------------------------------------------------------------------
    // GAME MODE CONFIGURATION
    const numberOfChars: number = words.reduce((acc, w) => acc + w.length, 0);
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
            return Array(words.length).fill({ isGuessed: false, hints: [] })
                               .map(({ _, hints }, i) =>
                                        ({ isGuessed: cachedGuesses.indexOf(words[i]) !== -1,
                                           hints
                                        }));
        }
    );

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
        const score = words.filter((w, i) => wordStates[i])
                              .reduce((acc, w) => acc + addScore(w), 0);
        return scoreMultiplier * score;
    })();

    /** Whether the player has qualified for another round in this session (if any). */
    const qualified: boolean =
        !!wordStates.find(({isGuessed}, idx) => isGuessed && words[idx].length === maxWord.length);

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
        if (!words.includes(guess)) { return false; }

        let guessedANewWord = false;
        const newGuessed: WordState[] = wordStates.map((vh, idx) => {
            if (words[idx] !== guess) { return vh; }
            guessedANewWord = !vh.isGuessed;
            return { isGuessed: true };
        });

        if (guessedANewWord) {
            play({ id: guessKey(guess.length === maxWord.length && !qualified) });

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

                <WordGrid language={language}
                          words={words}
                          wordStates={wordStates}
                          showAll={gameEnd}
                />

                { round &&
                    <RoundBanner language={language} round={round} />
                }

                <div className={`Bottom`}>
                    {!gameEnd &&
                        <Input word={maxWord} onSubmit={onSubmit} ref={inputRef} />
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
