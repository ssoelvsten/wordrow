import { normalize } from "./string-util";

export enum Language {
    DK = "da-DK",
    DE = "de-DE",
    EN = "en-US",
    ES = "es-ES",
}

export const languages: Language[] = [
    Language.EN,
    Language.ES,
    Language.DE,
    Language.DK,
];

export const languageName = (lang: Language) => {
    switch (lang) {
    case Language.DK: return "Dansk";
    case Language.DE: return "Deutsch";
    case Language.EN: return "English";
    case Language.ES: return "Español"
    }
}

/** Obtain the index of a character's frequency in a language; larger values means the are used less. */
export const frequency = (lang: Language, char: string) => {
    switch (lang) {
    case Language.DK:
        // https://spjdrpedia.dk/wiki/Frekvensanalyse
        const chars = ['e', 'r', 'n', 'd', 't', 'a', 's', 'i', 'l', 'g', 'o', 'm', 'k', 'v', 'f', 'h', 'u', 'b', 'p', 'j', 'å', 'æ', 'ø', 'y', 'c', 'w', 'x', 'z', 'q'];
        return chars.indexOf(char);
    case Language.DE: {
        // https://de.wikipedia.org/wiki/Buchstabenh%C3%A4ufigkeit
        const chars = ['e', 'n', 'i', 's', 'r', 'a', 't', 'd', 'h', 'u', 'l', 'c', 'g', 'm', 'o', 'b', 'w', 'f', 'k', 'z', 'p', 'v', 'ß', 'j', 'y', 'x', 'q'];
        return chars.indexOf(normalize(char));
    }
    case Language.EN: {
        // https://en.wikipedia.org/wiki/Letter_frequency
        const chars = ['e', 's', 'i', 'a', 'r', 'n', 't', 'o', 'l', 'c', 'd', 'u', 'g', 'p', 'm', 'h', 'b', 'y', 'f', 'v', 'k', 'w', 'z', 'x', 'j', 'q'];
        return chars.indexOf(char);
    }
    case Language.ES: {
        // https://es.wikipedia.org/wiki/Frecuencia_de_aparici%C3%B3n_de_letras
        const chars = ['e', 'a', 'o', 's', 'r', 'n', 'i', 'd', 'l', 'c', 't', 'u', 'm', 'p', 'b', 'g', 'y', 'v', 'q', 'h', 'f', 'z', 'j', 'ñ', 'x', 'k', 'w'];
        return chars.indexOf(normalize(char));
    }
    default:
        throw new Error(`Unknown Language: ${lang}`);
    }
}