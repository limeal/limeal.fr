"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import DataSection from "..";
import Project from "@/interfaces/project";
import { getProjects } from "@/firebase/store/project";
import CPModal from "@/components/atomes/Modal/variants/CPModal";
import ProjectCard from "@/components/atomes/ProjectCard";
import { useLangContext } from "@/contexts/LangContext";

const Portfolio = () => {
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { getTranslation } = useLangContext();

  const refreshProjects = async (isClick: boolean) => {
    setLoading(true);
    const projects = await getProjects();

    setCategories([
      ...new Set(projects.map((project: Project) => project.category)),
    ]);

    setProjects(projects.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()))

    if (isClick) {
      toast.success(getTranslation("portfolio--refresh-success"));
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshProjects(false);
  }, []);

  return (
    <DataSection
      sectionName="portfolio"
      filters={categories}
      selectedFilter={category}
      setSelectedFilter={setCategory}
      loading={loading}
      elements={
        category === ""
          ? projects
          : projects.filter((project: Project) => project.category === category)
      }
      refresh={refreshProjects}
      callbackAdd={({ setIsMenuOpen, refresh }) => (
        <CPModal setOpen={setIsMenuOpen} refresh={refresh} />
      )}
      callbackChild={({ element, refresh }) => (
        <ProjectCard project={element} refresh={refresh} />
      )}
    />
  );
};

export default Portfolio;
