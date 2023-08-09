"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import "./style.scss";
import Modal from "../Modal";
import { InputContainer } from "../InputContainer";
import ImageDrop from "../ImageDrop";
import { useAuthContext } from "@/contexts/AuthContext";
import { uploadFile } from "@/firebase/storage";
import { addProject } from "@/firebase/firestore";
import moment from "moment";

const CreateProjectModal = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [category, setCategory] = useState("Web_Development");
  const [href, setHref] = useState("");
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));

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

      const thumbnailURL = await uploadFile(thumbnail, `projects/${thumbnail.name}`);
      await addProject({
        name,
        thumbnail: thumbnailURL,
        category,
        description,
        href,
        created_at: date,
      })

      toast.success("You successfully added a new project to portfolio!");
      setOpen(false);
    } catch (error: any) {
      toast.error(
        "message" in error ? error.message : "Failed to add a new project!"
      );
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
        <InputContainer
          children={
            <ImageDrop
              width={"100%"}
              height={width < 1280 ? 200 : 300}
              image={thumbnail}
              setImage={setThumbnail}
            />
          }
        />,
        <InputContainer
          label="Name"
          children={
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
            />
          }
        />,
        <InputContainer
          label="Description"
          children={
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              required
            />
          }
        />,
        <InputContainer
          label="Category"
          children={
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
          }
        />,
        <InputContainer
          label="Date"
          children={
            <input
              type="date"
              value={date || new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          }
        />,
        <InputContainer
          label="Link"
          children={
            <input
              type="text"
              name="href"
              value={href}
              onChange={(e) => setHref(e.currentTarget.value)}
              required
            />
          }
        />,
      ]}
    />
  );
};

export default CreateProjectModal;
