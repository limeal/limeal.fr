"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { AiFillDelete } from "react-icons/ai";
import { MdPublish, MdUnpublished } from "react-icons/md";

import "./style.scss";
import { useAuthContext } from "@/contexts/AuthContext";
import { deleteArticle, publishArticle } from "@/firebase/store/article";
import Article from "@/interfaces/article";
import Link from "next/link";
import { useLangContext } from "@/contexts/LangContext";
import ArticleModal from "../Modal/variants/CAModal";
import { BsFillPencilFill } from "react-icons/bs";
import { sendEmailNewArticle } from "@/utils/article";

interface ArticleCardProps {
  article: Article;
  refresh: () => void;
}

const ArticleCard = ({ article, refresh }: ArticleCardProps) => {
  const [width, setWidth] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  const updateDimension = () => setWidth(window.innerWidth);
  const { lang } = useLangContext();

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const { user } = useAuthContext();

  const handleDelete = (e: any) => {
    e.preventDefault();
    deleteArticle(article)
      .then(() => {
        toast.success(
          `Article ${
            article.translations[lang]
              ? article.translations[lang].title
              : article.translations[article.defaultLanguage].title
          } deleted !`
        );
        refresh();
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const handlePublish = (e: any, state: boolean) => {
    e.preventDefault();
    publishArticle(article, state)
      .then(async () => {
        if (state)
          toast.promise(
            sendEmailNewArticle(
              article.translations[article.defaultLanguage].title || "",
              article.slug
            ),
            {
              pending: "Sending email to subscribers...",
              success: "Email sent!",
              error: "Failed to send email!",
            }
          );
        toast.success(
          `Article ${
            article.translations[lang]
              ? article.translations[lang].title
              : article.translations[article.defaultLanguage].title
          } ${state == false ? "un" : ""}published !`
        );
        refresh();
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const handleEdit = (e: any) => {
    e.preventDefault();
    setOpenEdit(true);
  };

  return (
    <div className="article-card">
      {openEdit && (
        <ArticleModal
          mode="edit"
          article={article}
          setOpen={setOpenEdit}
          refresh={refresh}
        />
      )}
      <Link href={`/blog/${article.slug}`} />
      {!article.published && <p className="unpublished">Unpublished</p>}
      <div className="thumbnail">
        <Image
          src={article.images[0].url || "/assets/images/no-image.png"}
          alt={
            article.translations[lang]
              ? article.translations[lang].title
              : article.translations[article.defaultLanguage].title
          }
          width={width < 728 ? 345 : 588}
          height={width < 728 ? 297 : 400}
          style={{
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
        {user && user.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
          <div className="actions">
            <button
              onClick={(e) => handleEdit(e)}
              style={{
                zIndex: 1,
              }}
            >
              <BsFillPencilFill />
            </button>
            <button
              onClick={(e) => handlePublish(e, !article.published)}
              style={{
                zIndex: 1,
              }}
            >
              {article.published ? <MdUnpublished /> : <MdPublish />}
            </button>
            <button
              onClick={(e) => handleDelete(e)}
              style={{
                zIndex: 1,
              }}
            >
              <AiFillDelete />
            </button>
          </div>
        )}
      </div>
      <ul>
        {Object.keys(article.translations).map((key) => (
          <li key={key} className={lang === key ? "active" : ""}>
            <a>{key}</a>
          </li>
        ))}
      </ul>
      <div className="content">
        <div className="metadata">
          <span>{article.created_at}</span>
          <h2>
            {article.translations[lang]
              ? article.translations[lang].title
              : article.translations[article.defaultLanguage].title}
          </h2>
        </div>
      </div>
      <p>
        {article.translations[lang]
          ? article.translations[lang].lore
          : article.translations[article.defaultLanguage].lore}
      </p>
    </div>
  );
};

export default ArticleCard;
