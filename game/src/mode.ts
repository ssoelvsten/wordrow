import './language';
import { Language } from './language';

export enum Mode {
    UNLIMITED = "UNLIMITED",
    TIMED     = "TIMED",
    BLITZ     = "BLITZ"
}

export const Modes : Mode[] = [
    Mode.UNLIMITED,
    Mode.TIMED,
    Mode.BLITZ,
];

export interface ModeLogic {
    initialTime: number;
    addTime: (word_length: number) => number;
}

export const GetModeLogic = (d: Mode, numberOfChars: number) : ModeLogic =>  {
    const minimumTime = 2 * 60 * 1000; // 02:00:000
    const totalTime = Math.max(minimumTime, numberOfChars * 1000)

    switch (d) {
    case Mode.UNLIMITED:
        return {
            initialTime: Infinity,
            addTime: (word_length: number) => 0
        };
    case Mode.TIMED:
        return {
            initialTime: totalTime,
            addTime: (word_length: number) => 0
        };
    case Mode.BLITZ:
        const initialTime = Math.max(30 * 1000 /* 30s */,
                                     totalTime / 7);
        const timePerChar = (totalTime-initialTime) / numberOfChars;

        return {
            initialTime: initialTime,
            addTime: (word_length: number) => word_length * timePerChar
        };
    }
}

export const GetModeName = (d: Mode, l: Language | undefined) : string => {
    if (!l) return GetModeName(d, Language.EN);

    switch(l) {
    case Language.DK:
        switch (d) {
        case Mode.UNLIMITED: return "Ubegrænset";
        case Mode.TIMED:     return "Tid";
        case Mode.BLITZ:     return "Lyn";
        }
        break;
    case Language.DE:
        switch (d) {
        case Mode.UNLIMITED: return "Unbegrenzt";
        case Mode.TIMED:     return "Zeit";
        case Mode.BLITZ:     return "Blitz";
        }
        break;
    case Language.EN:
        switch (d) {
        case Mode.UNLIMITED: return "Unlimited";
        case Mode.TIMED:     return "Timed";
        case Mode.BLITZ:     return "Blitz";
        }
        break;
    case Language.ES:
        switch (d) {
        case Mode.UNLIMITED: return "Ilimitado";
        case Mode.TIMED:     return "Contrarreloj";
        case Mode.BLITZ:     return "Relámpago";
        }
        break;
    default:
        throw new Error(`Unknown Language: ${l}`);
    }
}
