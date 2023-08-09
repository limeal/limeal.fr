import Project from "@/interfaces/project";
import { firestore } from "./firebase";
import { getDocs, collection, addDoc } from "firebase/firestore";
import moment from "moment";

const getCollection = (collectionName: string) => getDocs(collection(firestore, collectionName))

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getProjects = async (category: string) => {
    try {
        const collection = await getCollection("projects");
        const categories: string[] = [];
        let projects: Project[] = [];
        
        collection.forEach(project => projects.push(project.data() as Project));

        projects.forEach(project => {
            const date = moment(project.created_at, 'YYYY-MM-DD')
            project.created_at = date.format("MMMM") + " - " + date.format("YYYY")
            categories.push(project.category);
        });

        if (category !== "all") {
            projects = projects.filter((doc: Project) => doc.category === category)
        }

        return { categories, projects };
    } catch (err) {
        throw err;
    }
}

const addProject = async (project: Project) => await addDoc(collection(firestore, "projects"), project);

export { getProjects, addProject };