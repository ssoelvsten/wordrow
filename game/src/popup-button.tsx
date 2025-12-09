import './popup-button.scss'

export interface PopUpButtonProps {
    text: string;
    onClick: () => void;
    highlight?: boolean;
}

const PopUpButton = ({ text, onClick, highlight }: PopUpButtonProps) =>
    <button className={`PopupButton ${highlight ? "Flip" : ""}`} onClick={onClick}>
        {text}
    </button>
;

export default PopUpButton;
