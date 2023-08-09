import Project from "@/interfaces/project";
import { firestore, storage } from "./firebase";
import { getDocs, collection, addDoc } from "firebase/firestore";
import moment from "moment";
import { getDownloadURL, ref } from "firebase/storage";

const getCollection = (collectionName: string) => getDocs(collection(firestore, collectionName))

const getProjects = async (selectedCategory: string) => {
    try {
        const collection = await getCollection("projects");
        const categories: string[] = [];
        let projects: Project[] = [];

        collection.forEach(async (project) => {

            const {
                name,
                category,
                description,
                release_date,
                thumbnail,
                external_link,
                github
            } = project.data() as Project;
            categories.push(category);

            const date = moment(release_date, 'YYYY-MM-DD')
            let thumbnailURL = "/assets/images/no-image.png";
            try {
                thumbnailURL = await getDownloadURL(ref(storage, thumbnail));
            } catch (err) { }

            projects.push({
                name,
                category,
                description,
                release_date: date.format("MMMM") + " - " + date.format("YYYY"),
                thumbnail: thumbnailURL,
                external_link,
                github
            })
        });

        if (selectedCategory !== "all") {
            projects = projects.filter((doc: Project) => doc.category === selectedCategory)
        }

        return { categories, projects };
    } catch (err) {
        throw err;
    }
}

const addProject = async (project: Project) => await addDoc(collection(firestore, "projects"), project);

export { getProjects, addProject };