"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { LuArrowRight } from "react-icons/lu";

import { useLangContext } from "@/contexts/LangContext";
import { useBrand } from "@/contexts/BrandContext";
import { heroStack } from "@/data/skills";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import Reveal, { EASE_OUT, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const NAMES = [
  { text: "Paul", color: "lime" },
  { text: "Limeal", color: "white" },
];
const NAME_INTERVAL_MS = 3000;

// Alternates between the first name and the pseudo with a left-to-right wipe:
// the old name is erased towards the right, then the new one is drawn from the left
const RotatingName = () => {
  const [index, setIndex] = useState(0);
  // The discreet domain only ever shows the first name
  const { discreet } = useBrand();
  const names = discreet ? NAMES.slice(0, 1) : NAMES;

  useEffect(() => {
    if (names.length < 2) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % names.length), NAME_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [names.length]);

  const name = names[index % names.length];

  return (
    <Box as="span" display="block" pb="0.08em" aria-hidden>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={name.text}
          style={{ display: "inline-block", color: `var(--chakra-colors-${name.color})` }}
          initial={{ clipPath: "inset(0 100% 0 0)", x: -24 }}
          animate={{ clipPath: "inset(0 0% 0 0)", x: 0 }}
          exit={{ clipPath: "inset(0 0 0 100%)", x: 24 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          {name.text}
        </motion.span>
      </AnimatePresence>
    </Box>
  );
};

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { getTranslation } = useLangContext();
  const brand = useBrand();

  // Parallax: the content drifts up, shrinks a little and fades as the page scrolls
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <Box
      ref={ref}
      as="section"
      id="about-me"
      position="relative"
      isolation="isolate"
      overflow="hidden"
      scrollMarginTop="72px"
    >
      <Box position="absolute" inset="0" opacity="0.08" zIndex="-1">
        <Image src="/assets/images/pattern.svg" alt="" fill style={{ objectFit: "cover" }} />
      </Box>

      <Container maxW="7xl" px={{ base: 4, md: 8, xl: 12 }}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          minH={{ base: "calc(100dvh - 64px)", md: "calc(100dvh - 72px)" }}
          py={{ base: 16, md: 20 }}
        >
          <motion.div style={reduce ? undefined : { y, scale, opacity }}>
            <Heading
              as="h1"
              aria-label={brand.name}
              fontSize={{ base: "56px", md: "112px", xl: "160px" }}
              lineHeight="0.92"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="-0.04em"
            >
              {/* First paint: the whole name rises from the mask, then starts rotating */}
              <motion.span
                style={{ display: "block" }}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: EASE_OUT, delay: 0.1 }}
              >
                <RotatingName />
              </motion.span>
            </Heading>

            <Reveal delay={0.45} y={16}>
              <Text
                mt={{ base: 5, md: 8 }}
                fontSize={{ base: "md", md: "2xl", xl: "3xl" }}
                fontWeight="black"
                textTransform="uppercase"
              >
                {getTranslation("hero--job")}
              </Text>
            </Reveal>

            <RevealGroup
              trigger="mount"
              delay={0.65}
              stagger={0.06}
              element="ul"
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              gap="2"
              mt={{ base: 8, md: 10 }}
              mx="auto"
              maxW="3xl"
              listStyleType="none"
            >
              {heroStack.map((skill) => (
                <RevealItem key={skill.name} element="li">
                  <Pill icon={skill.icon} accent={skill.accent}>
                    {skill.name}
                  </Pill>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={1} y={16}>
              <Flex gap="3" mt={{ base: 8, md: 10 }} justify="center" wrap="wrap">
                <Button href="#portfolio" icon={<LuArrowRight />}>
                  {getTranslation("hero--cta-projects")}
                </Button>
                <Button href="#contact-me" variant="outline">
                  {getTranslation("hero--cta-contact")}
                </Button>
              </Flex>
            </Reveal>
          </motion.div>
        </Flex>
      </Container>
    </Box>
  );
};

export default Hero;
