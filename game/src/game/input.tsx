import React, { useContext, useState, forwardRef } from 'react';
import useSound from 'use-sound';

import * as faSolid from '@fortawesome/free-solid-svg-icons';

import InputButton from './input-button';
import InputLetter from './input-letter';

import './input.scss';
import { randomHitKey, randomMissKey, SoundContext, soundMap, soundPath } from '../sound';
import shuffle from '../shuffle';

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

export interface InputProps {
    word: string;
    onSubmit: (w: string) => boolean;
}

export const Input = forwardRef(({ word, onSubmit }: InputProps, ref: React.ForwardedRef<any>) => {
    // --------------------------------------------------------------------------------------------
    // SOUND
    const [play] = useSound(soundPath, { sprite: soundMap, soundEnabled: useContext(SoundContext) });

    // --------------------------------------------------------------------------------------------
    // INPUT STATE

    // Letters, their order, and their indices in the chosen word.
    const [chars, setChars] = useState<CharIdx[]>(
        () => charShuffle(word.split('').map((c) => [c, null]))
    );
    // Latest guessed word for the ability to recreate them.
    const [guessCache, setGuessCache] = useState<(number | null)[]>(
        () => Array(word.length).fill(null)
    );
    // Number of correct guesses. This triggers the green flash animation during submission.
    const [successCount, setSuccessCount] = useState<number>(
        () => 0
    );

    // --------------------------------------------------------------------------------------------
    // DERIVABLE(ISH) STATE

    /** Selected word and its true length (i.e. the last index that is non-null) */
    const selected = deriveSelected(chars);

    /** Whether no characters have been selected. */
    const emptySelection: boolean = selected.length === 0;

    // --------------------------------------------------------------------------------------------
    // LOGIC

    /** Clicking on an unselected (?) character */
    const actionClick = (idx: number) => {
        // Ignore invalid indices
        if (idx < 0 || word.length <= idx) {
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

    /** Typing an unselected (?) character */
    const actionType = (char: string) => {
        // Ignore non-char inputs
        if (char.length !== 1) return;

        // Allow the user to write upper case letters
        char = char.toLocaleLowerCase();

        // Find the left-most index of an unselected occurence of 'char'
        const idx = chars.reduceRight(
            (acc, [c, i], idx) => c === char && i === null ? idx : acc,
            word.length
        );
        actionClick(idx);
    };

    /** Removal of a given letter at a certain position */
    const actionDelete = (idx: number = selected.length - 1) => {
        if (idx < 0 || selected.length <= idx) return;

        play({ id: randomMissKey() });
        setChars(chars.map(([c, i]) => i === null || i === idx ? [c, null]
            : i < idx ? [c, i]
                : [c, i - 1]));
    };

    /** Clearing the entire word selection */
    const actionClear = () => {
        if (selected.length === 0) { return };

        play({ id: "button" });
        setChars(chars.map(([c, _]) => ([c, null])));
    };

    /** Submitting a selection. This either recreates the previous selection from the cache or it
     *  submits the non-empty selection for a guess.
     *
     * TODO: Split action in two? */
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

            // Send guess to game
            const isSuccess = onSubmit(selected);
            if (isSuccess) {
                setSuccessCount(successCount + 1);
            }

            // Reset chars
            setChars(chars.map(([c, i]) => [c, null]));
        }
    };

    /** Shuffle button/key logic */
    const actionShuffle = () => {
        play({ id: "button" });

        const cachedWord: string = deriveSelected(guessCache.map(((s, idx) => [chars[idx][0], s])));
        const shuffledChars: CharIdx[] = charShuffle(chars);

        var shuffledCache: (number | null)[] = Array(word.length).fill(null);

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

    // --------------------------------------------------------------------------------------------
    // KEY LISTENER

    /** Key listener for all key presses in the game. */
    const onKey = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case " ": actionShuffle(); break;
            case "Backspace": (e.ctrlKey || e.altKey) ? actionClear() : actionDelete(); break;
            case "Escape": actionClear(); break;
            case "Enter": actionSubmit(); break;
            default: actionType(e.key)
        }
    }

    // Focus on the component (for onKey listener) after the initial draw.
    // https://stackabuse.com/how-to-set-focus-on-element-after-rendering-with-react/
    // useEffect(() => { if (ref && ref.current) { ref.current.focus(); }}, [ref]);

    // --------------------------------------------------------------------------------------------
    // VISUAL
    return (
        <div className="Input" ref={ref} tabIndex={0} onKeyDown={onKey}>
            <div className={`Row ${successCount > 0 ? 'Success' : ''}`} key={successCount}>
                {emptySelection && <InputButton icon={faSolid.faRotate} onClick={actionShuffle} />}
                {!emptySelection && <InputButton icon={faSolid.faXmark} onClick={actionClear} />}
                {selected.padEnd(word.length, ' ').split('').map((c, idx) => (
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
        </div>
    );
});

export default Input;
