import { getDocs, collection, query, where, DocumentData, Query, addDoc, deleteDoc, doc } from "firebase/firestore"

import { firestore } from "../firebase"
import Like from "@/interfaces/like";

const getLikes = async (query?: Query<DocumentData, DocumentData>) => {
    const likes: Like[] = [];
    const docs = await getDocs(query ?? collection(firestore, "comments"));

    for (const document of docs.docs) {
        const data = document.data();

        likes.push(<Like>{
            id: document.id,
            entity_type: data.entity_type,
            entity_ref: data.entity_ref,
            author_id: data.author_id,
        });
    }

    return likes;
}

const getLikesFromParam = async (key: string, value: any) => await getLikes(query(collection(firestore, "likes"), where(key, "==", value)));
const getLikesFromEntity = async (entity: { type: string, ref: string }) => await getLikes(
    query(collection(firestore, "likes"), where("entity_type", "==", entity.type), where("entity_ref", "==", entity.ref))
)

const addLike = async (like: Like) => await addDoc(collection(firestore, "likes"), like);
const deleteLike = async (like: Like) => await deleteDoc(doc(firestore, "likes", like.id || ''));


export {
    getLikes,
    getLikesFromParam,
    getLikesFromEntity,
    addLike,
    deleteLike,
}