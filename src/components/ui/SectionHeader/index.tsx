"use client";

import { Flex, Heading, Text } from "@chakra-ui/react";

import Reveal from "../Reveal";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: "start" | "center";
  // Extra controls next to the title (refresh, add…)
  actions?: React.ReactNode;
};

export const SectionHeader = ({
  title,
  eyebrow,
  description,
  align = "start",
  actions,
}: SectionHeaderProps) => (
  <Reveal
    display="flex"
    flexDirection="column"
    alignItems={align === "center" ? "center" : "flex-start"}
    textAlign={align}
    mb={{ base: 10, xl: 14 }}
  >
    {eyebrow && (
      <Text
        color="lime"
        textTransform="uppercase"
        letterSpacing="0.2em"
        fontSize="sm"
        fontWeight="bold"
        mb="3"
      >
        {eyebrow}
      </Text>
    )}
    <Flex align="center" gap="3" wrap="wrap">
      <Heading
        as="h2"
        fontSize={{ base: "3xl", md: "5xl", xl: "6xl" }}
        fontWeight="black"
        textTransform="uppercase"
        lineHeight="1"
        letterSpacing="-0.02em"
      >
        {title}
      </Heading>
      {actions}
    </Flex>
    {description && (
      <Text
        mt="5"
        color="muted"
        fontSize={{ base: "md", md: "lg" }}
        lineHeight="tall"
        maxW="2xl"
      >
        {description}
      </Text>
    )}
  </Reveal>
);

export default SectionHeader;
