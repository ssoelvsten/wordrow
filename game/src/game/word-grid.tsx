import { useEffect, useState } from "react";
import { Language } from "../language";
import Word from "./word";

import './word-grid.scss';

export type WordState = {
    isGuessed: boolean;
    hints: string[];
};

export interface WordGridProps {
    language: Language;
    words: string[];
    wordStates: WordState[];
    showAll: boolean;
}

export const WordGrid = ({ language, words, wordStates, showAll }: WordGridProps) => {
    const minWordLength = words[0].length;
    const maxWordLength = words[words.length-1].length;

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
        words.map((w, i) => [w, i] as [string, number]).filter(([w, _]) => w.length === word_length)
    );

    // TODO: Respond to changes to the window size:
    //   https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
    //   https://www.tutsmake.com/react-get-window-height-width/

    // Retrieve the last element with class 'Letter' which is a single symbol for the guessed words.
    // If 'null' then this is the first draw and we will just use the default 100% zoom values.
    const LetterElement = document.getElementsByClassName("Letter").item(0);
    const letterHeight = (LetterElement ? LetterElement.clientHeight : 2 * 5 + 16) + 1;
    const letterWidth = letterHeight;

    const wordElement = document.getElementsByClassName("Word").item(words.length - 1);
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
        wordColumns = [words.map((w, i) => [w, i] as [string, number])]
    }
    const singleColumn: boolean = wordColumns.length === 1;

    let actualColumns: number = 1;
    let actualColumnSize: number = words.length;
    while (actualColumns < maxColumns) {
        actualColumnSize = Math.ceil(words.length / actualColumns);
        if (actualColumnSize < maxInColumn) break;
        actualColumns += 1;
    }

    // --------------------------------------------------------------------------------------------
    // VISUAL
    return (
        <div className={`WordGrid`}>
            {wordColumns.map((c, i) => (
                c.map(([w, j], ci) => {
                    const wordState = wordStates[j];
                    const row = singleColumn ? Math.floor(j % actualColumnSize) + 1 : ci + 1;
                    const col = singleColumn ? Math.floor(j / actualColumnSize) + 1 : i + 1;

                    return <Word key={j} row={row} col={col}
                                    language={language}
                                    word={w} guessed={wordState.isGuessed} hints={wordState.hints}
                                    show={showAll}
                            />
                })
            ))}
        </div>
    );
};

export default WordGrid;
