import { useEffect, useState } from 'react';
import Image from 'next/image';

import './style.scss';
import { splashPhrases } from '@/utils/constant';

export const Loading = () => {

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