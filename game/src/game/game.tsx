import React, { useContext, useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faSolid from '@fortawesome/free-solid-svg-icons';

import { frequency, Language } from '../language';
import { Mode, GameConfig, GetGameConfig  } from '../mode';
import { SoundContext, endKey, guessKey, soundMap, soundPath } from '../sound';
import * as GameCache from './game-cache';

import ScoreBoard from './scoreboard';
import EndScreen from './end-screen';
import RoundBanner from './round-banner';

import './game.scss';
import Input from './input';
import WordGrid, { WordState } from './word-grid';

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

const deriveHint = (lang: Language, word: string, hintNumber: number) => {
    const hintOrder = word.split('').map(c => [c, frequency(lang, c)] as [string, number])
                          .sort((a,b) => b[1] - a[1])
                          .filter((x, i, xs) => !i || x[0] !== xs[i - 1][0])
                          .map(cf => cf[0]);

    return hintOrder[hintNumber];
}

const deriveHints = (lang: Language, word: string, hints: number) => {
    return word.split('').map((_, i) => deriveHint(lang, word, i)).slice(0, hints);
}

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

    // Number of hints given.
    const [[hintIdx, hintsRemaining], setHints] = useState<[number, number]>(
        () => GameCache.get(mode, language)?.hints || [0, gameConfig.maxHints]
    );

    // Array with the state of each word.
    const [wordStates, setWordStates] = useState<WordState[]>(
        () => {
            const hints = deriveHints(language, maxWord, hintIdx);
            const cachedGuesses = GameCache.get(mode, language)?.guessed || [];
            return Array(words.length)
                    .fill(undefined)
                    .map((_, i) => ({
                        isGuessed: false,
                        hints: hints.filter(c => words[i].includes(c))
                    }))
                    .map((vh, i) => {
                            const wordState = cachedGuesses.find(ws => ws.word === words[i]);
                            if (wordState) {
                                return ({
                                    isGuessed: true,
                                    hints: wordState.hints.split('')
                                });
                            }
                            return vh
                    });
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

    /** Whether it is possible to get more hints */
    const enableHints = hintsRemaining > 0 && !gameEnd;

    /** The score currently obtained as part of this game. */
    const currScore: number = (() => {
        const addScore = gameConfig.addScore;
        const multScore = gameConfig.multScore;
        if (!addScore || !multScore) { return 0; }

        const scoreMultiplier = guessedAll ? multScore : 1;
        const score = words.reduce((acc, w, i) => {
            const wordState = wordStates[i];
            return acc + (wordState.isGuessed ? addScore(w, wordState.hints.length) : 0);
        }, 0);
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

    /** Request a hint */
    const actionHint = () => {
        if (!enableHints) { return; }

        play({ id: "submit" });

        const remainingChars = new Set<string>();
        for (let i = 0; i < words.length; ++i) {
            if (wordStates[i].isGuessed) { continue; }
            words[i].split('').forEach(c => remainingChars.add(c));
        }

        let newHint: string = '';
        let hi = hintIdx;
        do {
            newHint = deriveHint(language, maxWord, hi++);
        } while (!remainingChars.has(newHint));

        const newGuessed: WordState[] = wordStates.map((vh, idx) => {
            if (vh.isGuessed) { return vh; }
            if (!words[idx].includes(newHint)) { return vh; }

            const hints = vh.hints.concat([newHint]);
            const isGuessed = hints.length === words[idx].length;

            if (isGuessed) {
                GameCache.pushGuess(mode, language, { word: words[idx], hints: hints.join('') });
            }
            return { isGuessed, hints };
        });
        const newHintState : [number, number] = [hi, hintsRemaining-1]
        GameCache.pushHints(mode, language, newHintState);
        setHints(newHintState);
        setWordStates(newGuessed);
    };

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

        let guessedANewWord: boolean = false;
        let guessHints: string[] = [];
        const newGuessed: WordState[] = wordStates.map((vh, idx) => {
            if (words[idx] !== guess || vh.isGuessed) { return vh; }
            guessedANewWord = true;
            guessHints = vh.hints
            return { isGuessed: true, hints: guessHints };
        });

        if (guessedANewWord) {
            play({ id: guessKey(guess.length === maxWord.length && !qualified) });

            GameCache.pushGuess(mode, language, { word: guess, hints: guessHints.join('') });
            setWordStates(newGuessed);
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
                    { gameConfig.maxHints > 0 &&
                        <button className={`Button`} onClick={actionHint} disabled={!enableHints} >
                            <FontAwesomeIcon icon={faSolid.faQuestion} />
                        </button>
                    }
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
