"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Thin lime bar at the top of the viewport, following the reading progress
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "0%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "var(--chakra-colors-lime)",
        zIndex: 1500,
      }}
    />
  );
};

export default ScrollProgress;
