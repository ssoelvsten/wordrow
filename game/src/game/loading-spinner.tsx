import React, { ReactElement } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faSolid from '@fortawesome/free-solid-svg-icons';

import { Language } from '../language';

import './loading-spinner.scss';

interface LoadingSpinnerProps {
    language: Language
}

const LoadingSpinner = ({ language }: LoadingSpinnerProps) => {
    let loadingText: ReactElement = <></>;
    switch (language) {
        case Language.DK: loadingText = <>Tjek din internetforbindelse</>; break;
        case Language.DE: loadingText = <>Bitte prüfen Sie Ihre Internetverbindung</>; break;
        case Language.EN: loadingText = <>Please check your network connection</>; break;
        case Language.ES: loadingText = <>Por favor, comprueba tu conexión de red</>; break;
        default:
            throw new Error(`Unknown Language: ${language}`);
    }

    return (
        <div className="LoadingSpinner">
            <div className="Spinner">
                <FontAwesomeIcon icon={faSolid.faSpinner} spinPulse />
            </div>

            <div className="Text">{loadingText}</div>
        </div>
    );
}

export default LoadingSpinner;
