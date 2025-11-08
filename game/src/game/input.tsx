import './input.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface InputLetterProps {
  content: string;
  onClick?: () => void;
}

export const InputLetter = ({ content, onClick }: InputLetterProps) => {
  return (
    <div className={`Input Letter ${content ? '' : "Disabled"}`}
      onClick={() => { if (content && onClick) { onClick(); } }}>
      {content}
    </div>
  );
}

export interface InputButtonProps {
  icon: any; /* FontAwesome.IconProp */
  onClick?: () => void;
}

export const InputButton = ({ icon, onClick }: InputButtonProps) => {
  return (
    <div className="Input Button" onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
}
