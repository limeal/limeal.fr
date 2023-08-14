"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InputContainer } from "../../InputContainer";
import Modal from "../..";

import { createProfile, getProfileFromId } from "@/firebase/store/profile";
import { useAuthContext } from "@/contexts/AuthContext";
import { uploadFile } from "@/firebase/storage";
import ImageDrop from "@/components/atomes/ImageDrop";

const CPFModal = ({
  setProfile,
  setOpen,
}: {
  setProfile: (profile: any) => void;
  setOpen: (open: boolean) => void;
}) => {
  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();

  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a profile");
      return;
    }
    if (!picture || !username) {
      toast.error("Merci de remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      let picturePath = `profiles/${user?.uid}.${picture?.name
        .split(".")
        .pop()}`;

      await uploadFile(picture, picturePath);

      await createProfile({
        id: user?.uid,
        username: username,
        picture: {
          ref: picturePath || "",
        },
      });

      const profile = await getProfileFromId(user?.uid);
      setProfile(profile);

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile!");
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Create profile"
      lore="your data"
      buttonText="Create"
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={create}
      overrideStyle={{
        modal: {
          justifyContent: width >= 1280 ? "center" : "flex-start",
        }
      }}
      inputs={[
        <ImageDrop
          key={0}
          width={"100%"}
          limit={1}
          height={200}
          images={picture ? [picture] : null}
          setImages={(images: Array<File> | null) =>
            setPicture(images ? images[0] : null)
          }
        />,
        <InputContainer key={1} label="Username">
          <input
            type="text"
            name="username"
            value={username}
            style={{ width: "100%" }}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
        </InputContainer>,
      ]}
    />
  );
};

export default CPFModal;
