import { Language } from "../language";
import { Mode } from "../mode";

class CacheEntry {
    key: string;
    guessed: string[];

    constructor(key: string, guessed: string[]) {
        this.key = key;
        this.guessed = guessed
    }
};

function isCacheEntry (obj: any) : obj is CacheEntry {
    return obj && obj.key && obj.guessed;
}

const dailyCache: { [lang in Language]: CacheEntry | undefined} = {
    [Language.DK]: undefined,
    [Language.DE]: undefined,
    [Language.EN]: undefined,
    [Language.ES]: undefined,
};

const getLSKey = (mode: Mode, language: Language) => `${mode}:${language}`;

/** Setup the cache for a certain game mode and language. This flushes the cache if the game is a
 *  different one than the one that was cached. */
export const setup = (mode: Mode, language: Language, words: string[] | undefined) => {
    if (mode !== Mode.DAILY || !words) { return; }

    const key = words[words.length-1];
    const empty = new CacheEntry(key, []);

    let languageCache = dailyCache[language];
    if (!languageCache || languageCache.key !== key) {
        // Check local storage for a value.
        const ls_key = getLSKey(mode, language);
        const ls_res = localStorage.getItem(ls_key);
        if (!ls_res) {
            dailyCache[language] = empty;
            return;
        }
        // Check whether the value is old (does not match `CacheEntry`) and should be ignored. This
        // resolves the webpage from breaking when the local storage contains unmigrated data.
        const ls_obj = JSON.parse(ls_res);
        if (!isCacheEntry(ls_obj)) {
            console.log(`purging ${ls_res} from cache`);
            localStorage.removeItem(ls_key);
            dailyCache[language] = empty;
            return;
        }
        // Use the value from storage.
        dailyCache[language] = JSON.parse(ls_res);
    }
};

/** Get guessed words for the given game mode and language. */
export const get = (mode: Mode, language: Language) => {
    if (mode !== Mode.DAILY) { return []; }

    const languageCache = dailyCache[language];
    if (!languageCache) { return []; }
    return languageCache.guessed;
}

/** Cache a guessed word for a given game mode and language. */
export const push = (mode: Mode, language: Language, word: string) => {
    if (mode !== Mode.DAILY) { return; }

    dailyCache[language]?.guessed.push(word);
    localStorage.setItem(getLSKey(mode, language), JSON.stringify(dailyCache[language]));
}
