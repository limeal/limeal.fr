import NextLink from "next/link";
import { Box, Heading, HStack, Image, Stack, Text } from "@chakra-ui/react";

import { postPath, type PostLang } from "@/data/posts";
import type { PostMeta } from "@/utils/posts";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { formatDate, t } from "./translation";

// `lang` is the language of the list: an article shown in another one (its
// translation is missing) says so
const PostCard = ({ post, lang }: { post: PostMeta; lang: PostLang }) => (
  <NextLink href={postPath(post.lang, post.slug)} hrefLang={post.lang}>
    <Card interactive h="full" display="flex" flexDirection="column">
      {/* Decorative: the title right below says what the article is about */}
      {post.cover && (
        <Box overflow="hidden" borderBottomWidth="1px" borderColor="line" aspectRatio="1200 / 630">
          <Image
            src={post.cover}
            alt=""
            w="full"
            h="full"
            objectFit="cover"
            transition="transform 0.6s ease"
            _groupHover={{ transform: "scale(1.04)" }}
          />
        </Box>
      )}
      <Stack gap="4" flex="1" p={{ base: 6, md: 8 }}>
        <HStack gap="3" color="muted" fontSize="sm" wrap="wrap">
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
          <Text as="span">·</Text>
          <Text as="span">
            {post.readingMinutes} {t("posts--min-read", lang)}
          </Text>
          {post.lang !== lang && (
            <Pill py="0.5" px="2" fontSize="xs" accent>
              {post.lang.toUpperCase()}
            </Pill>
          )}
        </HStack>
        <Heading
          as="h2"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="black"
          lineHeight="short"
          _groupHover={{ color: "lime" }}
          transition="color 0.3s ease"
        >
          {post.title}
        </Heading>
        <Text color="muted" lineHeight="tall" flex="1">
          {post.description}
        </Text>
        {post.tags.length > 0 && (
          <HStack gap="2" wrap="wrap">
            {post.tags.map((tag) => (
              <Pill key={tag} py="1" px="3" fontSize="xs">
                #{tag}
              </Pill>
            ))}
          </HStack>
        )}
      </Stack>
    </Card>
  </NextLink>
);

export default PostCard;
