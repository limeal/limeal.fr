"use client";

import Image from "next/image";

import Profile from "@/interfaces/profile";

import "./style.scss";
import { useRef, useState } from "react";
import ProfileModal from "../Modal/variants/EPFModal";

const Profile = ({ profile }: { profile: Profile }) => {
  const [openProfileEdit, setOpenProfileEdit] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);

  if (!profile) return null;

  return (
    <>
      {openProfileEdit && (
        <ProfileModal profile={profile} setOpen={setOpenProfileEdit} />
      )}

      <div
        className="profile"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setOpenProfileEdit(true)}
      >
        <Image
          height={50}
          width={50}
          src={profile.picture?.url || ""}
          alt="profile"
        />
        <h2>
          {profile.username}{hover && <span>✏️</span>}
        </h2>
      </div>
    </>
  );
};

export default Profile;
