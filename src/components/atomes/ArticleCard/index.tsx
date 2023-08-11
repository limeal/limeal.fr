"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { AiFillDelete } from "react-icons/ai";

import "./style.scss";
import { useAuthContext } from "@/contexts/AuthContext";
import { deleteArticle } from "@/firebase/firestore";
import Article from "@/interfaces/article";

interface ArticleCardProps {
  article: Article;
  refresh: () => void;
}

const ArticleCard = ({ article, refresh }: ArticleCardProps) => {
  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const { user } = useAuthContext();
  const router = useRouter();

  const handleDelete = (e: any) => {
    e.preventDefault();
    deleteArticle(article)
      .then(() => {
        toast.success(`Article ${article.title} deleted !`);
        refresh();
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  return (
    <div className="article-card" onClick={() => router.push(`/blog/${article.slug}`)}>
      <div className="thumbnail">
        <Image
          src={article.images[0].url || "/assets/images/no-image.png"}
          alt={article.title}
          width={width < 728 ? 345 : 588}
          height={width < 728 ? 297 : 400}
          style={{
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
        {user && user.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
          <button onClick={(e) => handleDelete(e)}>
            <AiFillDelete />
          </button>
        )}
      </div>
      <div className="content">
        <div className="metadata">
          <span>{article.created_at}</span>
          <h2>
            {article.title}
          </h2>
        </div>
      </div>
      <p>{article.lore}</p>
    </div>
  );
};

export default ArticleCard;
