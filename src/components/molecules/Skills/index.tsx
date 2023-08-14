'use client';

import { useEffect, useState } from 'react';
import './style.scss'

import data from './data.json'
import SkillCard from '@/components/atomes/SkillCard';
import Image from 'next/image';
import { useLangContext } from '@/contexts/LangContext';

const Skills = () => {
    const [category, setCategory] = useState<string>('');

    const { getTranslation } = useLangContext();

    useEffect(() => {
        setCategory(Object.keys(data)[0]);
    }, []);

    return (
        <section className="skills" id="skills">
            <div>
                <div className="left">
                    <h1>{getTranslation('skills--title')}</h1>
                    <p>{getTranslation('skills--description')}</p>
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