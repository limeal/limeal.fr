'use client';

import { updateProjects } from "@/firebase/firestore";

import "./style.scss";
import ProjectCard from "../ProjectCard";
import { useEffect, useState } from "react";

export default ({ category }: { category: string }) => {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    updateProjects(category, setProjects);
  }, [category]);

  return (
    <ul>
      {projects.map((project, index) => (
        <li key={index}>
          <ProjectCard
            title={project.data().title}
            description={project.data().description}
            thumbnail={project.data().image}
            year={project.data().year}
            link={project.data().link}
          />
        </li>
      ))}
    </ul>
  );
};
