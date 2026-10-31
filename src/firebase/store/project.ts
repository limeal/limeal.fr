import { getDocs, collection, DocumentData, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, CollectionReference } from "firebase/firestore"

import { firestore } from "../firebase"
import Project from "@/interfaces/project";
import { deleteFile, getImagesURL } from "../storage";

// Confidential projects live under a path containing the recruiter code:
// without the code there is no way to address them (see docs/firestore.rules).
const projectsCollection = (vaultCode?: string) =>
    vaultCode
        ? collection(firestore, "vault", vaultCode, "confidential_projects")
        : collection(firestore, "projects");

const readProjects = async (ref: CollectionReference<DocumentData>, confidential: boolean) => {
    const projects: Project[] = [];
    const docs = await getDocs(ref);

    for (const document of docs.docs) {
        const data = document.data();

        const urls = await getImagesURL([data.thumbnail]);

        projects.push(<Project>{
            id: document.id,
            name: data.name,
            description: data.description,
            category: data.category,
            kind: data.kind ?? "personal",
            company: data.company,
            role: data.role,
            external_link: data.external_link,
            github: data.github,
            release_date: data.release_date,
            end_date: data.end_date,
            ongoing: data.ongoing,
            confidential,
            thumbnail: {
                ref: data.thumbnail.ref,
                url: urls[0],
            }
        })
    }

    return projects;
}

const getProjects = () => readProjects(projectsCollection(), false);

// Empty when the code is wrong: the path simply holds nothing
const getConfidentialProjects = (vaultCode: string) => readProjects(projectsCollection(vaultCode), true);

// Firestore rejects undefined values; `confidential` and the download URL are resolved on read
const toDocument = (project: Project) => {
    const { id, thumbnail, confidential, ...data } = project;
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    return { ...clean, thumbnail: { ref: thumbnail.ref } };
}

const addProject = async (project: Project, vaultCode?: string) =>
    await addDoc(projectsCollection(vaultCode), toDocument(project));

const updateProject = async (project: Project, vaultCode?: string) =>
    await updateDoc(doc(projectsCollection(vaultCode), project.id || ''), toDocument(project));

const deleteProject = async (project: Project, vaultCode?: string, keepImage = false) => {
    if (!keepImage) {
        try {
            await deleteFile(project.thumbnail.ref);
        } catch (err) { }
    }

    await deleteDoc(doc(projectsCollection(vaultCode), project.id || ''));
}

// Public: how many confidential projects exist, for the teaser card
const getConfidentialCount = async (): Promise<number> => {
    const snapshot = await getDoc(doc(firestore, "public_meta", "portfolio")).catch(() => null);
    return snapshot?.data()?.confidentialCount ?? 0;
}

const setConfidentialCount = (count: number) =>
    setDoc(doc(firestore, "public_meta", "portfolio"), { confidentialCount: count }, { merge: true });

// Admin only (rules): the current recruiter code
const getVaultCode = async (): Promise<string | null> => {
    const snapshot = await getDoc(doc(firestore, "admin", "recruiter")).catch(() => null);
    return snapshot?.data()?.code ?? null;
}

// Private notes the recruiter assistant answers from (availability, contract…)
const assistantNotesDoc = (vaultCode: string) => doc(firestore, "vault", vaultCode, "assistant", "profile");

const getAssistantNotes = async (vaultCode: string): Promise<string> => {
    const snapshot = await getDoc(assistantNotesDoc(vaultCode)).catch(() => null);
    return snapshot?.data()?.notes ?? "";
}

const setAssistantNotes = (vaultCode: string, notes: string) =>
    setDoc(assistantNotesDoc(vaultCode), { notes });

// Moves every confidential project and the assistant notes under the new code,
// which revokes the old one
const changeVaultCode = async (newCode: string, oldCode: string | null) => {
    if (oldCode) {
        const projects = await getConfidentialProjects(oldCode);
        for (const project of projects) {
            await setDoc(doc(projectsCollection(newCode), project.id || ''), toDocument(project));
            await deleteProject(project, oldCode, true);
        }

        const notes = await getAssistantNotes(oldCode);
        if (notes) {
            await setAssistantNotes(newCode, notes);
            await deleteDoc(assistantNotesDoc(oldCode));
        }
    }
    await setDoc(doc(firestore, "admin", "recruiter"), { code: newCode });
}

export {
    getProjects,
    getConfidentialProjects,
    addProject,
    updateProject,
    deleteProject,
    getConfidentialCount,
    setConfidentialCount,
    getVaultCode,
    changeVaultCode,
    getAssistantNotes,
    setAssistantNotes,
}
