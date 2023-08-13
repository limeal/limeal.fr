"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import Article from "@/interfaces/article";
import { getArticles } from "@/firebase/store/article";

import ArticleCard from "@/components/atomes/ArticleCard";
import DataSection from "..";
import ACModal from "@/components/atomes/Modal/variants/ACModal";
import { useAuthContext } from "@/contexts/AuthContext";

const Blog = ({ lang }: { lang: string }) => {
  const [country, setCountry] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuthContext();

  const refreshArticles = async (isClick: boolean) => {
    setLoading(true);
    const articles = await getArticles();
    const filteredArticles = user?.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID ? articles : articles.filter((article: Article) => article.published);

    setCountries([
      ...new Set(
        filteredArticles
          .filter((article: Article) => article.place !== undefined)
          .map((article: Article) => (article.place ? article.place.country : ""))
      ),
    ]);
    setArticles(filteredArticles);

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
