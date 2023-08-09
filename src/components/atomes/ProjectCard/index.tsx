"use client";

import { RiExternalLinkLine } from 'react-icons/ri';
import { AiFillGithub } from "react-icons/ai";

import "./style.scss";
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ProjectCardProps {
  name: string;
  thumbnail: string;
  description: string;
  date: string;
  href: string;
}

const ProjectCard = ({
  name,
  thumbnail,
  description,
  date,
  href,
}: ProjectCardProps) => {
  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);


  return (
    <div className="project-card" onClick={() => window.open(href, "_blank")}>
      <Image src={thumbnail} alt={name} width={width < 728 ? 345 : 588} height={width < 728 ? 297 : 400} style={{
        borderRadius: '12px',
        objectFit: 'cover',
        cursor: 'pointer'
      }} />
      <div>
        <div>
          <span>{date}</span>
          <h2>{name}</h2>
        </div>
        {href.indexOf('github.com') >= 0 ? <AiFillGithub /> : <RiExternalLinkLine/>}
      </div>
      <p>{description}</p>
    </div>
  );
};

export default ProjectCard;