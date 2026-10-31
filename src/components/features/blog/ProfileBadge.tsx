"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, HStack, Text } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";

import Profile from "@/interfaces/profile";
import ProfileModal from "./ProfileModal";

// Avatar + username of the signed-in reader; click to edit
const ProfileBadge = ({ profile, setProfile }: { profile: Profile; setProfile: (profile: any) => void }) => {
  const [editing, setEditing] = useState(false);

  if (!profile) return null;

  return (
    <>
      {editing && (
        <ProfileModal mode="edit" profile={profile} setProfile={setProfile} onClose={() => setEditing(false)} />
      )}
      <HStack
        as="button"
        className="group"
        gap="3"
        px="3"
        py="2"
        borderRadius="pill"
        bg="surface"
        borderWidth="1px"
        borderColor="line"
        cursor="pointer"
        _hover={{ borderColor: "lime" }}
        onClick={() => setEditing(true)}
      >
        <Box position="relative" w="32px" h="32px" borderRadius="full" overflow="hidden">
          <Image src={profile.picture?.url || "/assets/images/no-image.png"} alt="" fill sizes="32px" style={{ objectFit: "cover" }} />
        </Box>
        <Text fontWeight="bold">{profile.username}</Text>
        <Box color="muted" opacity="0" _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
          <LuPencil />
        </Box>
      </HStack>
    </>
  );
};

export default ProfileBadge;
