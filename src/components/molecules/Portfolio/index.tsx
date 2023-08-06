"use client";

import { useEffect, useState } from "react";

import data from "./data.json";

import "./style.scss";
import ProjectCard from "@/components/atomes/ProjectCard";
import getTranslation from "@/utils/lang";

const ProjectsList = ({ projects }: { projects: any }) => {
  return (
    <>
      {projects.map(([_, value]: [string, any], index: number) => (
        <ul key={index}>
          {value.map((project: any, index: number) => (
            <li key={index}>
              <ProjectCard
                title={project.title}
                description={project.description}
                thumbnail={project.thumbnail}
                year={project.year}
                link={project.link}
              />
            </li>
          ))}
        </ul>
      ))}
    </>
  );
};

export default ({ lang }: { lang: string }) => {
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    setCategory(Object.keys(data)[0]);
  }, []);

  return (
    <section className="portfolio" id="portfolio">
      <div className="title">
        <h1>{getTranslation(lang, 'portfolio--title')}</h1>
        <p>
          {getTranslation(lang, 'portfolio--description')}
        </p>
      </div>
      <ul className="categories">
        {Object.keys(data).map((key, index) => (
          <li
            key={index}
            className={category === key ? "active" : ""}
            onClick={() => setCategory(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </li>
        ))}
      </ul>
      <div className="projects">
        {Object.entries(data).filter(([key, value]) => key === category && value.length > 0).length > 0 ? (
          <ProjectsList
            projects={Object.entries(data).filter(
              ([key, value]) => key === category
            )}
          />
        ) : (
          <p className="no-projects">{getTranslation(lang, 'portfolio--error')}</p>
        )}
      </div>
    </section>
  );
};
