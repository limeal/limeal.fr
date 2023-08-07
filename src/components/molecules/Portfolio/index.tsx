"use client";

import { useEffect, useState } from "react";

import "./style.scss";
import ProjectCard from "@/components/atomes/ProjectCard";
import getTranslation from "@/utils/lang";
import Project from "@/interfaces/project";

const ProjectsList = ({ projects }: { projects: Project[] }) => {
  return (
    <ul>
      {projects.map((project: Project, index: number) => (
        <li key={index}>
          <ProjectCard
            name={project.name}
            description={project.description}
            thumbnail={project.thumbnail}
            date={project.created_at}
            href={project.href}
          />
        </li>
      ))}
    </ul>
  );
};

export default ({ lang }: { lang: string }) => {
  const [category, setCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<any>();

  useEffect(() => {
    fetch(`/api/projects?category=${category}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "force-cache"
    })
      .then((response) => response.json())
      .then(({
        categories,
        projects
      }) => {
        setProjects(projects);
        setCategories(categories);
      })
      .catch((error) => setError(error));
  }, [category]);

  return (
    <section className="portfolio" id="portfolio">
      <div className="title">
        <h1>{getTranslation(lang, "portfolio--title")}</h1>
        <p>{getTranslation(lang, "portfolio--description")}</p>
      </div>
      <ul className="categories">
        {categories.map((name, index) => (
          <li
            key={index}
            className={category === name ? "active" : ""}
            onClick={() => setCategory(category === name ? "all" : name)}
          >
            {name.replace('_', ' ')}
          </li>
        ))}
      </ul>
      <div className="projects">
        {!error && projects.length > 0 ? (
          <ProjectsList projects={projects} />
        ) : (
          <p className="no-projects">
            {getTranslation(lang, "portfolio--error")}
          </p>
        )}
      </div>
    </section>
  );
};
