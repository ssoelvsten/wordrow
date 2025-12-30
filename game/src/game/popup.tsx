import { forwardRef, ReactElement } from "react";
import { Language } from "../language";
import Popup from "../popup";

interface GamePopupProps {
    onNo: () => void;
    onYes: () => void;
    language: Language;
    children: ReactElement;
}

const GamePopup = forwardRef(({ onYes, onNo, children, language }: GamePopupProps, ref: React.ForwardedRef<any>) => {
    // --------------------------------------------------------------------------------------------
    // Button Translations
    let nText = "";
    let yText = "";

    switch (language) {
        case Language.DK:
            nText = "nej";
            yText = "ja";
            break;
        case Language.DE:
            nText = "nein";
            yText = "ja";
            break;
        case Language.EN:
            nText = "no";
            yText = "yes";
            break;
        case Language.ES:
            nText = "nie";
            yText = "áno";
            break;
    }

    // --------------------------------------------------------------------------------------------
    // KEY LISTENER

    /** Key listener for pop up keyboard interactions. */
    const onKey = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "Escape":
            case "n":
                onNo(); break;
            case "Enter":
            case "j":
            case "y":
            case "a":
                onYes(); break;
            default:
                break;
        }
    }

    // --------------------------------------------------------------------------------------------
    // VISUAL
    return (
        <Popup ref={ref} onKeyDown={onKey} buttons={[
            { text: nText, onClick: onNo },
            { text: yText, onClick: onYes, highlight: true }
        ]}>
            {children}
        </Popup>
    );
});

export default GamePopup;
