"use client";

import { useRef } from "react";
import { Box, type BoxProps } from "@chakra-ui/react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type ScrollTextProps = BoxProps & {
  text: string;
  // Words rendered in lime once lit
  highlights?: string[];
};

const Word = ({
  word,
  progress,
  range,
  highlighted,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlighted: boolean;
}) => {
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.span
      style={{
        opacity,
        color: highlighted ? "var(--chakra-colors-lime)" : undefined,
      }}
    >
      {word}{" "}
    </motion.span>
  );
};

// Lights the text up word by word while it scrolls through the viewport
export const ScrollText = ({ text, highlights = [], ...rest }: ScrollTextProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = text.split(" ");
  const isHighlighted = (word: string) =>
    highlights.some((h) => h.split(" ").includes(word.replace(/[.,:;!?]/g, "")));

  return (
    <Box ref={ref} as="p" {...rest}>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          word={word}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          highlighted={isHighlighted(word)}
        />
      ))}
    </Box>
  );
};

export default ScrollText;
