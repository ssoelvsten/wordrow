import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faSolid from '@fortawesome/free-solid-svg-icons'

import { GameInstance } from './game-instance';
import { Language } from '../language';
import { Mode, GameConfig, GetGameConfig, GetModeName, SessionConfig, GetSessionConfig } from '../mode';
import { SoundContext, endKey, guessKey, randomHitKey, randomMissKey, soundMap, soundPath } from '../sound';

import { InputButton, InputLetter } from './input';
import Word from './word';
import shuffle from '../shuffle';
import ScoreBoard from './scoreboard';
import EndScreen from './end-screen';
import Announcement from './announcement';

import './game.scss';

export interface GameReport {
    qualified: boolean;
    score: number | undefined;
}

export interface GameProps {
    instance: GameInstance;
    mode: Mode;
    language: Language;
    accScore: number;
    round: number | undefined;
    onRequestNextGame: ((report: GameReport) => void) | undefined;
}

type CharIdx = [string, number | null];

const deriveSelected = (chars: CharIdx[]) => {
    return chars
        // Create a copy of the array
        .map(_ => _)
        // Sort by selection-index, leaving 'null' at the end
        .sort(([_ca, ia], [_cb, ib]) => {
            return ia === null && ib === null ? 0
                : ia === null ? 1
                    : ib === null ? -1
                        : ia - ib
        })
        // Keep character, if selected.
        .map(([c, i]) => i === null ? "" : c)
        // Merge into a single string
        .join("");
}

const charShuffle = (chars: CharIdx[]) => {
    let charsCopy = chars.map(c => c);

    // Move all unselected characters (`null`) to the end.
    charsCopy.sort(
        ([_ca, ia], [_cb, ib]) => {
            if (ia === null && ib === null)
                return 0;
            if (ia === null || ib === null)
                return ia === null ? 1 : -1;
            else return 0;
        }
    );

    // Shuffle only the null characters.
    const firstNonNull = charsCopy.findIndex(([_, i]) => i === null);
    shuffle(charsCopy, firstNonNull, charsCopy.length);
    return charsCopy;
}

