import './input-button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface InputButtonProps {
  icon: any; /* FontAwesome.IconProp */
  onClick?: () => void;
}

export const InputButton = ({ icon, onClick }: InputButtonProps) => {
  return (
    <div className="Button" onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
}

export default InputButton;
