import { Language } from "../language";
import { Mode } from "../mode";

const dailyCache: { [lang in Language]: { hash: number, words: Set<string> } | undefined} = {
    [Language.DK]: undefined,
    [Language.DE]: undefined,
    [Language.EN]: undefined,
    [Language.ES]: undefined,
};

/** Flush cache for a certain language, if the hash of the game has changed. */
export const flushOnNew = (mode: Mode, language: Language, words: string[] | undefined) => {
    if (mode !== Mode.DAILY || !words) { return; }

    const hash = words.length*1024 + words.reduce((x, y) => x + y.length, 0);

    const languageCache = dailyCache[language];
    if (!languageCache || languageCache.hash !== hash) {
        dailyCache[language] = { hash, words: new Set<string>() };
    }
};

/** Get guessed words for the given game mode and language */
export const get = (mode: Mode, language: Language) => {
    const empty = new Set<string>();
    if (mode !== Mode.DAILY) { return empty; }

    const languageCache = dailyCache[language];
    if (!languageCache) { return empty; }
    return languageCache.words;
}

/** Cache a guessed word for a given game mode and language */
export const push = (mode: Mode, language: Language, word: string) => {
    if (mode !== Mode.DAILY) { return; }
    dailyCache[language]?.words.add(word);
}
