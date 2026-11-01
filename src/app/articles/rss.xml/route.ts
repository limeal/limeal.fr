import { AUTHOR, CANONICAL_ORIGIN, postPath, RSS_PATH } from "@/data/posts";
import { getOriginalPosts } from "@/utils/posts";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Each article once, in the language it was written in
export async function GET() {
  const posts = await getOriginalPosts();

  const items = posts
    .map((post) => {
      const url = `${CANONICAL_ORIGIN}${postPath(post.lang, post.slug)}`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escape(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${AUTHOR} — Articles</title>
    <link>${CANONICAL_ORIGIN}/#articles</link>
    <description>Software &amp; product engineering, by ${AUTHOR}</description>
    <atom:link href="${CANONICAL_ORIGIN}${RSS_PATH}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
