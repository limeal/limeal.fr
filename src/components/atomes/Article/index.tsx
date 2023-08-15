import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ImLocation } from "react-icons/im";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiFillHeart,
  AiOutlineHeart,
  AiFillDelete,
} from "react-icons/ai";
import { LuRefreshCcw } from "react-icons/lu";

import { getArticlesFromParam } from "@/firebase/store/article";
import Article from "@/interfaces/article";
import Comment from "@/interfaces/comment";

import "./style.scss";
import {
  addComment,
  deleteComment,
  getCommentsFromParam,
} from "@/firebase/store/comment";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import moment from "moment";
import Like from "@/interfaces/like";
import { addLike, deleteLike, getLikesFromEntity } from "@/firebase/store/like";
import BaseLoading from "../BaseLoading";
import { useLangContext } from "@/contexts/LangContext";

const Article = ({ slug }: { slug: string }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);

  const [comment, setComment] = useState<string>("");
  const [currentImage, setCurrentImage] = useState(0);

  const { lang } = useLangContext();
  
  // Swipe
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const { user } = useAuthContext();

  useEffect(() => {
    getArticlesFromParam("slug", slug)
      .then((article: Article[]) => {
        setArticle(article ? article[0] : null);
      })
      .catch(() => setError(true));
  }, [slug]);

  useEffect(() => {
    refreshComments();
    refreshLikes();
  }, [article]);

  const refreshComments = (isClick?: boolean) => {
    getCommentsFromParam("article_ref", article?.id || "").then(
      (comments: Comment[]) => {
        setComments(comments);

        if (isClick) {
          toast.success("Commentaires rafraîchis !");
        }
      }
    );
  };

  const refreshLikes = () => {
    getLikesFromEntity({
      type: "article",
      ref: article?.id || "",
    }).then((newLikes: Like[]) => {
      setLikes(newLikes);
    });
  };

  const handleCommentSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const newComment: Comment = {
      article_ref: article?.id || "",
      author_id: user?.uid || "",
      content: comment || "",
      created_at: moment().format("YYYY-MM-DD"),
    };

    addComment(newComment)
      .then(() => {
        toast.success("Commentaire ajouté !");
        setComment("");
        refreshComments(false);
      })
      .catch((err) => {
        toast.error("Erreur lors de l'ajout du commentaire !");
      });
  };

  const handleLike = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const like = likes.find((like) => like.author_id === user?.uid);

    if (like) {
      deleteLike(like).then(() => {
        toast.success("Article unliké !");
        refreshLikes();
      });
      return;
    }

    const newLike: Like = {
      entity_type: "article",
      entity_ref: article?.id || "",
      author_id: user?.uid || "",
    };

    addLike(newLike).then(() => {
      toast.success("Article liké !");
      refreshLikes();
    });
  };

  const handleCommentLike = (e: any, comment: Comment) => {
    e.preventDefault();
    e.stopPropagation();

    const like = comment.likes?.find((like) => like.author_id === user?.uid);

    if (like) {
      deleteLike(like).then(() => {
        toast.success("Commentaire unliké !");
        refreshComments(false);
      });
      return;
    }

    const newLike: Like = {
      entity_type: "comment",
      entity_ref: comment?.id || "",
      author_id: user?.uid || "",
    };

    addLike(newLike).then(() => {
      toast.success("Commentaire liké !");
      refreshComments(false);
    });
  };

  const handleCommentDelete = (e: any, comment: Comment) => {
    e.preventDefault();
    e.stopPropagation();

    deleteComment(comment)
      .then(() => {
        toast.success("Commentaire supprimé !");
        refreshComments(false);
      })
      .catch(() => {
        toast.error("Erreur lors de la suppression du commentaire !");
      });
  };

  if (article == null) return <BaseLoading />
  if (error) return <div>Error</div>;

  const minSwipeDistance = 60

  const onTouchStart = (e: any) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: any) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      if (currentImage < article.images.length - 1) {
        setCurrentImage(currentImage + 1)
      }
    } else if (isRightSwipe) {
      if (currentImage > 0) {
        setCurrentImage(currentImage - 1)
      }
    }
  }

  return (
    <div className="article">
      <button className="back" onClick={() => window.history.back()}>
        <IoArrowBack />
        Retour
      </button>
      <section className="hero">
        <div className="slider"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            style={{
              visibility: currentImage === 0 ? "hidden" : "visible",
            }}
            onClick={() => setCurrentImage(currentImage - 1)}
          >
            <AiOutlineArrowLeft />
          </button>
          <Image
            src={article.images[currentImage].url || ""}
            alt={article.translations[lang] ? article.translations[lang].title : article.translations[article.defaultLanguage].title}
            width={0}
            height={0}
            sizes="100vw"
            className="slider-img"
          />
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
        <h1>{article.translations[lang] ? article.translations[lang].title : article.translations[article.defaultLanguage].title}</h1>
        <div>
          <span>
            <BsFillCalendarDateFill />
            {article.created_at}
          </span>
          <span>
            <button
              onClick={handleLike}
              className={
                likes.find((like) => like.author_id === user?.uid)
                  ? "active"
                  : ""
              }
            >
              {likes.find((like) => like.author_id === user?.uid) ? (
                <AiFillHeart />
              ) : (
                <AiOutlineHeart />
              )}
            </button>
            {likes.length}
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
        dangerouslySetInnerHTML={{ __html: article.translations[lang] ? article.translations[lang].content : article.translations[article.defaultLanguage].content }}
      />
      <br />
      <section className="comments">
        <div>
          <h2>Commentaires</h2>
          <button onClick={() => refreshComments(true)}>
            <LuRefreshCcw />
          </button>
        </div>
        <form onSubmit={handleCommentSubmit}>
          <input
            value={comment}
            type="text"
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder="Ajouter un commentaire..."
          />
          <button type="submit">Envoyer</button>
        </form>
        {comments && (
          <ul>
            {comments.map((comment: Comment, index) => (
              <li key={index}>
                <div>
                  <div className="left">
                    <div>
                      <Image
                        src={comment.author?.picture?.url || ""}
                        alt={comment.author?.username + " picture" || ""}
                        width={30}
                        height={30}
                        style={{
                          borderRadius: "50%",
                        }}
                      />
                      <h3>{comment.author?.username}</h3>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                  <div className="right">
                    <div>
                      <button
                        onClick={(e) => handleCommentLike(e, comment)}
                        className={
                          comment.likes?.find(
                            (like) => like.author_id === user?.uid
                          )
                            ? "active"
                            : ""
                        }
                      >
                        {comment.likes?.find(
                          (like) => like.author_id === user?.uid
                        ) ? (
                          <AiFillHeart />
                        ) : (
                          <AiOutlineHeart />
                        )}
                      </button>
                      <span>{comment.likes?.length}</span>
                    </div>
                    {((comment.author_id === user?.uid) ||
                      (user?.uid ===
                        process.env.NEXT_PUBLIC_ADMIN_USER_ID)) && (
                      <button onClick={(e) => handleCommentDelete(e, comment)}>
                        <AiFillDelete />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Article;
