"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InputContainer } from "../../InputContainer";
import Modal from "../..";

import { updateProfile } from "@/firebase/store/profile";
import { uploadFile } from "@/firebase/storage";
import ImageDrop from "@/components/atomes/ImageDrop";
import Profile from "@/interfaces/profile";

const EditProfileModal = ({
  profile,
  setOpen,
}: {
  profile: Profile | null;
  setOpen: (open: boolean) => void;
}) => {
  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);


  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      let picturePath = profile?.picture?.ref;

      if (picture) {
        picturePath = `profiles/${profile?.id}.${picture?.name
          .split(".")
          .pop()}`;
        await uploadFile(picture, picturePath);
      }

      await updateProfile({
        id: profile?.id,
        username,
        picture: {
          ref: picturePath || "",
        },
      });

      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update profile!");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

  return (
    <Modal
      title="Update profile"
      lore="new values"
      buttonText="Update"
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={update}
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

export default EditProfileModal;
