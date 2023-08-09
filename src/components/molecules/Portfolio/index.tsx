"use client";

import { useEffect, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";

import "./style.scss";
import ProjectCard from "@/components/atomes/ProjectCard";
import getTranslation from "@/utils/lang";
import Project from "@/interfaces/project";
import { useAuthContext } from "@/contexts/AuthContext";
import { User } from "firebase/auth";
import CreateProjectModal from "@/components/atomes/CreateProjectModal";
import { getProjects } from "@/firebase/firestore";

const ProjectsList = ({
  projects,
}: {
  projects: Project[];
}) => {
  return (
    <ul>
      {projects.map((project: Project, index: number) => (
        <li key={index}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
};

const Portfolio = ({ lang }: { lang: string }) => {
  const [category, setCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<any>();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { user } = useAuthContext();

  useEffect(() => {
    getProjects(category).then(({ categories, projects }) => {
      setProjects(projects);

      const set = new Set<string>(categories);
      setCategories(Array.from(set));
    });
  }, [category]);

  return (
    <section className="portfolio" id="portfolio">
      {isMenuOpen && <CreateProjectModal setOpen={setIsMenuOpen} />}
      <div className="title">
        <div>
          <h1>{getTranslation(lang, "portfolio--title")}</h1>
          {user && user.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
            <button className="project-add" onClick={() => setIsMenuOpen(true)}>
              <AiFillPlusCircle />
            </button>
          )}
        </div>
        <p>{getTranslation(lang, "portfolio--description")}</p>
      </div>
      <ul className="categories">
        {categories.map((name, index) => (
          <li
            key={index}
            className={category === name ? "active" : ""}
            onClick={() => setCategory(category === name ? "all" : name)}
          >
            {name.replace("_", " ")}
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

export default Portfolio;
