import React, { ReactElement, useContext, useEffect, useRef } from 'react';
import useSound from 'use-sound';

import { Modes, Mode, GetModeName } from '../mode';
import { Language, languages } from '../language';
import { SoundContext, soundKey, soundMap, soundPath } from '../sound';

import Flag from './flag';
import NamedSelect from './named-select';

import './menu.scss';

export interface MenuProps {
  mode: Mode;
  setMode: (d: Mode) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  startGame: () => void;
}

const Menu = ({ mode, setMode, language, setLanguage, startGame }: MenuProps) => {
  const mayBegin = language !== undefined && mode !== undefined;

  // ------------------------------------------------------------------------
  // Sound
  const [play] = useSound(soundPath, { sprite: soundMap, soundEnabled: useContext(SoundContext) });
  const soundKey : soundKey = "button";

  // ------------------------------------------------------------------------
  // MENU LOGIC
  const actionLanguage = (l: Language) => {
    play({ id: soundKey });
    setLanguage(l);
  }

  const actionMode = (d: Mode) => {
    play({ id: soundKey });
    setMode(d);
  }

  const actionStartGame = () => {
    if (mayBegin) {
      play({ id: soundKey });
      startGame();
    }
  }

  // ------------------------------------------------------------------------
  // KEY LISTENER
  const onKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case " ": {
        const nextMode = mode
          ? (Modes.indexOf(mode) + 1) % Modes.length
          : 0;
        actionMode(Modes[nextMode]);
        break;
      }
      case "Backspace": break;
      case "Escape": break;
      case "Enter": {
        actionStartGame();
        break;
      }
      default:
        const idx: number = parseInt(e.key);
        if (idx && 0 < idx && idx <= languages.length) {
          actionLanguage(languages[idx - 1]);
        }
        break;
    }
  }

  // ------------------------------------------------------------------------
  // TRANSLATIONS
  let start_text: ReactElement = <></>;
  let select_language: ReactElement = <></>;
  let select_mode: ReactElement = <></>;

  switch (language) {
    case Language.DK:
      start_text = <><b> Klik her </b> eller <b> tryk enter </b> for at starte.</>
      select_language = <>Sprog</>;
      select_mode = <>Spiltype</>
      break;
    case Language.DE:
      start_text = <><b> Klicken sie hier </b> oder <b> drücken sie die Eingabeteste, </b> um zu beginnen.</>
      select_language = <>Sprache</>;
      select_mode = <>Spielmodus</>
      break;
    case Language.EN:
      start_text = <><b> Click here </b> or <b> press enter </b> to start.</>
      select_language = <>Language</>;
      select_mode = <>Game Mode</>;
      break;
    case Language.ES:
      start_text = <><b> Haz click aquí </b> o <b> pulsa Intro </b> para comenzar.</>
      select_language = <>Idioma</>;
      select_mode = <>Modo de juego</>;
      break;
    default:
      throw new Error(`Unknown Language: ${language}`);
  }

  // ------------------------------------------------------------------------
  // VISUAL

  // Focus on the component (for onKey listener) after the initial draw.
  // https://stackabuse.com/how-to-set-focus-on-element-after-rendering-with-react/
  const divRef = useRef<any>(null);
  useEffect(() => { divRef.current.focus(); }, []);

  return (
    <div className="Menu" tabIndex={0} onKeyDown={onKey} ref={divRef}>
      <div className="Dummy" />
      <div className="GameTitle" >
        {'wordrow'.split('').map((c, i) => <div className="Letter" key={i}>{c}</div>)}
      </div>

      <div className="MenuSection"> {select_language} </div>
      <div className="LanguageSelection">
        {languages.map((lang, idx) => <Flag language={lang}
          index={idx + 1} key={idx}
          selected={lang === language}
          onClick={() => actionLanguage(lang)} />)}
      </div>

      <div className="MenuSection"> {select_mode} </div>
      <div className="GameTypeSelection">
        {Modes.map((d, i) => <NamedSelect text={GetModeName(d, language)}
          selected={d === mode}
          onClick={() => actionMode(d)}
          key={i} />)}
      </div>
      <div className="StartGame" onClick={actionStartGame}>
        {start_text}
      </div>
      <div className="Dummy" />
    </div>
  );
}

export default Menu;
