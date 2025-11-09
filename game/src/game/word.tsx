import React from 'react';
import { Language } from '../language';
import './word.scss';

export interface WordProps {
    col: number;
    guessed: boolean;
    language: Language;
    row: number;
    show: boolean;
    word: string;
    hints: string[];
}

const word_url = (language: Language, word: string) => {
    switch (language) {
        case Language.DK:
            return `https://www.ordnet.dk/ddo/ordbog?query=${word}`;
        case Language.DE:
            return `https://www.duden.de/suchen/flexion/${word}`;
        case Language.EN:
            return `https://www.collinsdictionary.com/dictionary/english/${word}`;
        case Language.ES:
            return `https://dle.rae.es/${word}`;
        default:
            throw new Error(`Unknown Language: ${language}`);
    }
}

export const Word = ({ col, language, guessed, row, show, word, hints }: WordProps) => {
    const getDefinition = () => {
        if (!guessed && !show) return;
        window.open(word_url(language, word), "_blank");
    }

    const isHint: boolean[] = Array(word.length).fill(false);
    for (let c of hints) {
        if (word.indexOf(c) < 0) { continue; }
        isHint[Math.max(0, word.indexOf(c, 1))] = true;
    }

    return (
        <div className={`Word ${guessed ? "Guessed" : ""} ${show ? "Show" : ""}`}
            onClick={getDefinition}
            style={{ gridColumn: col, gridRow: row }}
        >
            {word.split('')
                .map((c, i) => guessed || show || isHint[i] ? c : "")
                .map((c, i) =>
                    <div className={`Letter ${isHint[i] ? "Hint" : ""}`}
                         key={i}
                         style={{ animationDelay: (i * 0.03 + 0.05) + "s" }}
                    >
                        {c}
                    </div>)
            }
        </div>
    )
}

export default Word;
