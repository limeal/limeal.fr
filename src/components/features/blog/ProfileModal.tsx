"use client";

import { useState } from "react";
import { Input } from "@chakra-ui/react";

import Profile from "@/interfaces/profile";
import { createProfile, getProfileFromId, updateProfile } from "@/firebase/store/profile";
import { uploadFile } from "@/firebase/storage";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLangContext } from "@/contexts/LangContext";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import ImageDrop from "@/components/ui/ImageDrop";
import { toast } from "@/components/ui/Toaster";

const ProfileModal = ({
  mode,
  profile,
  setProfile,
  onClose,
}: {
  mode: "create" | "edit";
  profile?: Profile | null;
  setProfile: (profile: any) => void;
  onClose: () => void;
}) => {
  const [username, setUsername] = useState(profile?.username ?? "");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const { getTranslation } = useLangContext();

  const picturePathFor = (id: string, file: File) => `profiles/${id}.${file.name.split(".").pop()}`;

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
      const picturePath = picturePathFor(user.uid, picture);
      await uploadFile(picture, picturePath);

      await createProfile({
        id: user.uid,
        username,
        picture: { ref: picturePath },
        email: user.email || "",
      });

      setProfile(await getProfileFromId(user.uid));
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
      let picturePath = profile.picture?.ref;

      if (picture) {
        picturePath = picturePathFor(profile.id || "", picture);
        await uploadFile(picture, picturePath);
      }

      await updateProfile({
        id: profile.id,
        username,
        picture: { ref: picturePath || "" },
        email: profile.email || "",
      });

      setProfile(await getProfileFromId(user?.uid || ""));
      toast.success(getTranslation("profilm--edit-success"));
      onClose();
    } catch (error) {
      toast.error(getTranslation("profilm--edit-error"));
    }
    setLoading(false);
  };

  return (
    <Modal
      title={getTranslation(mode === "create" ? "profilm--create-title" : "profilm--edit-title")}
      subtitle={
        <>
          {getTranslation("modal--with")} <strong>{getTranslation("profilm--lore")}</strong>
        </>
      }
      submitText={getTranslation(mode === "create" ? "profilm--create-button" : "profilm--edit-button")}
      loading={loading}
      onClose={onClose}
      onSubmit={mode === "create" ? create : edit}
      size="sm"
    >
      <ImageDrop
        limit={1}
        images={picture ? [picture] : null}
        setImages={(images) => setPicture(images ? images[0] : null)}
      />
      <FormField label={getTranslation("profilm--username")}>
        <Input value={username} onChange={(e) => setUsername(e.currentTarget.value)} css={fieldStyles} />
      </FormField>
    </Modal>
  );
};

export default ProfileModal;