const Game = ({ instance: { anagrams }, mode, language, accScore, round, onRequestNextGame }: GameProps) => {
    const words: number = anagrams.length;
    const minWordLength: number = anagrams[0].length;
    const maxWordLength: number = anagrams[words - 1].length;
    //const averageWordLength = anagrams.reduce((acc, x) => acc + x.length, 0) / words;

    // --------------------------------------------------------------------------------------------
    // GAME MODE CONFIGURATION
    const numberOfChars: number = anagrams.reduce((acc, w) => acc + w.length, 0);
    const gameConfig: GameConfig = GetGameConfig(mode, numberOfChars);

    // --------------------------------------------------------------------------------------------
    // GAME STATE

    // Letters, their order, and their indices in the chosen word.
    const [chars, setChars] = useState<CharIdx[]>(
        () => charShuffle(anagrams[words - 1].split('').map((c) => [c, null]))
    );
    // Boolean array of which words have been guessed
    const [guessed, setGuessed] = useState<boolean[]>(
        () => Array(words).fill(false)
    );
    // String of the latest correct guess. This is used to trigger animations.
    const [latestGuessed, setLatestGuessed] = useState<string | null>(
        () => null
    );
    // Latest guessed word for the ability to recreate them.
    const [guessCache, setGuessCache] = useState<(number | null)[]>(
        () => Array(maxWordLength).fill(null)
    );
    // Time at which the game will end (if no additional time is obtained)
    const [endTime, setEndTime] = useState<number>(
        () => new Date().getTime() + gameConfig.initialTime
    );
    // Whether the game has ended.
    const [gameEnd, setGameEnd] = useState<boolean>(
        () => false
    );
    // Whether the 'Press to Continue' button should be shown/active. This is
    // separate from `gameEnd` to defer it by a small fraction of time.
    const [activatePressToContinue, setActivatePressToContinue] = useState<boolean>(
        () => false
    );
    // Whether the page has been drawn. This is used to trigger computing the
    // layout of the columns.
    const [isDrawn, setIsDrawn] = useState<boolean>(
        () => false
    );

    const currScore: number = (() => {
        const addScore = gameConfig.addScore;
        if (!addScore) { return 0; }

        const scoreMultiplier = !guessed.includes(false) ? 2 : 1;
        const score = anagrams.filter((w, i) => guessed[i])
                              .reduce((acc, w) => acc + addScore(w), 0);
        return scoreMultiplier * score;
    })();

    const qualified: boolean =
        !!guessed.find((v, idx) => v && anagrams[idx].length === maxWordLength);

    // Derive selected word and its true length (i.e. the last index that is non-null)
    const selected = deriveSelected(chars);
    const emptySelection: boolean = selected.length === 0;

    // --------------------------------------------------------------------------------------------
    // SOUND
    const [play] = useSound(soundPath, { sprite: soundMap, soundEnabled: useContext(SoundContext) });

    // --------------------------------------------------------------------------------------------
    // GAME LOGIC
    const actionShuffle = () => {
        play({ id: "button" });

        const cachedWord: string = deriveSelected(guessCache.map(((s, idx) => [chars[idx][0], s])));
        const shuffledChars: CharIdx[] = charShuffle(chars);

        var shuffledCache: (number | null)[] = Array(maxWordLength).fill(null);

        cachedWord.split('').forEach((cached_char, cached_idx) => {
            // Find and update unused matching character in 'shuffledChars'
            shuffledChars.findIndex(([choice_char, _], choice_idx) => {
                if (cached_char === choice_char && shuffledCache[choice_idx] === null) {
                    shuffledCache[choice_idx] = cached_idx;
                    return true;
                }
                return false;
            });
        });

        setChars(shuffledChars);
        setGuessCache(shuffledCache);
    };

    const actionDelete = (idx: number = selected.length - 1) => {
        if (idx < 0 || selected.length <= idx) return;

        play({ id: randomMissKey() });
        setChars(chars.map(([c, i]) => i === null || i === idx ? [c, null]
            : i < idx ? [c, i]
                : [c, i - 1]));
    };

    const actionClear = () => {
        if (selected.length === 0) return;

        play({ id: "button" });
        setChars(chars.map(([c, _]) => ([c, null])));
    };

    const actionSubmit = () => {
        // If nothing is selected, recreate the indices for the word in 'guessCache' if any
        if (emptySelection && guessCache) {
            play({ id: "button" });
            setChars(chars.map(([c, _], idx) => [c, guessCache[idx]]));
        } else {
            play({ id: "submit" });

            // Save current selected word in 'guessCache'
            var newGuessCache = chars.map((c) => c[1]);
            setGuessCache(newGuessCache);

            // Collapse guess from a char[] to a string
            if (anagrams.includes(selected)) {
                let guessedANewWord = false;
                const newGuessed: boolean[] = guessed.map((v: boolean, idx: number) => {
                    const match = anagrams[idx] === selected;
                    if (match) guessedANewWord = v === false;
                    return v || anagrams[idx] === selected;
                });

                setGuessed(newGuessed);
                if (guessedANewWord) {
                    play({ id: guessKey(selected.length === maxWordLength && !qualified) });

                    setLatestGuessed(selected);
                    setEndTime(endTime + gameConfig.addTime(selected));

                    const remainingWords = guessed.reduce((acc, v) => acc + (!v ? 1 : 0), 0);
                    setGameEnd(remainingWords <= 1);
                }
            }
            setChars(chars.map(([c, i]) => [c, null]));
        }
    };

    const actionClick = (idx: number) => {
        // Ignore invalid indices
        if (idx < 0 || maxWordLength <= idx) {
            play({ id: randomMissKey() });
            return;
        }

        // Stop early, if index is already chosen
        if (chars[idx][1] !== null) {
            return;
        }

        // Update selection
        play({ id: randomHitKey() });
        setChars(chars.map(([c, i], c_idx) => {
            return c_idx === idx ? [c, selected.length] : [c, i];
        }));
    };

    const actionType = (char: string) => {
        // Ignore non-char inputs
        if (char.length !== 1) return;

        // Allow the user to write upper case letters
        char = char.toLocaleLowerCase();

        // Find the left-most index of an unselected occurence of 'char'
        const idx = chars.reduceRight(
            (acc, [c, i], idx) => c === char && i === null ? idx : acc,
            maxWordLength
        );
        actionClick(idx);
    };

    const actionNextGame = () => {
        if (!activatePressToContinue || !onRequestNextGame) { return; }

        play({ id: "button" });
        onRequestNextGame({ qualified, score: currScore });
    };

    const onTimeout = () => {
        setGameEnd(true);
    };

    useEffect(() => {
        if (gameEnd) {
            play({ id: endKey(qualified) });

            if (onRequestNextGame) {
                const gameEndDelay = 2000;
                setTimeout(() => setActivatePressToContinue(true), gameEndDelay);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameEnd]);

    // --------------------------------------------------------------------------------------------
    // KEY LISTENER
    const onKey = (e: React.KeyboardEvent) => {
        if (gameEnd) {
            if (e.key === "Enter") { actionNextGame(); }
        } else { // !gameEnd
            switch (e.key) {
                case " ": actionShuffle(); break;
                case "Backspace": (e.ctrlKey || e.altKey) ? actionClear() : actionDelete(); break;
                case "Escape": actionClear(); break;
                case "Enter": actionSubmit(); break;
                default: actionType(e.key)
            }
        }
    }

    // --------------------------------------------------------------------------------------------
    // ANAGRAMS LAYOUT
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
    // TRANSLATIONS

    let round_text: ReactElement = <>{GetModeName(mode, language)}</>;
    if (round) {
        switch (language) {
            case Language.DK: round_text = <>Runde {round}</>; break;
            case Language.DE: round_text = <>Runde {round}</>; break;
            case Language.EN: round_text = <>Round {round}</>; break;
            case Language.ES: round_text = <>Ronda {round}</>; break;
            default:
                throw new Error(`Unknown Language: ${language}`);
        }
    }

    // --------------------------------------------------------------------------------------------
    // VISUAL

    // Run logic after the first draw is finished.
    // https://stackabuse.com/how-to-set-focus-on-element-after-rendering-with-react/
    const divRef = useRef<any>(null);
    useEffect(() => {
        if (!isDrawn) {
            // Change the state of this component to redraw and recompute the layout.
            setIsDrawn(true);

            // Focus on the div to listen to key presses.
            divRef.current.focus();
        }
    }, [isDrawn]);

    return (
        <>
            <div className={`Game`} tabIndex={0} onKeyDown={onKey} ref={divRef}>
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
                            return <Word key={j} language={language} word={w} guessed={guessed[j]} show={gameEnd} row={row} col={col} />
                        })
                    ))}
                </div>}
                {!latestGuessed && round &&
                    <Announcement content={round_text} />
                }

                <div className={`Bottom`}>
                    {!gameEnd &&
                        <>
                            <div className={`Row ${guessed.includes(true) ? 'HasGood' : ''}`} key={latestGuessed}>
                                {emptySelection && <InputButton icon={faSolid.faRotate} onClick={actionShuffle} />}
                                {!emptySelection && <InputButton icon={faSolid.faXmark} onClick={actionClear} />}
                                {selected.padEnd(maxWordLength, ' ').split('').map((c, idx) => (
                                    <InputLetter content={c}
                                        key={idx}
                                        onClick={() => actionDelete(idx)}
                                    />)
                                )}
                                <InputButton
                                    icon={emptySelection ? faSolid.faRedo : faSolid.faCaretRight}
                                    onClick={actionSubmit}
                                />
                            </div>
                            <div className={`Row`}>
                                {chars.map(([c, i], idx) => (
                                    <InputLetter content={i === null ? c : "_"}
                                        key={idx}
                                        onClick={() => actionClick(idx)}
                                    />))}
                            </div>
                        </>
                    }
                    {gameEnd && onRequestNextGame &&
                        <div className={`Row`}>
                            <EndScreen language={language}
                                qualified={qualified}
                                score={accScore + currScore}
                                showContinue={activatePressToContinue}
                                onClickContinue={actionNextGame}
                            />
                        </div>
                    }
                </div>

                {/* Add top-right game-specific buttons (see styling in '../app.scss') */}
                <div className={`Top Right`}>
                    {onRequestNextGame &&
                        <button className={`Button`}
                            onClick={() => {
                                if (gameEnd) {
                                    play({ id: "button" });
                                    onRequestNextGame({ qualified, score: currScore });
                                } else {
                                    setGameEnd(true);
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={gameEnd ? faSolid.faForwardStep : faSolid.faForward} />
                        </button>
                    }
                </div>
            </div>
        </>
    );
}

export default Game;
