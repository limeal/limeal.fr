"use client";

import { RiExternalLinkLine } from "react-icons/ri";
import { AiFillGithub } from "react-icons/ai";

import "./style.scss";
import Image from "next/image";
import { useEffect, useState } from "react";
import Project from "@/interfaces/project";
import { useAuthContext } from "@/contexts/AuthContext";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);


  const { user } = useAuthContext();

  return (
    <div className="project-card">
      <Image
        src={project.thumbnail}
        alt={project.name}
        width={width < 728 ? 345 : 588}
        height={width < 728 ? 297 : 400}
        style={{
          borderRadius: "12px",
          objectFit: "cover",
          cursor: "pointer",
        }}
      />
      <div>
        <div className="metadata">
          <span>{project.release_date}</span>
          <h2>{user ? project.name.replace("Limeal", "Paul") : project.name}</h2>
        </div>
        {(project.github || project.external_link) && (
          <div className="links">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
              >
                <AiFillGithub />
              </a>
            )}
            {project.external_link && (
              <a
                href={project.external_link}
                target={project.external_link === "/" ? "_self" : "_blank"}
              >
                <RiExternalLinkLine />
              </a>
            )}
          </div>
        )}
      </div>
      <p>{project.description}</p>
    </div>
  );
};

export default ProjectCard;
