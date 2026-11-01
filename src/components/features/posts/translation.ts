import langs from "@/contexts/lang.json";
import type { PostLang } from "@/data/posts";

// Server-side counterpart of getTranslation: article pages are rendered in the
// language of their URL, not the one saved in the visitor's browser
export const t = (key: string, lang: PostLang) => {
  const text = langs.find((entry) => entry.id === key) as Record<string, string> | undefined;
  return text?.[lang] || text?.en || "";
};

const LOCALE: Record<PostLang, string> = { en: "en-US", fr: "fr-FR", es: "es-ES", kr: "ko-KR" };

export const formatDate = (date: string, lang: PostLang) =>
  new Date(date).toLocaleDateString(LOCALE[lang], { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
