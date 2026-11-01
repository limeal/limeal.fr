"use client";

import { useState } from "react";
import Image from "next/image";
import moment from "moment";
import { Box, chakra, Container, Flex, Heading, HStack, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { LuArrowLeft, LuArrowRight, LuCalendar, LuMapPin, LuRefreshCcw, LuTrash2 } from "react-icons/lu";

import Comment from "@/interfaces/comment";
import Like from "@/interfaces/like";
import {
  useAddComment,
  useArticle,
  useArticleImages,
  useArticleLikes,
  useComments,
  useDeleteComment,
  useToggleLike,
} from "@/hooks/queries/blog";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLangContext } from "@/contexts/LangContext";
import { getCurrentTimeInLetter } from "@/utils/time";
import useIsAdmin from "@/hooks/useIsAdmin";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { fieldStyles } from "@/components/ui/FormField";
import { EASE_OUT } from "@/components/ui/Reveal";
import { toast } from "@/components/ui/Toaster";
import { getTranslated } from "./translation";

const MIN_SWIPE_DISTANCE = 60;

const roundButton = {
  variant: "plain",
  borderRadius: "pill",
  bg: "rgba(17, 16, 19, 0.7)",
  color: "white",
  backdropFilter: "blur(8px)",
  _hover: { color: "lime" },
} as const;

// Rich text written in the admin form, styled for reading
const proseStyles = {
  "& p": { mb: "4", lineHeight: "tall", color: "whiteAlpha.900" },
  "& h1, & h2, & h3": { fontWeight: "black", mt: "8", mb: "4", fontSize: "2xl" },
  "& a": { color: "lime", textDecoration: "underline" },
  "& img": { borderRadius: "12px", my: "6" },
  "& ul, & ol": { pl: "6", mb: "4" },
};

const LikeButton = ({ liked, count, onClick }: { liked: boolean; count?: number; onClick: (e: React.MouseEvent) => void }) => (
  <HStack gap="1">
    <IconButton aria-label="Like" variant="plain" size="sm" color={liked ? "rose" : "muted"} _hover={{ color: "rose" }} onClick={onClick}>
      {liked ? <AiFillHeart /> : <AiOutlineHeart />}
    </IconButton>
    <Text color="muted">{count ?? 0}</Text>
  </HStack>
);

