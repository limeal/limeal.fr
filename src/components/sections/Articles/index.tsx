"use client";

import { Grid } from "@chakra-ui/react";
import { LuRss } from "react-icons/lu";

import { useLangContext } from "@/contexts/LangContext";
import { isPostLang, pickVersions, RSS_PATH } from "@/data/posts";
import type { PostMeta } from "@/utils/posts";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import PostCard from "@/components/features/posts/PostCard";

// Every article, in the site language; reading happens on the article's own page
const Articles = ({ posts }: { posts: PostMeta[] }) => {
  const { lang: siteLang, getTranslation } = useLangContext();
  const lang = isPostLang(siteLang) ? siteLang : "en";

  return (
    <Section id="articles">
      <SectionHeader
        eyebrow={getTranslation("posts--eyebrow")}
        title={getTranslation("tabs--articles")}
        description={getTranslation("posts--description")}
        actions={
          <Button href={RSS_PATH} external variant="outline" h="9" px="4" fontSize="sm" icon={<LuRss />}>
            {getTranslation("posts--rss")}
          </Button>
        }
      />
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 5, md: 6 }}>
        {pickVersions(posts, lang).map((post) => (
          <Reveal key={post.slug}>
            <PostCard post={post} lang={lang} />
          </Reveal>
        ))}
      </Grid>
    </Section>
  );
};

export default Articles;
