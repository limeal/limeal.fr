import { getArticleBySlug } from "@/firebase/firestore";
import Article from "@/interfaces/article";
import { useEffect, useState } from "react";
import { ImLocation } from "react-icons/im";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Image from "next/image";

import "./style.scss";

const Article = ({ slug }: { slug: string }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState(false);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    getArticleBySlug(slug).then((article: Article | null) => {
      setArticle(article);
    });
  }, [slug]);

  if (article == null) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div className="article">
      <button className="back" onClick={() => window.history.back()}>
        <IoArrowBack />
        Retour
      </button>
      <section className="hero">
        <div className="slider">
          <button
            style={{
              visibility: currentImage === 0 ? "hidden" : "visible",
            }}
            onClick={() => setCurrentImage(currentImage - 1)}
          >
            <AiOutlineArrowLeft />
          </button>
          <Image src={article.images[currentImage].url || ''} alt={article.title} width={0} height={0} sizes="100vw" className="slider-img" />
          <button
            style={{
              visibility:
                currentImage === article.images.length - 1
                  ? "hidden"
                  : "visible",
            }}
            onClick={() => setCurrentImage(currentImage + 1)}
          >
            <AiOutlineArrowRight />
          </button>
        </div>
        <h1>{article.title}</h1>
        <div>
          <span>
            <BsFillCalendarDateFill />
            {article.created_at}
          </span>
          <span>
            <ImLocation />
            {article.place?.address}
          </span>
        </div>
      </section>
      <br />
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
};

export default Article;
