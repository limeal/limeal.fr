"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Badge, Box, Heading, HStack, IconButton, LinkOverlay, Stack, Text } from "@chakra-ui/react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { MdPublish, MdUnpublished } from "react-icons/md";

import Article from "@/interfaces/article";
import { deleteArticle, publishArticle } from "@/firebase/store/article";
import { useLangContext } from "@/contexts/LangContext";
import { sendEmailNewArticle } from "@/utils/article";
import { getCurrentTimeInLetter } from "@/utils/time";
import useIsAdmin from "@/hooks/useIsAdmin";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { toast } from "@/components/ui/Toaster";
import ArticleFormModal from "./ArticleFormModal";
import { getTranslated } from "./translation";

const actionStyle = {
  size: "sm",
  bg: "rgba(17, 16, 19, 0.8)",
  color: "white",
  borderRadius: "pill",
  backdropFilter: "blur(8px)",
  _hover: { color: "lime" },
} as const;

const ArticleCard = ({ article, refresh }: { article: Article; refresh: () => void }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const isAdmin = useIsAdmin();
  const { lang } = useLangContext();

  const translation = getTranslated(article, lang);

  const handleDelete = () => {
    deleteArticle(article)
      .then(() => {
        toast.success(`Article ${translation.title} deleted !`);
        refresh();
      })
      .catch((err) => toast.error(err.message));
  };

  const handlePublish = (state: boolean) => {
    publishArticle(article, state)
      .then(async () => {
        if (state)
          toast.promise(
            sendEmailNewArticle(article.translations[article.defaultLanguage].title || "", article.slug),
            {
              pending: "Sending email to subscribers...",
              success: "Email sent!",
              error: "Failed to send email!",
            }
          );
        toast.success(`Article ${translation.title} ${state ? "" : "un"}published !`);
        refresh();
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <Card interactive h="full">
      {openEdit && (
        <ArticleFormModal mode="edit" article={article} onClose={() => setOpenEdit(false)} refresh={refresh} />
      )}
      <Box position="relative" aspectRatio="588 / 400" overflow="hidden">
        <Box position="absolute" inset="0" transition="transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)" _groupHover={{ transform: "scale(1.05)" }}>
          <Image
            src={article.images[0]?.url || "/assets/images/no-image.png"}
            alt={translation.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
          />
        </Box>
        {!article.published && (
          <Badge position="absolute" top="3" left="3" bg="rose" color="white" borderRadius="pill" px="3">
            Unpublished
          </Badge>
        )}
        {isAdmin && (
          // Above the link overlay so the actions stay clickable
          <HStack position="absolute" top="3" right="3" gap="2" zIndex="2">
            <IconButton aria-label="Edit" {...actionStyle} onClick={() => setOpenEdit(true)}>
              <LuPencil />
            </IconButton>
            <IconButton aria-label="Publish" {...actionStyle} onClick={() => handlePublish(!article.published)}>
              {article.published ? <MdUnpublished /> : <MdPublish />}
            </IconButton>
            <IconButton aria-label="Delete" {...actionStyle} _hover={{ color: "rose" }} onClick={handleDelete}>
              <LuTrash2 />
            </IconButton>
          </HStack>
        )}
      </Box>
      <Stack p={{ base: 5, md: 6 }} gap="3">
        <HStack gap="2" wrap="wrap">
          {Object.keys(article.translations).map((key) => (
            <Pill key={key} active={lang === key} px="3" py="0.5" fontSize="xs" textTransform="uppercase">
              {key}
            </Pill>
          ))}
        </HStack>
        <Text color="muted" fontSize="sm">
          {getCurrentTimeInLetter(article.created_at, lang)}
        </Text>
        <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
          <LinkOverlay asChild>
            <NextLink href={`/blog/${article.slug}`}>{translation.title}</NextLink>
          </LinkOverlay>
        </Heading>
        <Text color="muted" lineHeight="tall">
          {translation.lore}
        </Text>
      </Stack>
    </Card>
  );
};

export default ArticleCard;
