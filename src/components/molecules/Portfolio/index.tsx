"use client";

import { useEffect, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { LuRefreshCcw } from "react-icons/lu";

import { toast } from "react-toastify";

import ProjectCard from "@/components/atomes/ProjectCard";
import getTranslation from "@/utils/lang";
import Project from "@/interfaces/project";
import { useAuthContext } from "@/contexts/AuthContext";
import CPModal from "@/components/atomes/Modal/variants/CPModal";
import { getProjects } from "@/firebase/store/project";

import "./style.scss";

const ProjectsList = ({ projects, refresh }: { projects: Project[], refresh: () => void }) => {
  return (
    <ul>
      {projects.map((project: Project, index: number) => (
        <li key={index}>
          <ProjectCard refresh={refresh} project={project} />
        </li>
      ))}
    </ul>
  );
};

const Portfolio = ({ lang }: { lang: string }) => {
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { user } = useAuthContext();

  const refreshProjects = async (isClick: boolean) => {
    
    const projects = await getProjects();

    setCategories([...new Set(projects.map((project: Project) => project.category))])
    setProjects(projects);

    if (isClick) {
      toast.success(getTranslation(lang, "portfolio--refresh-success"));
    }
  };

  useEffect(() => {
    refreshProjects(false);
  }, []);

  return (
    <section className="portfolio" id="portfolio">
      {isMenuOpen && <CPModal setOpen={setIsMenuOpen} refresh={() => refreshProjects(false)} />}
      <div className="title">
        <div>
          <h1>{getTranslation(lang, "portfolio--title")}</h1>
          <button className="refresh" onClick={(e) => {e.preventDefault(); refreshProjects(true);}}>
            <LuRefreshCcw />
          </button>
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
            onClick={() => setCategory(category === name ? "" : name)}
          >
            {name.replace("_", " ")}
          </li>
        ))}
      </ul>
      <div className="projects">
        {projects ? (
          <ProjectsList
            refresh={() => refreshProjects(false)}
            projects={
              category === ""
                ? projects
                : projects.filter(
                    (project: Project) => project.category === category
                  )
            }
          />
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
