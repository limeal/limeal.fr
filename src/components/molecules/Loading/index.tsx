import { useEffect, useState } from 'react';
import Image from 'next/image';

import './style.scss';

export const Loading = () => {

    const splashPhrases = [
        // Invent some phrase that can be displayed insteed of login
        "Loading...",
        "This website is so awesome, his need time to load",
        "I'm not a human, I'm a bot that what she said",
        "Don't drink before breakfast, i say this because i already did",
        "2023 is the year of the linux desktop",
        "Matter of fact, the moon is a hologram",
        "Don't think just do it",
        "Elon Musk is a reptilian",
    ];

    const [text, setText] = useState(splashPhrases[0]);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(splashPhrases[(i % splashPhrases.length) + 1]);
            i++;
        }, 400);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading">
            <Image src="/assets/images/logo.png" alt="logo" width={100} height={100} />
            <p>{text}</p>
        </div>
    )
}