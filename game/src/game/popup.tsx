import { ReactElement } from "react";
import { Language } from "../language";
import Popup from "../popup";

interface GamePopupProps {
    onNo: () => void;
    onYes: () => void;
    language: Language;
    children: ReactElement;
}

const GamePopup = ({ onYes, onNo, children, language }: GamePopupProps) => {
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

    return (
        <Popup buttons={[
            { text: nText, onClick: onNo },
            { text: yText, onClick: onYes, highlight: true }
        ]}>
            {children}
        </Popup>
    );
};

export default GamePopup;
