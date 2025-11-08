import './language';
import { Language } from './language';
import { random } from './random';

export enum Mode {
    DAILY     = "DAILY",
    UNLIMITED = "UNLIMITED",
    TIMED     = "TIMED",
    BLITZ     = "BLITZ"
}

export const Modes : Mode[] = [
    Mode.DAILY,
    Mode.UNLIMITED,
    Mode.TIMED,
    Mode.BLITZ,
];

/** Logic for picking games within a specific session for each game mode. */
export interface SessionConfig {
    canRepick: boolean;
    pick: (is: number) => number;
}

export const GetSessionConfig = (mode: Mode) => {
    switch (mode) {
    case Mode.DAILY:
        const today = new Date();
        const todayHash = today.getDate() * 7919 + today.getMonth() * 997 + today.getFullYear() * 257;

        return {
            canRepick: false,
            pick: (is: number) => todayHash % is,
        };
    case Mode.UNLIMITED:
    case Mode.TIMED:
    case Mode.BLITZ:
        return {
            canRepick: true,
            pick: (is: number) => Math.round(random(0, is-1)),
        };
    }
}

/** Configuration for each individual game in a single session depending on the game mode. */
export interface GameConfig {
    initialTime: number;
    addTime: (w: string) => number;
    addScore: ((w: string) => number) | undefined;
}

export const GetGameConfig = (mode: Mode, numberOfChars: number) : GameConfig =>  {
    const sessionConfig = GetSessionConfig(mode);
    const showRound = sessionConfig.canRepick;

    const two_minutes = 2 * 60 * 1000;
    const thirty_seconds = 30 * 1000;
    const totalTime = Math.max(two_minutes, numberOfChars * 1000)

    const noopAddTime = (w: string) => 0;
    const expScore = (w: string) => Math.round(Math.pow(w.length - 2, 2) * 100);

    switch (mode) {
    case Mode.DAILY:
        return {
            initialTime: Infinity,
            addTime: noopAddTime,
            addScore: undefined,
        };
    case Mode.UNLIMITED:
        return {
            initialTime: Infinity,
            addTime: noopAddTime,
            addScore: expScore,
        };
    case Mode.TIMED:
        return {
            initialTime: totalTime,
            addTime: noopAddTime,
            addScore: expScore,
        };
    case Mode.BLITZ:
        const initialTime = Math.max(thirty_seconds, totalTime / 7);
        const timePerChar = (totalTime-initialTime) / numberOfChars;

        return {
            initialTime: initialTime,
            addTime: (w: string) => w.length * timePerChar,
            addScore: expScore,
        };
    }
}

export const GetModeName = (mode: Mode, lang: Language | undefined) : string => {
    if (!lang) return GetModeName(mode, Language.EN);

    switch(lang) {
    case Language.DK:
        switch (mode) {
        case Mode.DAILY:     return "Dagens Gåde";
        case Mode.UNLIMITED: return "Ubegrænset";
        case Mode.TIMED:     return "Tid";
        case Mode.BLITZ:     return "Lyn";
        }
        break;
    case Language.DE:
        switch (mode) {
        case Mode.DAILY:     return "Tägliches Rätsel";
        case Mode.UNLIMITED: return "Unbegrenzt";
        case Mode.TIMED:     return "Zeit";
        case Mode.BLITZ:     return "Blitz";
        }
        break;
    case Language.EN:
        switch (mode) {
        case Mode.DAILY:     return "Daily Challenge";
        case Mode.UNLIMITED: return "Unlimited";
        case Mode.TIMED:     return "Timed";
        case Mode.BLITZ:     return "Blitz";
        }
        break;
    case Language.ES:
        switch (mode) {
        case Mode.DAILY:     return "Desafío Diario";
        case Mode.UNLIMITED: return "Ilimitado";
        case Mode.TIMED:     return "Contrarreloj";
        case Mode.BLITZ:     return "Relámpago";
        }
        break;
    default:
        throw new Error(`Unknown Language: ${lang}`);
    }
}
