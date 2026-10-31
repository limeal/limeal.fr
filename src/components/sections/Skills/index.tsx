"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Box, Flex, Text } from "@chakra-ui/react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { useLangContext } from "@/contexts/LangContext";
import { skillCategories } from "@/data/skills";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Pill from "@/components/ui/Pill";
import Reveal, { RevealGroup, RevealItem } from "@/components/ui/Reveal";

// Decorative ribbon sliding sideways with the scroll
const Ribbon = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <Box ref={ref} overflow="hidden" mt={{ base: 16, xl: 24 }} aria-hidden>
      <motion.div style={{ x: reduce ? 0 : x, width: "110%", marginLeft: "-5%" }}>
        <Image
          src="/assets/images/ribbon.svg"
          alt=""
          width={1440}
          height={200}
          style={{ width: "100%", height: "auto" }}
        />
      </motion.div>
    </Box>
  );
};

const Skills = () => {
  const [category, setCategory] = useState(skillCategories[0].id);
  // Before any click the badges wait for the scroll; after, they replay on each tab change
  const [interacted, setInteracted] = useState(false);
  const { getTranslation } = useLangContext();

  const current = skillCategories.find((c) => c.id === category) ?? skillCategories[0];

  return (
    <Box as="section" id="skills" scrollMarginTop="72px">
      <Section as="div" pb="0">
        <SectionHeader
          title={getTranslation("skills--title")}
          description={getTranslation("skills--description")}
        />
        <Reveal>
          <Flex gap="2" wrap="wrap">
            {skillCategories.map((c) => (
              <Pill
                key={c.id}
                active={c.id === category}
                activeLayoutId="skills-tab"
                onClick={() => {
                  setCategory(c.id);
                  setInteracted(true);
                }}
              >
                {getTranslation(c.tid)}
              </Pill>
            ))}
          </Flex>
        </Reveal>
        {/* Elements read as a list, so they don't look like the category tabs above */}
        <RevealGroup
          key={category}
          trigger={interacted ? "mount" : "inView"}
          stagger={0.05}
          element="ul"
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
          columnGap={{ md: 10, xl: 12 }}
          mt={{ base: 8, md: 12 }}
          listStyleType="none"
        >
          {current.skills.map((skill, i) => {
            const Icon = skill.icon;

            return (
              <RevealItem
                key={skill.name}
                element="li"
                className="group"
                display="flex"
                alignItems="center"
                gap="4"
                py={{ base: 4, md: 5 }}
                borderBottomWidth="1px"
                borderColor="line"
                transition="border-color 0.3s ease"
                _hover={{ borderColor: "lime" }}
              >
                <Text as="span" color="whiteAlpha.400" fontSize="sm" fontWeight="bold" minW="6">
                  {String(i + 1).padStart(2, "0")}
                </Text>
                {Icon && (
                  <Box
                    fontSize="2xl"
                    color={skill.accent ? "lime" : "muted"}
                    transition="color 0.3s ease, transform 0.3s ease"
                    _groupHover={{ color: "lime", transform: "scale(1.1)" }}
                  >
                    <Icon />
                  </Box>
                )}
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={skill.accent ? "lime" : "white"}
                  transition="transform 0.3s ease"
                  _groupHover={{ transform: "translateX(4px)" }}
                >
                  {skill.tid ? getTranslation(skill.tid) : skill.name}
                </Text>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>
      <Ribbon />
    </Box>
  );
};

export default Skills;