const ArticleView = ({ slug }: { slug: string }) => {
  const [comment, setComment] = useState<string>("");
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const { user } = useAuthContext();
  const { lang } = useLangContext();
  const isAdmin = useIsAdmin();

  const { data: article, isError: error, isPending } = useArticle(slug);
  const { data: images = [] } = useArticleImages(article);
  const { data: comments = [], refetch: refetchComments } = useComments(article?.id);
  const { data: likes = [] } = useArticleLikes(article?.id);

  const postComment = useAddComment();
  const removeComment = useDeleteComment();
  const toggleLikeMutation = useToggleLike(article?.id ?? "");

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    postComment.mutate(
      {
        article_ref: article?.id || "",
        author_id: user?.uid || "",
        content: comment || "",
        created_at: moment().format("YYYY-MM-DD"),
      },
      {
        onSuccess: () => {
          toast.success("Commentaire ajouté !");
          setComment("");
        },
        onError: () => toast.error("Erreur lors de l'ajout du commentaire !"),
      }
    );
  };

  const toggleLike = (existing: Like | undefined, like: Like, label: string) =>
    toggleLikeMutation.mutate(
      { existing, like },
      { onSuccess: () => toast.success(`${label} ${existing ? "unliké" : "liké"} !`) }
    );

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleLike(
      likes.find((like) => like.author_id === user?.uid),
      { entity_type: "article", entity_ref: article?.id || "", author_id: user?.uid || "" },
      "Article"
    );
  };

  const handleCommentLike = (e: React.MouseEvent, comment: Comment) => {
    e.preventDefault();
    toggleLike(
      comment.likes?.find((like) => like.author_id === user?.uid),
      { entity_type: "comment", entity_ref: comment.id || "", author_id: user?.uid || "" },
      "Commentaire"
    );
  };

  const handleCommentDelete = (comment: Comment) =>
    removeComment.mutate(comment, {
      onSuccess: () => toast.success("Commentaire supprimé !"),
      onError: () => toast.error("Erreur lors de la suppression du commentaire !"),
    });

  if (isPending) return <Loader />;
  if (error || !article) return <Text p="10">Error</Text>;

  const translation = getTranslated(article, lang);
  const lastImage = article.images.length - 1;

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > MIN_SWIPE_DISTANCE && currentImage < lastImage) setCurrentImage(currentImage + 1);
    if (distance < -MIN_SWIPE_DISTANCE && currentImage > 0) setCurrentImage(currentImage - 1);
  };

  return (
    <Container maxW="5xl" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
      <Button variant="ghost" px="3" h="10" onClick={() => window.history.back()}>
        <LuArrowLeft />
        Retour
      </Button>

      <Box
        position="relative"
        mt="6"
        aspectRatio={{ base: "4 / 3", md: "16 / 9" }}
        borderRadius="card"
        overflow="hidden"
        bg="surface"
        onTouchStart={(e) => {
          setTouchEnd(null);
          setTouchStart(e.targetTouches[0].clientX);
        }}
        onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={images[currentImage] || "/assets/images/loading_media.gif"}
              alt={translation.title}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        </AnimatePresence>
        <IconButton aria-label="Previous" {...roundButton} position="absolute" left="3" top="50%" transform="translateY(-50%)" visibility={currentImage === 0 ? "hidden" : "visible"} onClick={() => setCurrentImage(currentImage - 1)}>
          <LuArrowLeft />
        </IconButton>
        <IconButton aria-label="Next" {...roundButton} position="absolute" right="3" top="50%" transform="translateY(-50%)" visibility={currentImage >= lastImage ? "hidden" : "visible"} onClick={() => setCurrentImage(currentImage + 1)}>
          <LuArrowRight />
        </IconButton>
      </Box>

      <Heading as="h1" mt="8" fontSize={{ base: "3xl", md: "5xl" }} fontWeight="black" letterSpacing="-0.02em">
        {translation.title}
      </Heading>
      <Flex mt="4" gap={{ base: 3, md: 6 }} wrap="wrap" align="center" color="muted">
        <HStack gap="2">
          <LuCalendar />
          <Text>{getCurrentTimeInLetter(article.created_at, lang)}</Text>
        </HStack>
        <LikeButton liked={!!likes.find((like) => like.author_id === user?.uid)} count={likes.length} onClick={handleLike} />
        {translation.place?.address && (
          <HStack gap="2">
            <LuMapPin />
            <Text>{translation.place.address}</Text>
          </HStack>
        )}
      </Flex>

      <Box mt="10" fontSize={{ base: "md", md: "lg" }} css={proseStyles} dangerouslySetInnerHTML={{ __html: translation.content }} />

      <Box as="section" mt="16" pt="10" borderTopWidth="1px" borderColor="line">
        <HStack gap="2">
          <Heading as="h2" fontSize="2xl" fontWeight="black">
            Commentaires
          </Heading>
          <IconButton aria-label="Refresh" variant="plain" color="muted" _hover={{ color: "lime" }} onClick={() => refetchComments().then(() => toast.success("Commentaires rafraîchis !"))}>
            <LuRefreshCcw />
          </IconButton>
        </HStack>

        <chakra.form onSubmit={handleCommentSubmit} display="flex" gap="3" mt="6">
          <Input value={comment} onChange={(e) => setComment(e.currentTarget.value)} placeholder="Ajouter un commentaire..." css={fieldStyles} h="12" />
          <Button type="submit">Envoyer</Button>
        </chakra.form>

        <Stack as="ul" gap="4" mt="8" listStyleType="none">
          {comments.map((c) => (
            <Flex as="li" key={c.id} justify="space-between" gap="4" p="5" bg="surface" borderRadius="card" borderWidth="1px" borderColor="line">
              <Box>
                <HStack gap="3">
                  <Box position="relative" w="30px" h="30px" borderRadius="full" overflow="hidden">
                    <Image src={c.author?.picture?.url || "/assets/images/no-image.png"} alt="" fill sizes="30px" style={{ objectFit: "cover" }} />
                  </Box>
                  <Text fontWeight="bold">{c.author?.username}</Text>
                </HStack>
                <Text mt="3" color="whiteAlpha.900">
                  {c.content}
                </Text>
              </Box>
              <HStack gap="1" align="flex-start">
                <LikeButton
                  liked={!!c.likes?.find((like) => like.author_id === user?.uid)}
                  count={c.likes?.length}
                  onClick={(e) => handleCommentLike(e, c)}
                />
                {(c.author_id === user?.uid || isAdmin) && (
                  <IconButton aria-label="Delete" variant="plain" size="sm" color="muted" _hover={{ color: "rose" }} onClick={() => handleCommentDelete(c)}>
                    <LuTrash2 />
                  </IconButton>
                )}
              </HStack>
            </Flex>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default ArticleView;
