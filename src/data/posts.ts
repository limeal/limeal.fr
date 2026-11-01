// Public articles (content/articles/<slug>/<lang>.mdx), written for search
// engines. Not to be confused with the private friends' blog under /blog.

// Same languages as the site switcher (LangContext)
export const POST_LANGS = ["en", "fr", "es", "kr"] as const;
export type PostLang = (typeof POST_LANGS)[number];

export const isPostLang = (value: string): value is PostLang =>
    (POST_LANGS as readonly string[]).includes(value);

// The site says "kr", standards (hreflang, <html lang>) say "ko"
export const HREFLANG: Record<PostLang, string> = { en: "en", fr: "fr", es: "es", kr: "ko" };

// The site answers on two domains: every article points search engines to the
// discreet one, so they never see the content twice
// (www: Vercel redirects the bare domain there, and a canonical URL must not redirect)
export const CANONICAL_ORIGIN = "https://www.pauldev.fr";

export const AUTHOR = "Paul";

type Version = { slug: string; lang: PostLang; date: string; translatedFrom?: PostLang };

// One entry per article, newest first: the version in `lang`, or the original
// while the translation is missing
export const pickVersions = <T extends Version>(posts: T[], lang: PostLang): T[] =>
    [...new Set(posts.map((p) => p.slug))]
        .map(
            (slug) =>
                posts.find((p) => p.slug === slug && p.lang === lang) ??
                posts.find((p) => p.slug === slug && !p.translatedFrom) ??
                posts.find((p) => p.slug === slug)!
        )
        .sort((a, b) => b.date.localeCompare(a.date));

export const postPath = (lang: PostLang, slug: string) => `/articles/${lang}/${slug}`;

// The articles are listed in a section of the home page
export const POSTS_SECTION = "/#articles";

export const RSS_PATH = "/articles/rss.xml";
