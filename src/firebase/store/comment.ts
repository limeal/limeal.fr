import { getDocs, collection, query, where, DocumentData, Query, addDoc, deleteDoc, doc } from "firebase/firestore"

import { firestore } from "../firebase"
import { getCurrentTimeInLetter } from "@/utils/time";
import Comment from "@/interfaces/comment";
import { getProfileFromId } from "./profile";
import { deleteLike, getLikesFromEntity, getLikesFromParam } from "./like";

const getComments = async (query?: Query<DocumentData, DocumentData>) => {
    const comments: Comment[] = [];
    const docs = await getDocs(query ?? collection(firestore, "comments"));

    for (const document of docs.docs) {
        const data = document.data();

        const profile = await getProfileFromId(data.author_id);
        const likes = await getLikesFromEntity({
            type: "comment",
            ref: document.id,
        });

        comments.push(<Comment>{
            id: document.id,
            article_ref: data.article_ref,
            author_id: data.author_id,
            author: profile,
            content: data.content,
            created_at: getCurrentTimeInLetter(data.created_at),
            likes,
        });
    }

    return comments;
}

const getCommentsFromParam = async (key: string, value: string) => await getComments(query(collection(firestore, "comments"), where(key, "==", value)));

const addComment = async (comment: Comment) => await addDoc(collection(firestore, "comments"), comment);
const deleteComment = async (comment: Comment) => {

    // Delete likes from the article
    try {
        const likes = await getLikesFromEntity({
            type: "comment",
            ref: comment.id || '',
        });
        for (const like of likes) {
            await deleteLike(like);
        }
    } catch (err) { }

    await deleteDoc(doc(firestore, "comments", comment.id || ''));
}


export {
    getComments,
    getCommentsFromParam,
    addComment,
    deleteComment,
}