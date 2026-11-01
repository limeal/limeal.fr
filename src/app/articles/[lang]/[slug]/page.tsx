import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Box, Container, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuRss } from "react-icons/lu";

import { AUTHOR, CANONICAL_ORIGIN, HREFLANG, isPostLang, postPath, POSTS_SECTION, RSS_PATH } from "@/data/posts";
import { getPost, getPostLangs, renderPost } from "@/utils/posts";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import Prose from "@/components/features/posts/Prose";
import PostLangSync from "@/components/features/posts/PostLangSync";
import { formatDate, t } from "@/components/features/posts/translation";

type Props = { params: Promise<{ lang: string; slug: string }> };

const load = async ({ params }: Props) => {
  const { lang, slug } = await params;
  if (!isPostLang(lang)) return null;
  return getPost(slug, lang);
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const post = await load(props);
  if (!post) return {};

  const url = `${CANONICAL_ORIGIN}${postPath(post.lang, post.slug)}`;
  const shareImage = `${url}/opengraph-image`;
  const langs = await getPostLangs(post.slug);
  const original = langs.find((l) => l === post.translatedFrom) ?? post.lang;

  return {
    title: `${post.title} — ${AUTHOR}`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: AUTHOR, url: CANONICAL_ORIGIN }],
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(langs.map((l) => [HREFLANG[l], `${CANONICAL_ORIGIN}${postPath(l, post.slug)}`])),
        "x-default": `${CANONICAL_ORIGIN}${postPath(original, post.slug)}`,
      },
      types: { "application/rss+xml": `${CANONICAL_ORIGIN}${RSS_PATH}` },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: AUTHOR,
      locale: HREFLANG[post.lang],
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [AUTHOR],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [{ url: shareImage, alt: post.title }],
    },
  };
}

export default async function ArticlePage(props: Props) {
  const post = await load(props);
  if (!post) notFound();

  const [Content, langs] = await Promise.all([renderPost(post), getPostLangs(post.slug)]);
  const url = `${CANONICAL_ORIGIN}${postPath(post.lang, post.slug)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: HREFLANG[post.lang],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    keywords: post.tags.join(", "),
    url,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: AUTHOR, url: CANONICAL_ORIGIN },
  };

  return (
    <>
      <PostLangSync lang={post.lang} slug={post.slug} available={langs} />
      <Navigation hideContact />
      <main lang={HREFLANG[post.lang]}>
        <script
          type="application/ld+json"
          // "<" escaped so the content can never close the script tag
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Container as="article" maxW="4xl" px={{ base: 4, md: 8 }} pt={{ base: 8, md: 14 }} pb={{ base: 16, md: 24 }}>
          <HStack asChild gap="2" color="muted" fontSize="sm" fontWeight="bold" _hover={{ color: "lime" }} mb="10">
            <NextLink href={POSTS_SECTION}>
              <LuArrowLeft />
              {t("posts--back", post.lang)}
            </NextLink>
          </HStack>

          <Stack as="header" gap="5" mb={{ base: 10, md: 14 }}>
            <HStack gap="3" color="muted" fontSize="sm" wrap="wrap">
              <time dateTime={post.date}>{formatDate(post.date, post.lang)}</time>
              <Text as="span">·</Text>
              <Text as="span">
                {post.readingMinutes} {t("posts--min-read", post.lang)}
              </Text>
              {post.updated && (
                <>
                  <Text as="span">·</Text>
                  <Text as="span">
                    {t("posts--updated", post.lang)} <time dateTime={post.updated}>{formatDate(post.updated, post.lang)}</time>
                  </Text>
                </>
              )}
            </HStack>
            <Heading
              as="h1"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="black"
              lineHeight="1.1"
              letterSpacing="-0.02em"
            >
              {post.title}
            </Heading>
            <Text color="muted" fontSize={{ base: "lg", md: "xl" }} lineHeight="tall">
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
            {post.translatedFrom && (
              <Box borderLeftWidth="3px" borderColor="lime" pl="4" color="muted" fontSize="sm">
                {t("posts--translated", post.lang)}{" "}
                <Box asChild color="lime" textDecoration="underline" _hover={{ color: "white" }}>
                  <NextLink href={postPath(post.translatedFrom, post.slug)} hrefLang={post.translatedFrom}>
                    {t("posts--original", post.lang)} ({post.translatedFrom.toUpperCase()})
                  </NextLink>
                </Box>
              </Box>
            )}
          </Stack>

          <Prose>
            <Content />
          </Prose>

          <Flex
            mt={{ base: 14, md: 20 }}
            pt="8"
            borderTopWidth="1px"
            borderColor="line"
            direction={{ base: "column", sm: "row" }}
            align={{ base: "flex-start", sm: "center" }}
            justify="space-between"
            gap="4"
          >
            <Text fontWeight="bold">{t("posts--follow", post.lang)}</Text>
            <Button href={RSS_PATH} external variant="outline" h="10" px="5" fontSize="sm" icon={<LuRss />}>
              {t("posts--rss", post.lang)}
            </Button>
          </Flex>
        </Container>
      </main>
      <Footer />
    </>
  );
}
