"use client";

import { Text } from "@chakra-ui/react";

import { useLangContext } from "@/contexts/LangContext";
import Section from "@/components/ui/Section";
import ScrollText from "@/components/ui/ScrollText";

// The bio, lit up word by word as it scrolls past
const Manifesto = () => {
  const { getTranslation } = useLangContext();

  return (
    <Section py={{ base: 24, md: 32, xl: 48 }}>
      <Text color="lime" textTransform="uppercase" letterSpacing="0.2em" fontSize="sm" fontWeight="bold" mb="6">
        {getTranslation("tabs--about-me")}
      </Text>
      <ScrollText
        text={getTranslation("hero--image--description")}
        highlights={["Claude Code"]}
        fontSize={{ base: "2xl", md: "4xl", xl: "5xl" }}
        fontWeight="bold"
        lineHeight="1.2"
        letterSpacing="-0.02em"
        maxW="5xl"
      />
    </Section>
  );
};

export default Manifesto;
