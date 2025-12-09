import { Language } from "../language";
import GamePopup from "./popup";

interface HintPopupProps {
    onYes: () => void;
    onNo: () => void;
    language: Language
}

const HintPopup = ({ onYes, onNo, language }: HintPopupProps) => {
    let text = <></>;

    switch (language) {
        case Language.DK:
            text = <>
                Vil du gerne have et tip? Hvis ja, så afslører vi ét af
                bogstaverne og dets position i alle resterende ord, men du vil
                så få færre point for at gætte dem.
            </>
            break;
        case Language.DE:
            text = <>
                Möchten Sie gerne einen Hinweis? Falls ja, können wir einen der
                Buchstaben und seine Position in allen Wörtern auflösen. Das
                wird allerdings dazu führen, dass Sie weniger Punkte erhalten,
                wenn Sie ein Wort mit aufgelösten Buchstaben erraten.
            </>
            break;
        case Language.EN:
            text = <>
                Do you want to get a hint? If yes, then we will reveal one of
                the six letters across all remaining words. But, you will gain
                fewer points for guessing words with hinted letters.
            </>
            break;
        case Language.ES:
            text = <>
                ¿Quieres una pista? Si quieres, revelaremos una de las seis
                letras en todas las palabras restantes. Pero acertar estas
                palabras te dará menos puntos
            </>
            break;
    }

    return <GamePopup onYes={onYes} onNo={onNo} language={language}>
        {text}
    </GamePopup>;
};

export default HintPopup;
