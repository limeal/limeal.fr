"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InputContainer } from "../../InputContainer";
import Modal from "../..";

import { createProfile, getProfileFromId, updateProfile } from "@/firebase/store/profile";
import { useAuthContext } from "@/contexts/AuthContext";
import { uploadFile } from "@/firebase/storage";
import ImageDrop from "@/components/atomes/ImageDrop";
import Profile from "@/interfaces/profile";
import { useLangContext } from "@/contexts/LangContext";

const ProfileModal = ({
  mode,
  profile,
  setProfile,
  setOpen,
}: {
  mode: "create" | "edit";
  profile?: Profile | null;
  setProfile: (profile: any) => void;
  setOpen: (open: boolean) => void;
}) => {
  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const { getTranslation } = useLangContext();

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
      toast.error(getTranslation("profilm--create-must-login"));
      return;
    }
    if (!picture || !username) {
      toast.error(getTranslation("profilm--create-must-fill"));
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
        email: user?.email || "",
      });

      const profile = await getProfileFromId(user?.uid);
      setProfile(profile);

      toast.success(getTranslation("profilm--create-success"));
    } catch (error) {
      toast.error(getTranslation("profilm--create-error"));
    }
    setLoading(false);
  };

  const edit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) return;

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
        email: profile?.email || "",
      });

      const newProfile = await getProfileFromId(user?.uid || '');
      setProfile(newProfile);

      toast.success(getTranslation("profilm--edit-success"));
      setOpen(false);
    } catch (error) {
      toast.error(getTranslation("profilm--edit-error"));
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
      title={mode === "create" ? getTranslation("profilm--create-title") : getTranslation("profilm--edit-title")}
      lore={getTranslation("profilm--lore")}
      buttonText={mode === "create" ? getTranslation("profilm--create-button") : getTranslation("profilm--edit-button")}
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={mode === "create" ? create : edit}
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
        <InputContainer key={1} label={getTranslation("profilm--username")}>
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

export default ProfileModal;
