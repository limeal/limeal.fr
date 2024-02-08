import { getDocs, collection, query, where, DocumentData, Query, addDoc, deleteDoc, doc } from "firebase/firestore"

import { firestore } from "../firebase"
import Project from "@/interfaces/project";
import { deleteFile, getImagesURL } from "../storage";

const getProjects = async (query?: Query<DocumentData, DocumentData>) => {
    const projects: Project[] = [];
    const docs = await getDocs(query ?? collection(firestore, "projects"));

    for (const document of docs.docs) {
        const data = document.data();

        const urls = await getImagesURL([data.thumbnail]);

        projects.push(<Project>{
            id: document.id,
            name: data.name,
            price: data.price,
            description: data.description,
            category: data.category,
            external_link: data.external_link,
            github: data.github,
            release_date: data.release_date,
            thumbnail: {
                ref: data.thumbnail.ref,
                url: urls[0],
            }
        })
    }

    return projects;
}

const getProjectsFromParam = async (key: string, value: string) => await getProjects(query(collection(firestore, "projects"), where(key, "==", value)));
const addProject = async (project: Project) => await addDoc(collection(firestore, "projects"), project);

const deleteProject = async (project: Project) => {

    // First delete image from storage
    try {
        await deleteFile(project.thumbnail.ref);
    } catch (err) { }

    await deleteDoc(doc(firestore, "projects", project.id || ''));
}

export {
    getProjects,
    getProjectsFromParam,
    addProject,
    deleteProject,
}