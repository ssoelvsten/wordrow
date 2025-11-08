import { Language } from "../language";
import { Mode } from "../mode";

const dailyCache: { [lang in Language]: { hash: number, words: string[] } | undefined} = {
    [Language.DK]: undefined,
    [Language.DE]: undefined,
    [Language.EN]: undefined,
    [Language.ES]: undefined,
};

const getLSKey = (mode: Mode, language: Language) => `${mode}:${language}`;

/** Setup the cache for a certain game mode and language. This flushes the cache if the hash of the
 *  words change. */
export const setup = (mode: Mode, language: Language, words: string[] | undefined) => {
    if (mode !== Mode.DAILY || !words) { return; }

    const hash = words.length*1024 + words.reduce((x, y) => x + y.length, 0);
    const empty = { hash, words: [] };

    let languageCache = dailyCache[language];
    if (!languageCache || languageCache.hash !== hash) {
        const ls_res = localStorage.getItem(getLSKey(mode, language));
        dailyCache[language] = ls_res ? JSON.parse(ls_res) : empty;
    }
};

/** Get guessed words for the given game mode and language. */
export const get = (mode: Mode, language: Language) => {
    if (mode !== Mode.DAILY) { return []; }

    const languageCache = dailyCache[language];
    if (!languageCache) { return []; }
    return languageCache.words;
}

/** Cache a guessed word for a given game mode and language. */
export const push = (mode: Mode, language: Language, word: string) => {
    if (mode !== Mode.DAILY) { return; }

    dailyCache[language]?.words.push(word);
    localStorage.setItem(getLSKey(mode, language), JSON.stringify(dailyCache[language]));
}
