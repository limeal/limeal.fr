import { RiExternalLinkLine } from 'react-icons/ri';

import "./style.scss";

interface ProjectCardProps {
  name: string;
  thumbnail: string;
  description: string;
  date: string;
  href: string;
}

export default ({
  name,
  thumbnail,
  description,
  date,
  href,
}: ProjectCardProps) => {
  return (
    <div className="project-card" onClick={() => window.open(href, "_blank")}>
      <img src={thumbnail} alt={name} />
      <div>
        <div>
          <span>{date}</span>
          <h2>{name}</h2>
        </div>
        <RiExternalLinkLine />
      </div>
      <p>{description}</p>
    </div>
  );
};
