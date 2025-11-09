import { Language } from "../language";
import { Mode } from "../mode";

type WordState = { word: string, hints: number };

class Value {
    hints: number;
    guessed: WordState[];

    constructor() {
        this.hints = 0;
        this.guessed = [];
    }
};

type Entry = [string, Value];

type LSValue = [number, [string, number][]];
type LSEntry = [string, LSValue];

function isLSCacheEntry (obj: any) : obj is LSEntry {
    if (!obj || !Array.isArray(obj)) { return false; }
    const [key, entry] = obj;

    // Test Key
    if (!key || typeof key !== "string") { return false;}

    // Test value
    if (!entry) { return false;}
    if (!Number.isInteger(entry[0])) { return false; }

    if (!Array.isArray(entry[1])) { return false; }
    for (let e of entry[1]) {
        if (!Array.isArray(e)) { return false; }
        if (typeof e[0] !== "string") { return false; }
        if (!Number.isInteger(e[1])) { return false;}
    }
    return true;
}

const fromLS = ([key, [hints, guessed]]: LSEntry) => {
    return [key, {
                    hints,
                    guessed: guessed.map(([word, hints]) => ({ word, hints }))
                 }
            ] as Entry;
}

const toLS = ([key, entry]: Entry) => {
    return [key, [entry.hints, entry.guessed.map(e => [e.word, e.hints])]] as LSEntry;
}

const dailyCache: { [lang in Language]: [string, Value] | undefined} = {
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
    const empty = [key, new Value()] as Entry;

    const c = dailyCache[language];
    if (!c || c[0] !== key) {
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
        if (!isLSCacheEntry(ls_obj)) {
            console.log(`purging ${ls_res} from cache`);
            localStorage.removeItem(ls_key);
            dailyCache[language] = empty;
            return;
        }
        // Use the value from storage.
        dailyCache[language] = fromLS(JSON.parse(ls_res));
    }
};

/** Get guessed words for the given game mode and language. */
export const get = (mode: Mode, language: Language) => {
    if (mode !== Mode.DAILY) { return new Value(); }

    const c = dailyCache[language]
    if (!c) { return new Value() }
    return c[1];
}

/** Cache a hint or guessed word for a given game mode and language. */
export const push = (mode: Mode, language: Language, hints: number, wordState?: WordState) => {
    if (mode !== Mode.DAILY) { return; }

    const c = dailyCache[language];
    if (!c) { return; }
    const entry = c[1];
    entry.hints = hints;
    if (wordState) { entry.guessed.push(wordState); }
    localStorage.setItem(getLSKey(mode, language), JSON.stringify(toLS(c)));
}
