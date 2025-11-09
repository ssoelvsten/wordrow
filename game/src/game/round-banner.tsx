import React, { ReactElement } from 'react';
import './round-banner.scss';
import { Language } from '../language';

interface RoundBannerProps {
    language: Language;
    round: number;
}

const RoundBanner = ({ language, round }: RoundBannerProps) => {
    let roundText: ReactElement = <></>;
    if (round) {
        switch (language) {
            case Language.DK: roundText = <>Runde {round}</>; break;
            case Language.DE: roundText = <>Runde {round}</>; break;
            case Language.EN: roundText = <>Round {round}</>; break;
            case Language.ES: roundText = <>Ronda {round}</>; break;
            default:
                throw new Error(`Unknown Language: ${language}`);
        }
    }

    return (
        <div className="RoundBanner">
            <div className="Content">{roundText}</div>
        </div>
    );
}

export default RoundBanner;