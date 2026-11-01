"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { onLangChange, useLangContext } from "@/contexts/LangContext";
import { postPath, type PostLang } from "@/data/posts";

// Keeps the site language and the article URL in step: opening an article
// switches the interface to its language, and picking another language in the
// navbar opens that version (when it exists)
const PostLangSync = ({ lang, slug, available }: { lang: PostLang; slug: string; available: PostLang[] }) => {
  const router = useRouter();
  const { updateLang } = useLangContext();

  useEffect(() => {
    updateLang(lang);
    // Subscribed after the call above, so only later choices navigate
    return onLangChange((next) => {
      if (next !== lang && available.includes(next as PostLang)) router.push(postPath(next as PostLang, slug));
    });
  }, [lang, slug, available, updateLang, router]);

  return null;
};

export default PostLangSync;
