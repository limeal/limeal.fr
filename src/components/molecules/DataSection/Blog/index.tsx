"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import Article from "@/interfaces/article";
import { getArticles } from "@/firebase/store/article";

import ArticleCard from "@/components/atomes/ArticleCard";
import DataSection from "..";
import ACModal from "@/components/atomes/Modal/variants/ACModal";

const Blog = ({ lang }: { lang: string }) => {
  const [country, setCountry] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshArticles = async (isClick: boolean) => {
    setLoading(true);
    const articles = await getArticles();

    setCountries([
      ...new Set(
        articles
          .filter((article: Article) => article.place !== undefined)
          .map((article: Article) => (article.place ? article.place.country : ""))
      ),
    ]);
    setArticles(articles);

    if (isClick) {
      toast.success("Portfolio refreshed !");
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshArticles(false);
  }, []);

  return (
    <DataSection
      sectionName="blog"
      filters={countries}
      selectedFilter={country}
      setSelectedFilter={setCountry}
      loading={loading}
      elements={
        country === ""
          ? articles
          : articles.filter(
              (article: Article) =>
                article.place !== undefined && article.place.country === country
            )
      }
      lang={lang}
      refresh={refreshArticles}
      callbackAdd={({ setIsMenuOpen, refresh }) => (
        <ACModal setOpen={setIsMenuOpen} refresh={refresh} />
      )}
      callbackChild={({ element, refresh }) => (
        <ArticleCard article={element} refresh={refresh} />
      )}
    />
  );
};

export default Blog;
