import Project from "@/interfaces/project";
import firebase from "./firebase";
import { getFirestore, getDocs, collection } from "firebase/firestore";

const db = getFirestore(firebase);

const getCollection = (collectionName: string) => getDocs(collection(db, collectionName))

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
            const date = new Date(project.created_at.seconds * 1000);
            project.created_at = monthNames[date.getMonth()] + " - " + date.getFullYear().toString();
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

export { getProjects };