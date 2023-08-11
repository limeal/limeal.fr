import { getDocs, collection, addDoc, QueryDocumentSnapshot, DocumentData, deleteDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import moment from "moment";

import { firestore, storage } from "./firebase";
import { deleteFile } from "./storage";

import Project from "@/interfaces/project";
import Article from "@/interfaces/article";

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

const getArticles = async () => {
    try {
        const collection = await getCollection("articles");


        const articles = collection.docs.map(async (document: QueryDocumentSnapshot<DocumentData, DocumentData>) => {

            const data = document.data();

            const date = moment(data.created_at, 'YYYY-MM-DD');
            const rDate = date.format("MMMM") + " - " + date.format("YYYY");

            let images : string[] = [];
            let defaultImage = "/assets/images/no-image.png";

            for (let i = 0; i < data.images.length; i++) {
                try {
                    const imageURL = await getDownloadURL(ref(storage, data.images[i].ref));
                    images.push(imageURL);
                } catch (err) {
                    images.push(defaultImage);
                }
            }

            return <Article>{
                id: document.id,
                title: data.title,
                slug: data.slug,
                lore: data.lore,
                images: images.map((image, index) => { return { ref: data.images[index].ref, url: image } }),
                content: data.content,
                place: data.place,
                created_at: rDate,
                published: data.published,
            };
        })

        const copyProjects: Article[] = [];
        for (let i = 0; i < articles.length; i++) {
            copyProjects.push(await articles[i]);
        }

        return copyProjects;
    } catch (err) {
        throw err;
    }
}

const getArticleBySlug = async (slug: string) => {
    const articles = await getArticles();

    return articles.find(article => article.slug === slug) || null;
}

const addProject = async (project: Project) => await addDoc(collection(firestore, "projects"), project);
const addArticle = async (article: Article) => await addDoc(collection(firestore, "articles"), article);

const deleteProject = async (project: Project) => {

    // First delete image from storage
    await deleteFile(project.thumbnail.ref);

    await deleteDoc(doc(firestore, "projects", project.id || ''));
}

const deleteArticle = async (article: Article) => {

    // First delete image from storage
    for (const image of article.images) {
        await deleteFile(image.ref);
    }

    await deleteDoc(doc(firestore, "articles", article.id || ''));
}


export {
    getProjects,
    getArticles,
    addProject,
    addArticle,
    deleteProject,
    deleteArticle,
    getArticleBySlug,
};