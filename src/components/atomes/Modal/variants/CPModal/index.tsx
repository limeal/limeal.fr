"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Modal from "../..";
import { InputContainer } from "../../InputContainer";
import ImageDrop from "../../../ImageDrop";
import { useAuthContext } from "@/contexts/AuthContext";
import { uploadFile } from "@/firebase/storage";
import { addProject } from "@/firebase/store/project";
import moment from "moment";
import getTranslation from "@/utils/lang";

const CreateProjectModal = ({
  setOpen,
  refresh,
  lang
}: {
  setOpen: (open: boolean) => void;
  refresh: () => void;
  lang?: string;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [category, setCategory] = useState("Web_Development");
  const [extLink, setExternalLink] = useState("");
  const [releaseDate, setReleaseDate] = useState(moment().format("YYYY-MM-DD"));
  const [github, setGithub] = useState("");

  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();

  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const submitProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!thumbnail) return;

    setLoading(true);
    try {
      await uploadFile(
        thumbnail,
        `projects/${thumbnail.name}`
      );

      await addProject({
        name,
        thumbnail: {
          ref: `projects/${thumbnail.name}`,
        },
        category,
        description,
        external_link: extLink,
        release_date: releaseDate,
        github
      });

      toast.success(getTranslation(lang || "en", "portfolio--add-success"));
      setOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(getTranslation(lang || "en", "portfolio--add-error"));
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Add Project"
      lore="their properties"
      buttonText="Add"
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={submitProject}
      inputs={[
        <InputContainer key={0}>
          <ImageDrop
            width={"100%"}
            limit={1}
            height={width < 1280 ? 200 : 300}
            images={thumbnail ? [thumbnail] : null}
            setImages={(images: Array<File> | null) => setThumbnail(images ? images[0] : null)}
          />
        </InputContainer>,
        <InputContainer label="Name" key={1}>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
        </InputContainer>,
        <InputContainer label="Description" key={2}>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            required
          />
        </InputContainer>,
        <InputContainer label="Category" key={3}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Web_Development">Web Development</option>
            <option value="Mobile_Development">Mobile Development</option>
            <option value="Software_Development">Software Development</option>
            <option value="Game_Development">Game Development</option>
            <option value="Minecraft_Addons">
              Minecraft Development (Plugins, Mods, etc...)
            </option>
            <option value="Other">Other</option>
          </select>
        </InputContainer>,
        <InputContainer label="Date" key={4}>
          <input
            type="date"
            value={releaseDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </InputContainer>,
        <InputContainer label="Link" key={5}>
          <input
            type="text"
            name="href"
            value={extLink}
            onChange={(e) => setExternalLink(e.currentTarget.value)}
            required
          />
        </InputContainer>,
        <InputContainer label="Github" key={6}>
          <input
            type="text"
            name="github"
            value={github}
            onChange={(e) => setGithub(e.currentTarget.value)}
          />
        </InputContainer>,
      ]}
    />
  );
};

export default CreateProjectModal;
