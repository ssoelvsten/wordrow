import React, { useEffect, useState } from 'react';

import { Language } from '../language';
import { SessionConfig, GetSessionConfig, Mode } from '../mode';
import { random } from '../random';

import Game, { GameReport } from './game';
import './session.scss';

export interface GameIndex {
    instances: number;
}

export interface GameInstance {
    anagrams: string[];
}

const JSONHeader = { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } };

export interface SessionProps {
  mode: Mode;
  language: Language;
}

const Session = ({ mode, language }: SessionProps) => {
  const sessionConfig: SessionConfig = GetSessionConfig(mode);

  const [accScore, setAccScore] = useState<number>(0);
  const [round, setRound] = useState<number | undefined>(sessionConfig.canRepick ? 1 : undefined);
  const [gameInstance, setGameInstance] = useState<GameInstance | undefined>(undefined);

  const fetchGame = () => {
    // Fetch from the index file for the desired language
    fetch(`dict/${language}/index.json`, JSONHeader)
      // Convert response as a GameIndex object
      .then((resp: Response) => resp.json())
      // Randomly choose an index
      .then((data: GameIndex) => sessionConfig.pick(data.instances))
      // Fetch specific game based on language and index
      .then((gameIdx: number) => fetch(`dict/${language}/${gameIdx}.json`, JSONHeader))
      // Convert response to GameInstance object
      .then((resp: Response) => resp.json())
      // Set gameInstance
      .then((data: GameInstance) => setGameInstance(data));
  };

  const fetchNextGame = (previousGame: GameReport) => {
    setGameInstance(undefined);
    setRound(previousGame.qualified ? (round as number) + 1 : 1);
    setAccScore(previousGame.qualified ? accScore + (previousGame.score || 0) : 0);
    fetchGame();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchGame, [/* Run once to get the first game */]);

  return (
    <>
      {gameInstance &&
        <div className="Session">
          <Game anagrams={gameInstance.anagrams}
            mode={mode}
            language={language}
            accScore={accScore}
            round={round}
            onRequestNextGame={sessionConfig.canRepick ? fetchNextGame : undefined} />
        </div>
      }
    </>
  );
}

export default Session;
