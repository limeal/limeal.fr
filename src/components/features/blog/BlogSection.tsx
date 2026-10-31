"use client";

import { useEffect, useState } from "react";

import Article from "@/interfaces/article";
import { getArticles } from "@/firebase/store/article";
import { useLangContext } from "@/contexts/LangContext";
import useIsAdmin from "@/hooks/useIsAdmin";
import { toast } from "@/components/ui/Toaster";
import CollectionSection from "@/components/features/collection/CollectionSection";
import ArticleCard from "./ArticleCard";
import ArticleFormModal from "./ArticleFormModal";
import { getTranslated } from "./translation";

const BlogSection = () => {
  const [country, setCountry] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = useIsAdmin();
  const { lang, getTranslation } = useLangContext();

  const countryOf = (article: Article) => getTranslated(article, lang).place?.country;

  const refreshArticles = async (isClick: boolean) => {
    setLoading(true);
    const all = await getArticles();
    const visible = isAdmin ? all : all.filter((article: Article) => article.published);

    setArticles(
      visible.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    if (isClick) {
      toast.success("Blog refreshed !");
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshArticles(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived from the articles so the filters follow the language switch
  const countries = [
    ...new Set(articles.map(countryOf).filter((c): c is string => !!c)),
  ];

  return (
    <CollectionSection
      id="blog"
      title={getTranslation("blog--title")}
      description={getTranslation("blog--description")}
      emptyText={getTranslation("blog--error")}
      filters={countries}
      selectedFilter={country}
      onFilterChange={setCountry}
      loading={loading}
      items={country === "" ? articles : articles.filter((a) => countryOf(a) === country)}
      getKey={(article) => article.id ?? article.slug}
      onRefresh={() => refreshArticles(true)}
      renderItem={(article) => (
        <ArticleCard article={article} refresh={() => refreshArticles(false)} />
      )}
      renderAddModal={(close) => (
        <ArticleFormModal mode="create" onClose={close} refresh={() => refreshArticles(false)} />
      )}
    />
  );
};

export default BlogSection;
