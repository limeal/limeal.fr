import firebase from "./firebase";
import { getFirestore, doc, getDocs, collection, onSnapshot } from "firebase/firestore";

const db = getFirestore(firebase);

const getCollection = (collectionName: string, callback: any) => onSnapshot(collection(db, collectionName), callback);


const updateProjects = (category: string, setProjects: any) => getCollection("projects", (querySnapshot: any) => {
    const projects: any[] = [];
    querySnapshot.forEach((doc: any) => {
        projects.push({ ...doc.data(), id: doc.id });
    });
    setProjects(projects);
});

export { updateProjects };