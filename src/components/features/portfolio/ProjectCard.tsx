"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Box, Flex, Grid, Heading, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { LuArrowUpRight, LuPencil, LuTrash2 } from "react-icons/lu";

import Project from "@/interfaces/project";
import { deleteProject } from "@/firebase/store/project";
import { useLangContext } from "@/contexts/LangContext";
import useIsAdmin from "@/hooks/useIsAdmin";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "@/components/ui/Toaster";
import { hasThumbnail, projectPeriod } from "@/utils/project";
import ProjectFormModal from "./ProjectFormModal";

type ProjectCardProps = {
  project: Project;
  refresh: () => void;
  // Admin's recruiter code: where confidential projects are stored
  vaultCode: string | null;
  // "featured": large horizontal card for the latest project
  variant?: "featured" | "compact";
};

const linkStyle = {
  variant: "plain",
  size: "sm",
  color: "muted",
  borderRadius: "pill",
  borderWidth: "1px",
  borderColor: "line",
  _hover: { color: "lime", borderColor: "lime" },
} as const;


const externalTarget = (link: string) => (link === "/" ? "_self" : "_blank");

const Thumbnail = ({ project, sizes }: { project: Project; sizes: string }) => (
  <Box
    position="absolute"
    inset="0"
    transition="transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)"
    _groupHover={{ transform: "scale(1.05)" }}
  >
    {hasThumbnail(project) ? (
      <Image
        src={project.thumbnail.url as string}
        alt={project.name}
        fill
        sizes={sizes}
        style={{ objectFit: "cover" }}
      />
    ) : (
      // No image: a typographic cover in the site colors
      <Box
        position="absolute"
        inset="0"
        display="grid"
        placeItems="center"
        p="6"
        bg="surface.raised"
        overflow="hidden"
      >
        <Box position="absolute" inset="0" opacity="0.06">
          <Image src="/assets/images/pattern.svg" alt="" fill style={{ objectFit: "cover" }} />
        </Box>
        <Text
          position="relative"
          color="lime"
          fontWeight="black"
          textTransform="uppercase"
          textAlign="center"
          lineHeight="0.95"
          letterSpacing="-0.03em"
          fontSize={{ base: "3xl", md: "4xl" }}
          lineClamp={3}
        >
          {project.name}
        </Text>
      </Box>
    )}
  </Box>
);

