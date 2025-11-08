import React, { useEffect, useState } from 'react';
import useSound from 'use-sound';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as faRegular from '@fortawesome/free-regular-svg-icons'
import * as faSolid from '@fortawesome/free-solid-svg-icons'

import { Language } from './language';
import { Mode } from './mode';
import { SoundContext, soundKey, soundMap, soundPath } from './sound';
import Session from './game/session';
import Menu from './menu/menu';

import './app.scss';

const LS_KEYS = {
  DarkMode: "DarkMode",
  Mode: "Mode",
  HasPlayed: "HasPlayed",
  Language: "Language",
  Sound: "Sound",
};

const App = () => {
  // ------------------------------------------------------------------------
  // USER SETTINGS
  const [darkMode, setDarkMode] = useState<boolean>(
    () => {
      // Consult local storage for state from previous page
      const ls_res = localStorage.getItem(LS_KEYS.DarkMode);
      if (ls_res) { return ls_res === "true"; }

      // Ask browser, whether it wants to use dark mode
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  );

  const [sound, setSound] = useState<boolean>(
    () => {
      // Consult local storage for state from previous page
      const ls_res = localStorage.getItem(LS_KEYS.DarkMode);
      if (ls_res) { return ls_res === "true"; }

      // Ask browser, whether it wants to use dark mode
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  );

  const [language, setLanguage] = useState<Language>(
    () => {
      // Consult local storage for state from previous page
      const ls_res = localStorage.getItem(LS_KEYS.Language);
      if (ls_res) { return ls_res as Language; }

      // Otherwise, just leave it unchecked
      return Language.EN;
    }
  );

  const [mode, setMode] = useState<Mode>(
    () => {
      // Consult local storage for state from previous page
      const ls_res = localStorage.getItem(LS_KEYS.Mode);
      if (ls_res) { return ls_res as Mode; }

      // Otherwise, just leave it unchecked
      return Mode.UNLIMITED;
    }
  );

  const [inGame, setInGame] = useState<boolean>(() => {
    // Go directly into a game, if settings have already been set
    const ls_res = localStorage.getItem(LS_KEYS.HasPlayed);
    return ls_res !== null;
  });

  // ------------------------------------------------------------------------
  // SAVE USER SETTINGS
  const updateLocalStorage = () => {
    localStorage.setItem(LS_KEYS.DarkMode, `${darkMode}`);
    localStorage.setItem(LS_KEYS.Sound, `${sound}`);
    if (language !== undefined) {
      localStorage.setItem(LS_KEYS.Language, language);
    }
    if (mode !== undefined) {
      localStorage.setItem(LS_KEYS.Mode, mode);
    }
  }

  useEffect(updateLocalStorage, [darkMode, sound, language, mode]);

  useEffect(() => {
    if (inGame) { localStorage.setItem(LS_KEYS.HasPlayed, "true"); }
  }, [inGame]);

  // ------------------------------------------------------------------------
  // Sound
  const [play] = useSound(soundPath, { sprite: soundMap, /*soundEnabled: sound*/ });
  const soundKey : soundKey = "button";

  // ------------------------------------------------------------------------
  // VISUAL
  return (
    <div className={`App ${darkMode ? "DarkMode" : ""}`}>
      <SoundContext.Provider value={sound}>
        {!inGame &&
          <Menu language={language} setLanguage={setLanguage}
            mode={mode} setMode={setMode}
            startGame={() => setInGame(true)} />
        }
        {inGame && language && mode &&
            <Session mode={mode} language={language} />
        }
        <div className="TopButtons Left">
          <button className="Button" disabled={!inGame}
            onClick={() => {
              if (sound) { play({ id: soundKey }); }
              setInGame(false)
          }}>
            <FontAwesomeIcon icon={faSolid.faCaretLeft} />
          </button>
          <button className="Button" onClick={() => {
            if (sound) { play({ id: soundKey }); }
            setDarkMode(!darkMode);
          }}>
            <FontAwesomeIcon icon={darkMode ? faSolid.faMoon : faRegular.faMoon} />
          </button>
          <button className="Button" onClick={() => {
            if (!sound) { play({ id: soundKey }); }
            setSound(!sound);
          }}>
            <FontAwesomeIcon icon={sound ? faSolid.faVolumeHigh : faSolid.faVolumeXmark!} />
          </button>
        </div>
      </SoundContext.Provider>
    </div>
  );
}

export default App;
