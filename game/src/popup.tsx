import { ReactElement } from 'react';
import './popup.scss'
import PopUpButton, { PopUpButtonProps } from './popup-button';

export interface PopupProps {
    buttons?: PopUpButtonProps[];
    className?: string;
    children: ReactElement;
}

const Popup = ({ buttons, children }: PopupProps) =>
    <div className="Popup">
        <div className="Children">
            {children}
        </div>
        <div className="Buttons">
            {buttons && buttons.map(PopUpButton)}
        </div>
    </div>
;

export default Popup;
