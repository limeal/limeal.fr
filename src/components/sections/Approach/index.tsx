"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

import { useLangContext } from "@/contexts/LangContext";
import { mindNodes, type MindGroup } from "@/data/approach";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Pill from "@/components/ui/Pill";
import Reveal, { EASE_OUT } from "@/components/ui/Reveal";
import SynapseGraph, { groupColor } from "./SynapseGraph";

const AUTOPLAY_MS = 4500;
const GROUPS: MindGroup[] = ["ai", "product"];

const Approach = () => {
  const [activeId, setActiveId] = useState(mindNodes[0].id);
  // Autoplay walks through the nodes until the visitor picks one
  const [interacted, setInteracted] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const { getTranslation } = useLangContext();

  useEffect(() => {
    if (!inView || interacted || reduce) return;

    const interval = setInterval(() => {
      setActiveId((id) => {
        const i = mindNodes.findIndex((n) => n.id === id);
        return mindNodes[(i + 1) % mindNodes.length].id;
      });
    }, AUTOPLAY_MS);

    return () => clearInterval(interval);
  }, [inView, interacted, reduce]);

  const select = (id: string) => {
    setActiveId(id);
    setInteracted(true);
  };

  const active = mindNodes.find((n) => n.id === activeId) ?? mindNodes[0];
  const Icon = active.icon;

  return (
    <Section id="approach">
      <SectionHeader
        title={getTranslation("approach--title")}
        description={getTranslation("approach--description")}
      />

      <Grid
        ref={ref}
        templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1.5fr) minmax(0, 1fr)" }}
        gap={{ base: 8, xl: 14 }}
        alignItems="center"
      >
        <Reveal>
          <SynapseGraph activeId={activeId} onSelect={select} />
        </Reveal>

        <Stack gap="5">
          {/* Fixed height so the layout never jumps between nodes */}
          <Box position="relative" h={{ base: "270px", md: "220px", xl: "250px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                <Text
                  textTransform="uppercase"
                  letterSpacing="0.2em"
                  fontSize="xs"
                  fontWeight="bold"
                  style={{ color: groupColor[active.group] }}
                >
                  {getTranslation(`approach--group-${active.group}`)}
                </Text>
                <HStack gap="4" mt="4">
                  <Box
                    display="grid"
                    placeItems="center"
                    w="12"
                    h="12"
                    flexShrink="0"
                    borderRadius="full"
                    color="ink"
                    fontSize="xl"
                    style={{ background: groupColor[active.group] }}
                  >
                    <Icon />
                  </Box>
                  <Heading
                    as="h3"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="black"
                    textTransform="uppercase"
                    letterSpacing="-0.02em"
                  >
                    {getTranslation(`approach--${active.id}-title`)}
                  </Heading>
                </HStack>
                <Text mt="5" color="muted" fontSize={{ base: "md", md: "lg" }} lineHeight="tall">
                  {getTranslation(`approach--${active.id}-text`)}
                </Text>
              </motion.div>
            </AnimatePresence>
          </Box>

          <Stack gap="4">
            {GROUPS.map((group) => (
              <Box key={group}>
                <Text fontSize="xs" color="whiteAlpha.500" fontWeight="bold" textTransform="uppercase" letterSpacing="0.15em" mb="2">
                  {getTranslation(`approach--group-${group}`)}
                </Text>
                <Flex gap="2" wrap="wrap">
                  {mindNodes
                    .filter((n) => n.group === group)
                    .map((n) => (
                      <Pill
                        key={n.id}
                        icon={n.icon}
                        active={n.id === activeId}
                        activeLayoutId="approach-node"
                        onClick={() => select(n.id)}
                        fontSize="sm"
                        px="3"
                        py="1.5"
                      >
                        {getTranslation(`approach--${n.id}-title`)}
                      </Pill>
                    ))}
                </Flex>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Grid>
    </Section>
  );
};

export default Approach;
