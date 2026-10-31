import Article from "@/interfaces/article";

// Article content in the current language, falling back to its default language
export const getTranslated = (article: Article, lang: string) =>
  article.translations[lang] || article.translations[article.defaultLanguage];
