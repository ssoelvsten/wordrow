import './input-letter.scss';

export interface InputLetterProps {
  content: string;
  onClick?: () => void;
}

export const InputLetter = ({ content, onClick }: InputLetterProps) => {
  return (
    <div className={`Letter ${content ? '' : "Disabled"}`}
         onClick={() => { if (content && onClick) { onClick(); } }}
    >
      {content}
    </div>
  );
}

export default InputLetter;