const ProjectCard = ({ project, refresh, vaultCode, variant = "compact" }: ProjectCardProps) => {
  const [editing, setEditing] = useState(false);
  const isAdmin = useIsAdmin();
  const { getTranslation } = useLangContext();

  const isPro = project.kind === "pro";
  // "Lead dev · Company", each part only when filled in
  const credit = isPro ? [project.role, project.company].filter(Boolean).join(" · ") : "";

  const kindBadge = (
    <Text
      as="span"
      px="2.5"
      py="0.5"
      borderRadius="pill"
      borderWidth="1px"
      borderColor={isPro ? "rose" : "line"}
      color={isPro ? "rose" : "muted"}
      fontSize="2xs"
      fontWeight="bold"
      textTransform="uppercase"
      letterSpacing="0.1em"
    >
      {getTranslation(isPro ? "portfolio--kind-pro" : "portfolio--kind-personal")}
    </Text>
  );

  const meta = `${projectPeriod(project, getTranslation("portfolio--today"))} · ${project.category.replace(/_/g, " ")}`;

  const handleDelete = () => {
    deleteProject(project, project.confidential ? vaultCode ?? undefined : undefined)
      .then(() => {
        toast.success(`Project ${project.name} deleted !`);
        refresh();
      })
      .catch((err) => toast.error(err.message));
  };

  const adminActions = isAdmin && (
    <HStack position="absolute" top="3" right="3" gap="2" zIndex="1">
      <IconButton aria-label="Edit" size="sm" bg="rgba(17, 16, 19, 0.8)" color="white" borderRadius="pill" _hover={{ color: "lime" }} onClick={() => setEditing(true)}>
        <LuPencil />
      </IconButton>
      <IconButton aria-label="Delete" size="sm" bg="rose" color="white" borderRadius="pill" onClick={handleDelete}>
        <LuTrash2 />
      </IconButton>
    </HStack>
  );

  const editModal = editing && (
    <ProjectFormModal project={project} vaultCode={vaultCode} onClose={() => setEditing(false)} refresh={refresh} />
  );

  if (variant === "featured") {
    return (
      <Card interactive>
        {editModal}
        {/* Fixed height on desktop: long descriptions are clamped instead of stretching the card */}
        <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1.4fr) minmax(0, 1fr)" }} h={{ lg: "420px" }}>
          <Box position="relative" aspectRatio={{ base: "16 / 10", lg: "auto" }} overflow="hidden">
            <Thumbnail project={project} sizes="(min-width: 1024px) 60vw, 100vw" />
            {adminActions}
          </Box>
          <Stack p={{ base: 6, md: 10 }} gap="4" justify="center" overflow="hidden">
            <HStack gap="3" wrap="wrap">
              <Text
                as="span"
                px="3"
                py="1"
                borderRadius="pill"
                bg="lime"
                color="ink"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.1em"
              >
                {getTranslation("portfolio--latest")}
              </Text>
              {kindBadge}
              <Text color="muted" fontSize="sm" textTransform="uppercase" letterSpacing="0.1em">
                {meta}
              </Text>
            </HStack>
            <Heading
              as="h3"
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="-0.02em"
              lineHeight="1"
              lineClamp={2}
            >
              {project.name}
            </Heading>
            {credit && (
              <Text fontWeight="bold" color="white" lineClamp={1}>
                {credit}
              </Text>
            )}
            <Text color="muted" fontSize={{ base: "md", md: "lg" }} lineHeight="tall" lineClamp={4}>
              {project.description}
            </Text>
            <Flex gap="3" wrap="wrap" pt="2">
              {project.external_link && (
                <Button
                  href={project.external_link}
                  external={externalTarget(project.external_link) === "_blank"}
                  icon={<LuArrowUpRight />}
                >
                  {getTranslation("portfolio--view")}
                </Button>
              )}
              {project.github && (
                <Button href={project.github} external variant="outline">
                  <AiFillGithub />
                  GitHub
                </Button>
              )}
            </Flex>
          </Stack>
        </Grid>
      </Card>
    );
  }

  return (
    <Card interactive h="full" display="flex" flexDirection="column">
      {editModal}
      <Box position="relative" aspectRatio="16 / 10" overflow="hidden">
        <Thumbnail project={project} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
        {adminActions}
      </Box>

      <Stack p="5" gap="2" flex="1">
        <Flex justify="space-between" align="flex-start" gap="3">
          <Heading as="h3" fontSize="xl" fontWeight="black" lineClamp={2}>
            {project.name}
          </Heading>
          <HStack gap="2" flexShrink="0">
            {project.github && (
              <IconButton asChild aria-label="GitHub" {...linkStyle}>
                <NextLink href={project.github} target="_blank" rel="noreferrer">
                  <AiFillGithub />
                </NextLink>
              </IconButton>
            )}
            {project.external_link && (
              <IconButton asChild aria-label={getTranslation("portfolio--view")} {...linkStyle}>
                <NextLink href={project.external_link} target={externalTarget(project.external_link)}>
                  <LuArrowUpRight />
                </NextLink>
              </IconButton>
            )}
          </HStack>
        </Flex>
        <HStack gap="2" wrap="wrap">
          {kindBadge}
          <Text color="lime" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em">
            {meta}
          </Text>
        </HStack>
        {credit && (
          <Text fontSize="sm" fontWeight="bold" lineClamp={1}>
            {credit}
          </Text>
        )}
        <Text color="muted" fontSize="sm" lineHeight="tall" lineClamp={3}>
          {project.description}
        </Text>
      </Stack>
    </Card>
  );
};

export default ProjectCard;
