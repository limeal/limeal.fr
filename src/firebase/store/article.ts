import { getDocs, collection, query, where, DocumentData, Query, addDoc, deleteDoc, doc } from "firebase/firestore"

import { firestore } from "../firebase"
import { deleteComment, getCommentsFromParam } from "./comment";

import Article from "@/interfaces/article";
import { getCurrentTimeInLetter } from "@/utils/time";
import { deleteFile, getImagesURL } from "../storage";
import { deleteLike, getLikesFromEntity, getLikesFromParam } from "./like";

const getArticles = async (query?: Query<DocumentData, DocumentData>) => {
    const articles: Article[] = [];
    const docs = await getDocs(query ?? collection(firestore, "articles"));

    for (const document of docs.docs) {
        const data = document.data();

        const urls = await getImagesURL(data.images);
        const comments = await getCommentsFromParam("article_ref", document.id);
        const likes = await getLikesFromParam("entity", {
            type: "article",
            ref: document.id,
        });

        articles.push(<Article>{
            id: document.id,
            title: data.title,
            slug: data.slug,
            lore: data.lore,
            images: urls.map((url, index) => { return { ref: data.images[index].ref, url } }),
            content: data.content,
            place: data.place,
            created_at: getCurrentTimeInLetter(data.created_at),
            published: data.published,
            comments,
            likes,
        })
    }

    return articles;
}

const getArticlesFromParam = async (key: string, value: string) => await getArticles(query(collection(firestore, "articles"), where(key, "==", value)));
const addArticle = async (article: Article) => await addDoc(collection(firestore, "articles"), article);
const deleteArticle = async (article: Article) => {

    try {
        // First delete image from storage
        for (const image of article.images) {
            await deleteFile(image.ref);
        }

        // Then delete comments linked to the article
        const comments = await getCommentsFromParam("article_ref", article.id || '');
        for (const comment of comments) {
            await deleteComment(comment);
        }

        // Then delete likes from the article
        const likes = await getLikesFromEntity({
            type: "article",
            ref: article.id || '',
        });
        for (const like of likes) {
            await deleteLike(like);
        }
    } catch (err) { }


    await deleteDoc(doc(firestore, "articles", article.id || ''));
}

export {
    getArticles,
    getArticlesFromParam,
    addArticle,
    deleteArticle,
}