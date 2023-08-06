import { AiFillStar } from 'react-icons/ai'; 

import './style.scss';

export default ({
    name,
    star
}: {
    name: string;
    star: number;
}) => {
    return (
        <div className="skill-card">
            <span>{name}</span>
            <div>
                <AiFillStar />
                <span>{star}</span>
            </div>
        </div>
    )
}