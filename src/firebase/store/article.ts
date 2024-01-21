import { getDocs, collection, query, where, DocumentData, Query, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore"

import { firestore, storage } from "../firebase"
import { deleteComment, getCommentsFromParam } from "./comment";

import Article from "@/interfaces/article";
import { getCurrentTimeInLetter } from "@/utils/time";
import { deleteFile, getFileFromUrl, getImagesURL, uploadFile } from "../storage";
import { deleteLike, getLikesFromEntity, getLikesFromParam } from "./like";
import moment from "moment";
import { getDownloadURL, ref } from "firebase/storage";

const getArticles = async (
    query?: Query<DocumentData, DocumentData>
) => {
    const articles: Article[] = [];
    const docs = await getDocs(query ?? collection(firestore, "articles"));

    for (const document of docs.docs) {
        const data = document.data();

        let images: any = data.images;
        if (!query) {
            images = await getImagesURL([data.images[0]]);
            images = images.map((url: string, index: any) => { return { ref: data.images[index].ref, url } })
        }

        articles.push(<Article>{
            id: document.id,
            translations: data.translations,
            defaultLanguage: data.defaultLanguage,
            slug: data.slug,
            images,
            created_at: data.created_at,
            published: data.published,
            comments: [],
            likes: [],
        })
    }

    return articles.sort((
        a: Article,
        b: Article
    ) => {
        return moment(b.created_at, 'YYYY-MM-DD').diff(moment(a.created_at, 'YYYY-MM-DD'));
    });
}

const getArticlesFromParam = async (key: string, value: string) => await getArticles(query(collection(firestore, "articles"), where(key, "==", value)));
const addArticle = async (article: Article) => await addDoc(collection(firestore, "articles"), article);
const publishArticle = async (article: Article, state: boolean) => await setDoc(doc(firestore, "articles", article.id || ''), { published: state }, { merge: true });
const updateArticle = async (article: Article) => await setDoc(doc(firestore, "articles", article.id || ''), { ...article });

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

const patchArticle = async (article: Article) => {

    // Retrieve all images from the article
    /* const images = [];

    for (const image of article.images) {
        images.push(await getFileFromUrl(image.ref, image.ref.split('/')[2]));
    }

    console.log(images);

    // Delete all images from the article
    for (const aimage of article.images) {
        await deleteFile(aimage.ref);
    }

    article.images = [];

    // Upload all images from the article
    for (const image of images) {
        const path = `articles/${article.id}/${image.name}`;
        await uploadFile(image, path);
    }

    // Update article
    for (const image of images) {
        const p = `articles/${article.id}/${image.name}`;
        article.images.push({ ref: p, url: await getDownloadURL(ref(storage, p)) });
    } */
}

export {
    getArticles,
    getArticlesFromParam,
    addArticle,
    deleteArticle,
    updateArticle,
    publishArticle,
    patchArticle,
}