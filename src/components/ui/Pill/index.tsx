"use client";

import { Box, type BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";

type PillProps = Omit<BoxProps, "onClick"> & {
  icon?: IconType;
  active?: boolean;
  // Lime outline, for the items to notice first
  accent?: boolean;
  onClick?: () => void;
  // Pills sharing this id slide one lime background from the old active pill to the new one
  activeLayoutId?: string;
};

export const Pill = ({
  icon: Icon,
  active = false,
  accent = false,
  onClick,
  activeLayoutId,
  children,
  ...rest
}: PillProps) => {
  const clickable = !!onClick;

  return (
    <Box
      as={clickable ? "button" : "span"}
      {...(clickable ? { type: "button", "aria-pressed": active } : {})}
      onClick={onClick}
      position="relative"
      isolation="isolate"
      display="inline-flex"
      alignItems="center"
      gap="2"
      px="4"
      py="2"
      borderRadius="pill"
      borderWidth="1px"
      borderColor={accent ? "lime" : "line"}
      bg={active && !activeLayoutId ? "lime" : "surface"}
      color={active ? "ink" : "white"}
      fontSize={{ base: "sm", md: "md" }}
      fontWeight="medium"
      whiteSpace="nowrap"
      cursor={clickable ? "pointer" : undefined}
      transition="color 0.3s ease, border-color 0.3s ease"
      _hover={clickable && !active ? { borderColor: "lime" } : undefined}
      {...rest}
    >
      {active && activeLayoutId && (
        <motion.span
          layoutId={activeLayoutId}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            background: "var(--chakra-colors-lime)",
            zIndex: -1,
          }}
        />
      )}
      {Icon && (
        <Box as="span" color={active ? "ink" : accent ? "lime" : "muted"}>
          <Icon />
        </Box>
      )}
      {children}
    </Box>
  );
};

export default Pill;
