"use client";

import NextLink from "next/link";
import { HStack, IconButton, type StackProps } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { BsDiscord } from "react-icons/bs";

import { useLangContext } from "@/contexts/LangContext";
import { socials } from "@/data/navigation";
import { toast } from "../Toaster";

type SocialLinksProps = StackProps & { size?: "sm" | "md" | "lg" };

const iconStyle = {
  color: "muted",
  borderRadius: "pill",
  bg: "surface",
  borderWidth: "1px",
  borderColor: "line",
  transition: "all 0.25s ease",
  _hover: { color: "lime", borderColor: "lime", transform: "translateY(-2px)" },
} as const;

export const SocialLinks = ({ size = "md", ...rest }: SocialLinksProps) => {
  const { getTranslation } = useLangContext();

  return (
    <HStack gap="3" {...rest}>
      <IconButton asChild aria-label="GitHub" size={size} variant="plain" {...iconStyle}>
        <NextLink href={socials.github} target="_blank" rel="noreferrer">
          <AiFillGithub />
        </NextLink>
      </IconButton>
      <IconButton
        aria-label="Discord"
        title="Discord"
        size={size}
        variant="plain"
        {...iconStyle}
        onClick={() => {
          navigator.clipboard.writeText(socials.discord);
          toast.info(getTranslation("contact-me--discord-copied"));
        }}
      >
        <BsDiscord />
      </IconButton>
    </HStack>
  );
};

export default SocialLinks;
