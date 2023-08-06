import { RiExternalLinkLine } from 'react-icons/ri';

import "./style.scss";

interface ProjectCardProps {
  thumbnail: string;
  title: string;
  description: string;
  year: number;
  link: string;
}

export default ({
  thumbnail,
  title,
  description,
  year,
  link,
}: ProjectCardProps) => {
  return (
    <div className="project-card" onClick={() => window.open(link, "_blank")}>
      <img src={thumbnail} alt={title} />
      <div>
        <div>
          <span>{year}</span>
          <h2>{title}</h2>
        </div>
        <RiExternalLinkLine />
      </div>
      <p>{description}</p>
    </div>
  );
};
