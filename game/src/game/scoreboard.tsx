import React, { useEffect, useState } from "react";
import { Language } from "../language";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faSolid from '@fortawesome/free-solid-svg-icons'
import * as faRegular from '@fortawesome/free-regular-svg-icons'
import './scoreboard.scss';

export interface ScoreBoardProps {
    endTime: number;
    gameEnd: boolean;
    language: Language;
    qualified: boolean;
    score: number;
    round: number;
    onTimeout: () => void;
};

const ScoreBoard = ({ endTime, gameEnd, language, qualified, round, score, onTimeout }: ScoreBoardProps) => {
    const isTimed: boolean = endTime !== Infinity && !isNaN(endTime);

    // ------------------------------------------------------------------------
    // Clock Ticking and Formatting

    const [currTime, setCurrTime] = useState(() => new Date().getTime());

    const formatTimeleft = () => {
        const timeLeft = endTime - currTime;
        if (timeLeft < 0) return "00:00:000";

        const millis = Math.floor(timeLeft % 1000);
        const seconds = Math.floor((timeLeft / 1000) % 60);
        const minutes = Math.floor((timeLeft / 1000) / 60);

        return `${minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })
            }:${seconds.toLocaleString(undefined, { minimumIntegerDigits: 2 })
            }:${millis.toLocaleString(undefined, { minimumIntegerDigits: 3 })
            }`;
    };

    useEffect(() => {
        if (!isTimed || gameEnd) return;

        const timerId = setInterval(() => {
            const tick = new Date().getTime();
            setCurrTime(tick);
        }, 50);
        return () => clearInterval(timerId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameEnd]);

    useEffect(() => {
        if (!isTimed || gameEnd) return;

        const timeLeft = endTime - currTime;
        if (timeLeft < 0) onTimeout();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currTime]);

    const timeLeft = endTime - currTime;
    const timeAlarm: boolean = 0 < timeLeft && timeLeft < 10 * 1000;

    // ------------------------------------------------------------------------
    // VISUAL

    return (
        <div className="ScoreBoard">
            {isTimed &&
                <div className={`Time ${timeAlarm ? "Alarm" : ""}`}>{formatTimeleft()}</div>
            }
            <div className="RoundNumber">
                {isTimed && <div className="Bar">|</div>}
                <FontAwesomeIcon icon={qualified ? faSolid.faFlag : faRegular.faFlag} flip={"horizontal"} />
                {round}
                <FontAwesomeIcon icon={qualified ? faSolid.faFlag : faRegular.faFlag} />
                <div className="Bar">|</div>
            </div>
            <div className="Score">{Math.round(score).toLocaleString(language, { minimumIntegerDigits: 7 })}</div>
        </div>
    );
}

export default ScoreBoard;
