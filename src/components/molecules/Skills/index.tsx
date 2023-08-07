'use client';

import { useEffect, useState } from 'react';
import './style.scss'

import data from './data.json'
import SkillCard from '@/components/atomes/SkillCard';
import getTranslation from '@/utils/lang';
import Image from 'next/image';

const Skills = ({
    lang
}: {
    lang: string;
}) => {
    const [category, setCategory] = useState<string>('');
    const [width, setWidth] = useState(0);

    const updateDimension = () => setWidth(window.innerWidth);

    useEffect(() => {
      updateDimension();
      window.addEventListener("resize", updateDimension);

      return () => window.removeEventListener("resize", updateDimension);
    }, []);

    useEffect(() => {
        setCategory(Object.keys(data)[0]);
    }, []);

    return (
        <section className="skills" id="skills">
            <div>
                <div className="left">
                    <h1>{getTranslation(lang, 'skills--title')}</h1>
                    <p>{getTranslation(lang, 'skills--description')}</p>
                    <ul>
                        {Object.keys(data).map((key, index) => (
                            <li key={index} className={category === key ? 'active' : ''} onClick={() => setCategory(key)}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="right">
                    {Object.entries(data).filter(([key, value]) => key === category).map(([key, value]) => (
                        <ul key={key}>
                            {value.map((skill, index) => (
                                <SkillCard key={index} name={skill.name} star={skill.stars} />
                            ))}
                        </ul>
                    ))}
                    {/* <ProjectList category={'web'} /> */}
                </div>
            </div>
            <Image src='/assets/images/ribbon.svg' alt='ribbon' width={0} height={0} sizes='100vw' style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                marginTop: '100px'
            }} />
        </section>
    )
}

export default Skills;