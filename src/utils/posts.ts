import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import * as runtime from "react/jsx-runtime";
import matter from "gray-matter";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { z } from "zod";

import { POST_LANGS, type PostLang } from "@/data/posts";

const ROOT = path.join(process.cwd(), "content/articles");

// Same rule as the rest of pauldev.fr: the pseudonym never shows up there
const PSEUDO = /limeal/i;

const frontmatter = z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Image shown on the article card, a path under public/ (e.g. /images/articles/<slug>/cover.svg)
    cover: z.string().startsWith("/").optional(),
    // Only listed by `next dev`
    draft: z.boolean().default(false),
    // On translations: the original's language and hash (see `pnpm articles:status`)
    translatedFrom: z.enum(POST_LANGS).optional(),
    sourceHash: z.string().optional(),
});

export interface PostMeta {
    slug: string;
    lang: PostLang;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    updated?: string;
    tags: string[];
    cover?: string;
    draft: boolean;
    translatedFrom?: PostLang;
    readingMinutes: number;
}

export interface Post extends PostMeta {
    body: string;
}

const day = (date: Date) => date.toISOString().slice(0, 10);

const readPost = async (slug: string, lang: PostLang): Promise<Post | null> => {
    const file = path.join(ROOT, slug, `${lang}.mdx`);
    const raw = await fs.readFile(file, "utf8").catch(() => null);
    if (raw == null) return null;

    if (PSEUDO.test(raw)) {
        throw new Error(`${file} mentions the pseudonym, which pauldev.fr must never show`);
    }

    const { data, content } = matter(raw);
    const parsed = frontmatter.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid frontmatter in ${file}: ${z.prettifyError(parsed.error)}`);
    }
    const meta = parsed.data;

    // Hangul is not spaced like Latin text: count characters there instead
    const words = lang === "kr" ? content.length / 2 : content.split(/\s+/).length;

    return {
        slug,
        lang,
        title: meta.title,
        description: meta.description,
        date: day(meta.date),
        updated: meta.updated && day(meta.updated),
        tags: meta.tags,
        cover: meta.cover,
        draft: meta.draft,
        translatedFrom: meta.translatedFrom,
        readingMinutes: Math.max(1, Math.round(words / 220)),
        body: content,
    };
};

const visible = (post: Post | null): post is Post =>
    !!post && (!post.draft || process.env.NODE_ENV === "development");

// Every language version of every article, newest first
export const getAllPosts = cache(async (): Promise<Post[]> => {
    const entries = await fs.readdir(ROOT, { withFileTypes: true }).catch(() => []);
    const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const posts = await Promise.all(
        slugs.flatMap((slug) => POST_LANGS.map((lang) => readPost(slug, lang)))
    );

    return posts.filter(visible).sort((a, b) => b.date.localeCompare(a.date));
});

export const getPost = cache(async (slug: string, lang: PostLang) => {
    const post = await readPost(slug, lang);
    return visible(post) ? post : null;
});

// Languages this article is available in
export const getPostLangs = async (slug: string) =>
    (await getAllPosts()).filter((p) => p.slug === slug).map((p) => p.lang);

// What the home page needs to list every version, without the bodies
export const getAllPostMetas = async (): Promise<PostMeta[]> =>
    (await getAllPosts()).map(({ body: _body, ...meta }) => meta);

// The versions written by hand, for the RSS feed
export const getOriginalPosts = async () =>
    (await getAllPosts()).filter((p) => !p.translatedFrom);

// Compiled once per server instance in production (articles only change on deploy)
const compiled = new Map<string, ReturnType<typeof compile>>();

const compile = async (body: string) => {
    const { default: Content } = await evaluate(body, {
        ...runtime,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            // By default every grammar Shiki knows (200+) is loaded up front: ~2 s
            // locally, past the function timeout on Vercel. Preload the usual
            // ones, the rest load when an article uses them.
            [rehypeShiki, { theme: "github-dark-default", langs: ["ts", "tsx", "js", "go", "bash", "json"], lazy: true }],
        ],
    });
    return Content;
};

export const renderPost = (post: Post) => {
    const key = `${post.slug}/${post.lang}`;
    if (process.env.NODE_ENV !== "production") return compile(post.body);

    if (!compiled.has(key)) compiled.set(key, compile(post.body));
    return compiled.get(key)!;
};
