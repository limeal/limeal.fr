"use client";

import { useState } from "react";

import Article from "@/interfaces/article";
import { useArticles } from "@/hooks/queries/blog";
import { useLangContext } from "@/contexts/LangContext";
import useIsAdmin from "@/hooks/useIsAdmin";
import { toast } from "@/components/ui/Toaster";
import CollectionSection from "@/components/features/collection/CollectionSection";
import ArticleCard from "./ArticleCard";
import ArticleFormModal from "./ArticleFormModal";
import { getTranslated } from "./translation";

const BlogSection = () => {
  const [country, setCountry] = useState<string>("");

  const isAdmin = useIsAdmin();
  const { lang, getTranslation } = useLangContext();
  const { data: articles = [], isPending, refetch } = useArticles(isAdmin);

  const countryOf = (article: Article) => getTranslated(article, lang).place?.country;

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
      loading={isPending}
      items={country === "" ? articles : articles.filter((a) => countryOf(a) === country)}
      getKey={(article) => article.id ?? article.slug}
      onRefresh={() => refetch().then(() => toast.success("Blog refreshed !"))}
      renderItem={(article) => (
        <ArticleCard article={article} />
      )}
      renderAddModal={(close) => (
        <ArticleFormModal mode="create" onClose={close} />
      )}
    />
  );
};

export default BlogSection;
