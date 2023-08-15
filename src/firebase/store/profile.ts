import { getDocs, collection, query, where, DocumentData, Query, addDoc, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore"

import { firestore } from "../firebase"
import Profile from "@/interfaces/profile";
import { deleteFile, getImagesURL } from "../storage";

const getProfiles = async (query?: Query<DocumentData, DocumentData>) => {
    const profiles: Profile[] = [];
    const docs = await getDocs(query ?? collection(firestore, "profiles"));

    for (const document of docs.docs) {
        const data = document.data();

        const images = await getImagesURL([data.picture]);

        profiles.push(<Profile>{
            id: document.id,
            username: data.username,
            picture: {
                ref: data.picture.ref,
                url: images[0],
            },
            email: data.email,
        });
    }

    return profiles;
}

const getProfilesFromParam = async (key: string, value: string) => await getProfiles(query(collection(firestore, "comments"), where(key, "==", value)));
const getProfileFromId = async (id: string) => {
    const document = await getDoc(doc(firestore, "profiles", id));

    if (!document.exists()) return null;
    const data = document.data();
    const images = await getImagesURL([data.picture]);
    return <Profile>{
        id: document.id,
        username: data.username,
        picture: {
            ref: data.picture.ref,
            url: images[0],
        }
    };   
}

const createProfile = async (profile: Profile) => await setDoc(doc(collection(firestore, "profiles"), profile.id), profile);
const updateProfile = async (profile: Profile) => await setDoc(doc(collection(firestore, "profiles"), profile.id), profile);
const deleteProfile = async (profile: Profile) => {

    // First delete image from storage
    if (profile.picture) {
        try {
            await deleteFile(profile.picture?.ref);
        } catch (err) { }
    }

    await deleteDoc(doc(firestore, "profiles", profile.id || ''));
}


export {
    getProfiles,
    getProfilesFromParam,
    getProfileFromId,
    createProfile,
    updateProfile,
    deleteProfile,
}