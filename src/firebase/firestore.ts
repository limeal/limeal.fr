import Project from "@/interfaces/project";
import { firestore, storage } from "./firebase";
import { getDocs, collection, addDoc, QueryDocumentSnapshot, DocumentData, deleteDoc, doc } from "firebase/firestore";
import moment from "moment";
import { getDownloadURL, ref } from "firebase/storage";
import { deleteFile } from "./storage";

const getCollection = (collectionName: string) => getDocs(collection(firestore, collectionName))

const getProjects = async () => {
    try {
        const collection = await getCollection("projects");


        const projects = collection.docs.map(async (document: QueryDocumentSnapshot<DocumentData, DocumentData>) => {

            const data = document.data();

            const date = moment(data.release_date, 'YYYY-MM-DD');
            const rDate = date.format("MMMM") + " - " + date.format("YYYY");
            let thumbnailURL = "/assets/images/no-image.png";
            try {
                thumbnailURL = await getDownloadURL(ref(storage, data.thumbnail.ref));
            } catch (err) { }

            return <Project>{
                id: document.id,
                name: data.name,
                description: data.description,
                category: data.category,
                external_link: data.external_link,
                github: data.github,
                release_date: rDate,
                thumbnail: {
                    ref: data.thumbnail.ref,
                    url: thumbnailURL,
                }
            };
        })

        const copyProjects: Project[] = [];
        for (let i = 0; i < projects.length; i++) {
            copyProjects.push(await projects[i]);
        }

        return copyProjects;
    } catch (err) {
        throw err;
    }
}

const addProject = async (project: Project) => await addDoc(collection(firestore, "projects"), project);

const deleteProject = async (fileRef: string, id: string) => {

    // First delete image from storage
    await deleteFile(fileRef);

    await deleteDoc(doc(firestore, "projects", id));
}

export { getProjects, addProject, deleteProject };