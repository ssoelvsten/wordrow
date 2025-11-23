import { Language } from "../language";
import { Mode } from "../mode";

// ----------------------------------------------------------------------------
// Data Types

/** Every guessed word with the hints given. */
type Guess = { word: string, hints: string };

/** Each cache entry's value. */
class Value {
    hints: [number, number] | undefined;
    guessed: Guess[];

    constructor(hints: [number, number] | undefined, guessed: Guess[]) {
        this.hints = hints;
        this.guessed = guessed;
    }
};

/** Cache entries, key and value. */
type Entry = [string, Value];

/** Cache for the daily challenge */
const dailyCache: { [lang in Language]: [string, Value] | undefined} = {
    [Language.DK]: undefined,
    [Language.DE]: undefined,
    [Language.EN]: undefined,
    [Language.ES]: undefined,
};

// ----------------------------------------------------------------------------
// Local Storage

type LSGuess = [string, string];

/** Derive keys for a certain game mode and language. */
const getLSKeys = (mode: Mode, language: Language) => {
    const base = `${mode}:${language}`;
    return {
        id: `${base}:key`,
        hints: `${base}:hints`,
        guessed: `${base}:guessed`,
    };
};

function toLSHints(h: [number, number]) : string {
    return JSON.stringify(h);
}

function fromLSHints(str: string) : [number, number] | undefined{
    const h = JSON.parse(str);

    if (!Array.isArray(h) || h.length !== 2 || !Number.isInteger(h[0]) || !Number.isInteger(h[1])) {
        return undefined;
    }

    return h as [number, number];
}

function toLSGuessed(gs: Guess[]) : string {
    const str : LSGuess[] = gs.map(g => [g.word, g.hints]);
    return JSON.stringify(str);
}

function fromLSGuessed(str: string | null) : Guess[] | undefined {
    if (!str) { return undefined; }

    const gs = JSON.parse(str);

    const isString = (o: any) => typeof o === 'string' || o instanceof String;
    if (Array.isArray(gs) &&
        gs.find(g => Array.isArray(g) &&
                g.length === 2 &&
                isString(g[0] && isString(g[1]))) !== undefined) {
        return undefined;
    }

    return gs.map((g: LSGuess) => ({ word: g[0], hints: g[1] }));
}

// ----------------------------------------------------------------------------
// Interface

/** Clear the cache for a certain game and language */
export function clear(mode: Mode, language: Language, id: string) : void {
    if (mode !== Mode.DAILY) { return; }

    const ls_keys = getLSKeys(mode, language);
    for (let key of Object.keys(ls_keys)) {
        localStorage.removeItem(key)
    }
    localStorage.setItem(getLSKeys(mode, language).id, id);
    const empty = [id, new Value(undefined, [])] as Entry;
    dailyCache[language] = empty
}

/** Setup the cache for a certain game mode and language. This flushes the cache if the game is a
 *  different one than the one that was cached. */
export function setup(mode: Mode, language: Language, words: string[] | undefined) : void {
    if (!words) { return; }
    if (mode !== Mode.DAILY || !words) { return; }

    const gameId = words[words.length-1];

    const c = dailyCache[language];
    if (!c || c[0] !== gameId) {
        // Check local storage is empty or for another game.
        const ls_keys = getLSKeys(mode, language);
        const ls_id = localStorage.getItem(ls_keys.id);
        if (!ls_id || ls_id !== gameId) {
            return clear(mode, language, gameId);
        }
        // Check whether the value is old (does not match `CacheEntry`) and should be ignored. This
        // resolves the webpage from breaking when the local storage contains unmigrated data.
        const ls_hints = localStorage.getItem(ls_keys.hints);
        const hints = ls_hints ? fromLSHints(ls_hints) : undefined;

        const ls_guessed = localStorage.getItem(ls_keys.guessed);
        const guessed = fromLSGuessed(ls_guessed);
        if (!guessed) {
            return clear(mode, language, gameId);
        }

        // Use the value from storage.
        dailyCache[language] = [gameId, new Value(hints, guessed)];
    }
};

/** Get guessed words for the given game mode and language. */
export function get(mode: Mode, language: Language) : Value | undefined {
    if (mode !== Mode.DAILY) { return undefined; }

    const c = dailyCache[language]
    if (!c) { return undefined; }
    return c[1];
}

/** Cache state of hints given. */
export function pushHints(mode: Mode, language: Language, hints: [number, number]) : void {
    let kv;
    switch (mode) {
    case Mode.DAILY: kv = dailyCache[language]; break;
    default:
        return;
    }
    if (!kv) { throw Error("Key-value pair is undefined"); }

    const e = kv[1];
    e.hints = hints;
    localStorage.setItem(getLSKeys(mode, language).hints, toLSHints(hints));
}

/** Add a new successful guess to the cached guess history. */
export function pushGuess(mode: Mode, language: Language, guess: Guess) : void {
    let kv;
    switch (mode) {
    case Mode.DAILY: kv = dailyCache[language]; break;
    default:
        return;
    }
    if (!kv) { throw Error("Key-value pair is undefined"); }

    const e = kv[1];
    e.guessed.push(guess);
    localStorage.setItem(getLSKeys(mode, language).guessed, toLSGuessed(e.guessed));

}
