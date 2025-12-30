import './popup-button.scss'

export interface PopUpButtonProps {
    key?: React.Key;
    text: string;
    onClick: () => void;
    highlight?: boolean;
}

const PopUpButton = ({ key, text, onClick, highlight }: PopUpButtonProps) =>
    <button key={key} className={`PopupButton ${highlight ? "Flip" : ""}`} onClick={onClick}>
        {text}
    </button>
;

export default PopUpButton;
