"use client";

import { Box, type BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

type CardProps = BoxProps & {
  // Lifts and outlines the card on hover
  interactive?: boolean;
};

const base: BoxProps = {
  position: "relative",
  bg: "surface",
  borderWidth: "1px",
  borderColor: "line",
  borderRadius: "card",
  overflow: "hidden",
};

// Children can react to the card hover with `_groupHover`
export const Card = ({ interactive, children, ...rest }: CardProps) => {
  if (!interactive) {
    return (
      <Box {...base} {...rest}>
        {children}
      </Box>
    );
  }

  return (
    <Box
      asChild
      {...base}
      className="group"
      transition="border-color 0.3s ease"
      _hover={{ borderColor: "lime" }}
      {...rest}
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        {children}
      </motion.div>
    </Box>
  );
};

export default Card;
