"use client";

import { RiExternalLinkLine } from "react-icons/ri";
import { AiFillGithub, AiFillDelete } from "react-icons/ai";

import "./style.scss";
import Image from "next/image";
import { useEffect, useState } from "react";
import Project from "@/interfaces/project";
import { useAuthContext } from "@/contexts/AuthContext";
import { deleteProject } from "@/firebase/firestore";
import { toast } from "react-toastify";

interface ProjectCardProps {
  project: Project;
  refresh: () => void;
}

const ProjectCard = ({ project, refresh }: ProjectCardProps) => {
  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const { user } = useAuthContext();

  const handleDelete = (e: any) => {
    e.preventDefault();
    deleteProject(project.thumbnail.ref, project.id || "")
      .then(() => {
        toast.success(`Project ${project.name} deleted !`);
        refresh();
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  return (
    <div className="project-card">
      <div className="thumbnail">
        <Image
          src={project.thumbnail.url || "/assets/images/no-image.png"}
          alt={project.name}
          width={width < 728 ? 345 : 588}
          height={width < 728 ? 297 : 400}
          style={{
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
        {user && user.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
          <button onClick={(e) => handleDelete(e)}>
            <AiFillDelete />
          </button>
        )}
      </div>
      <div className="content">
        <div className="metadata">
          <span>{project.release_date}</span>
          <h2>
            {user ? project.name.replace("Limeal", "Paul") : project.name}
          </h2>
        </div>
        {(project.github || project.external_link) && (
          <div className="links">
            {project.github && (
              <a href={project.github} target="_blank">
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
