import { forwardRef, ReactElement } from 'react';
import './popup.scss'
import PopUpButton, { PopUpButtonProps } from './popup-button';

export interface PopupProps {
    buttons?: PopUpButtonProps[];
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<Element>) => void;
    children: ReactElement;
}

const Popup = forwardRef(({ buttons, className, onKeyDown, children }: PopupProps, ref: React.ForwardedRef<any>) =>
    <div className={`Popup ${className}`} tabIndex={0} onKeyDown={onKeyDown} ref={ref}>
        <div className="Children">
            {children}
        </div>
        <div className="Buttons">
            {buttons && buttons.map((p, i) => ({ ...p, key: i })).map(PopUpButton)}
        </div>
    </div>
);

export default Popup;
