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
