import { ImageResponse } from "next/og";

import { isPostLang } from "@/data/posts";
import { getPost } from "@/utils/posts";

export const alt = "Pauldev · article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const notFound = () => new Response("Article not found", { status: 404 });
const labels = {
  en: { header: "PAULDEV", topics: "AGENTS · WORK · NEW LOOPS", site: "pauldev.fr" },
  fr: { header: "PAULDEV", topics: "AGENTS · MÉTIERS · NOUVELLES BOUCLES", site: "pauldev.fr" },
  es: { header: "PAULDEV", topics: "AGENTES · TRABAJO · NUEVOS BUCLES", site: "pauldev.fr" },
  kr: { header: "PAULDEV", topics: "", site: "pauldev.fr" },
} as const;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isPostLang(lang)) return notFound();

  const post = await getPost(slug, lang);
  if (!post) return notFound();
  const copy = labels[lang];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          color: "#fff",
          background: "radial-gradient(circle at 82% 22%, #35351c 0, #171719 35%, #101012 78%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#fbd52b", fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>
          <div style={{ width: 16, height: 16, borderRadius: 99, background: "#fbd52b" }} />
          {copy.header}
        </div>
        {lang === "kr" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, height: 260 }}>
            <div style={{ width: 96, height: 96, borderRadius: 48, border: "3px solid #fbd52b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <div style={{ width: 20, height: 20, borderRadius: 20, background: "#fbd52b" }} />
              <div style={{ width: 40, height: 20, borderRadius: "24px 24px 10px 10px", background: "#fbd52b" }} />
            </div>
            <div style={{ width: 72, height: 2, background: "#77747d" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ width: 38, height: 38, borderRadius: 38, background: "#aaa528" }} />
              <div style={{ width: 38, height: 38, borderRadius: 38, background: "#d6bd31", marginLeft: 26 }} />
              <div style={{ width: 38, height: 38, borderRadius: 38, background: "#fbd52b" }} />
            </div>
            <div style={{ width: 72, height: 2, background: "#77747d" }} />
            <div style={{ width: 96, height: 96, borderRadius: 48, border: "3px solid #fbd52b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 42, borderRight: "5px solid #fbd52b", borderBottom: "5px solid #fbd52b", transform: "rotate(45deg) translate(-3px, -5px)" }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 970 }}>
            <div style={{ color: "#fbd52b", fontSize: 24, fontWeight: 600 }}>{copy.topics}</div>
            <div style={{ fontSize: 62, lineHeight: 1.12, fontWeight: 800, letterSpacing: -2 }}>{post.title}</div>
            <div style={{ color: "#c5c4c8", fontSize: 27, lineHeight: 1.35 }}>{post.description}</div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#aaa9ad", fontSize: 21 }}>
          <span>{copy.site}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 10, height: 10, borderRadius: 10, background: "#fbd52b" }} />
            <span style={{ width: 34, height: 2, background: "#77747d" }} />
            <span style={{ width: 10, height: 10, borderRadius: 10, border: "2px solid #fbd52b" }} />
            <span style={{ width: 34, height: 2, background: "#77747d" }} />
            <span style={{ width: 10, height: 10, borderRadius: 10, background: "#fbd52b" }} />
          </span>
        </div>
      </div>
    ),
    size,
  );
}
