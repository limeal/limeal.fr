import type { MetadataRoute } from "next";

import { CANONICAL_ORIGIN, HREFLANG, postPath } from "@/data/posts";
import { getAllPosts } from "@/utils/posts";

// Canonical URLs only (pauldev.fr), see CANONICAL_ORIGIN
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  return [
    // Lists the articles: changes with each new one
    { url: CANONICAL_ORIGIN, lastModified: posts[0]?.date, changeFrequency: "weekly", priority: 1 },
    ...posts.map((post) => {
      const versions = posts.filter((p) => p.slug === post.slug);
      return {
        url: `${CANONICAL_ORIGIN}${postPath(post.lang, post.slug)}`,
        lastModified: post.updated ?? post.date,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            versions.map((v) => [HREFLANG[v.lang], `${CANONICAL_ORIGIN}${postPath(v.lang, v.slug)}`])
          ),
        },
      };
    }),
  ];
}
