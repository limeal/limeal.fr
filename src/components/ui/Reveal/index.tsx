"use client";

import { Box, type BoxProps } from "@chakra-ui/react";
import { motion, type Variants } from "framer-motion";

// Apple-like "ease out quint": fast start, long soft landing
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const hidden = (y: number) => ({ opacity: 0, y, filter: "blur(8px)" });
const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

type RevealProps = BoxProps & {
  delay?: number;
  y?: number;
  // Share of the element that must be visible before it animates
  amount?: number;
};

// Fades, lifts and un-blurs its content the first time it scrolls into view
export const Reveal = ({
  children,
  delay = 0,
  y = 32,
  amount = 0.3,
  ...rest
}: RevealProps) => (
  <Box asChild {...rest}>
    <motion.div
      initial={hidden(y)}
      whileInView={shown}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  </Box>
);

const groupVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const itemVariants: Variants = {
  hidden: hidden(24),
  visible: { ...shown, transition: { duration: 0.7, ease: EASE_OUT } },
};

type RevealGroupProps = BoxProps & {
  stagger?: number;
  delay?: number;
  amount?: number;
  // "inView" waits for the scroll, "mount" plays immediately (e.g. after a tab change)
  trigger?: "inView" | "mount";
  element?: "div" | "ul";
};

// Staggers the entrance of its <RevealItem> children
export const RevealGroup = ({
  children,
  stagger = 0.08,
  delay = 0,
  amount = 0.2,
  trigger = "inView",
  element = "div",
  ...rest
}: RevealGroupProps) => {
  const Tag = element === "ul" ? motion.ul : motion.div;
  const play =
    trigger === "mount"
      ? { animate: "visible" }
      : { whileInView: "visible", viewport: { once: true, amount } };

  return (
    <Box asChild {...rest}>
      <Tag initial="hidden" variants={groupVariants(stagger, delay)} {...play}>
        {children}
      </Tag>
    </Box>
  );
};

type RevealItemProps = BoxProps & { element?: "div" | "li" };

export const RevealItem = ({
  children,
  element = "div",
  ...rest
}: RevealItemProps) => {
  const Tag = element === "li" ? motion.li : motion.div;

  return (
    <Box asChild {...rest}>
      <Tag variants={itemVariants}>{children}</Tag>
    </Box>
  );
};

export default Reveal;
