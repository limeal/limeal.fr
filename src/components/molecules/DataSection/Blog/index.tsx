"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import Article from "@/interfaces/article";
import { getArticles } from "@/firebase/store/article";

import ArticleCard from "@/components/atomes/ArticleCard";
import DataSection from "..";
import { useAuthContext } from "@/contexts/AuthContext";
import ArticleModal from "@/components/atomes/Modal/variants/CAModal";
import { useLangContext } from "@/contexts/LangContext";

const Blog = () => {
  const [country, setCountry] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuthContext();
  const { lang } = useLangContext();

  const refreshArticles = async (isClick: boolean) => {
    setLoading(true);
    const articles = await getArticles();
    const filteredArticles = user?.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID ? articles : articles.filter((article: Article) => article.published);

    setCountries([
      ...new Set(
        filteredArticles
          .filter((article: Article) => {
            const translation = article.translations[lang] || article.translations[article.defaultLanguage];
            return translation.place !== undefined;
          })
          .map((article: Article) => {
            const translation = article.translations[lang] || article.translations[article.defaultLanguage];
            return translation.place ? translation.place.country: "";
          })
      ),
    ]);
    setArticles(filteredArticles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))

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
              (article: Article) => {
                const translation = article.translations[lang] || article.translations[article.defaultLanguage];
                return translation.place && translation.place.country === country;
              }
            )
      }
      refresh={refreshArticles}
      callbackAdd={({ setIsMenuOpen, refresh }) => (
        <ArticleModal mode="create" setOpen={setIsMenuOpen} refresh={refresh} />
      )}
      callbackChild={({ element, refresh }) => (
        <ArticleCard article={element} refresh={refresh} />
      )}
    />
  );
};

export default Blog;
