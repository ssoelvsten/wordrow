import { forwardRef } from "react";
import { Language } from "../language";
import GamePopup from "./popup";

interface EndPopupProps {
    onYes: () => void;
    onNo: () => void;
    language: Language
}

const EndPopup = forwardRef(({ onYes, onNo, language }: EndPopupProps, ref: React.ForwardedRef<any>) => {
    let text = <></>;

    switch (language) {
        case Language.DK:
            text = <>
                Vil du virkelig gerne afslutte det nuværende spil? Hvis du
                endnu ikke har gættet ét af ordene med alle bogstaver, så vil
                du miste de point, som du har samlet sammen!
            </>;
            break;
        case Language.DE:
            text = <>
                Möchten Sie wirklich das Spiel beenden? Wenn Sie noch kein Wort
                mit allen Buchstaben erraten haben, werden Sie alle Punkte
                verlieren, die Sie bisher gesammelt haben.
            </>;
            break;
        case Language.EN:
            text = <>
                Do you really want to end the current game? If you have not yet
                guessed a word with all letters, then you will loose all the
                points you have accumulated!
            </>;
            break;
        case Language.ES:
            text = <>
                ¿Quieres terminar la partida? Si no has acertado al menos una de
                las palabras con todas las letras, perderás todos los puntos que
                hayas acumulado.
            </>;
            break;
    }

    return <GamePopup ref={ref} onYes={onYes} onNo={onNo} language={language}>
        {text}
    </GamePopup>;
});

export default EndPopup;
