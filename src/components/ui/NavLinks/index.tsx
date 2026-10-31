"use client";

import NextLink from "next/link";
import { Box, Stack, type StackProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

import { useLangContext } from "@/contexts/LangContext";
import type { NavLink } from "@/data/navigation";

type NavLinksProps = Omit<StackProps, "direction"> & {
  links: NavLink[];
  // Section id currently on screen, without "#"
  activeId?: string | null;
  direction?: "row" | "column";
  onNavigate?: () => void;
};

export const NavLinks = ({
  links,
  activeId,
  direction = "row",
  onNavigate,
  ...rest
}: NavLinksProps) => {
  const { getTranslation } = useLangContext();

  return (
    <Stack as="ul" direction={direction} gap={direction === "row" ? 8 : 5} listStyleType="none" {...rest}>
      {links.map((link) => {
        const active = activeId === link.href.replace("#", "");

        return (
          <Box as="li" key={link.href} position="relative">
            <Box
              asChild
              color={active ? "white" : "muted"}
              fontWeight="bold"
              fontSize={direction === "row" ? "md" : "2xl"}
              textTransform={direction === "column" ? "uppercase" : undefined}
              transition="color 0.2s ease"
              _hover={{ color: "white" }}
            >
              <NextLink href={link.href} onClick={onNavigate}>
                {getTranslation(link.tid)}
              </NextLink>
            </Box>
            {active && direction === "row" && (
              <motion.span
                layoutId="nav-underline"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -6,
                  height: 2,
                  borderRadius: 2,
                  background: "var(--chakra-colors-lime)",
                }}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default NavLinks;
