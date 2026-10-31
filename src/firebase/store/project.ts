import { getDocs, collection, DocumentData, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, CollectionReference, deleteField } from "firebase/firestore"

import { firestore } from "../firebase"
import Project, { ProjectDetails } from "@/interfaces/project";
import AssistantProfile, { toAssistantProfile } from "@/interfaces/assistantProfile";
import { deleteFile, getImagesURL } from "../storage";

// Public projects live in `projects`. What identifies a pro project lives under
// `vault/{code}/…`: without the code there is no way to address it (see docs/firestore.rules).
const projectsCollection = () => collection(firestore, "projects");
const vaultCollection = (vaultCode: string, name: string) => collection(firestore, "vault", vaultCode, name);
const detailsDoc = (vaultCode: string, projectId: string) => doc(vaultCollection(vaultCode, "project_details"), projectId);
// Marks a code as valid even before any project is stored under it
const markerDoc = (vaultCode: string) => doc(firestore, "vault", vaultCode, "meta", "info");

const imageURL = async (ref?: string) => (ref ? (await getImagesURL([{ ref }]))[0] : undefined);

const toProject = async (id: string, data: DocumentData): Promise<Project> => ({
    id,
    name: data.name,
    description: data.description,
    category: data.category,
    kind: data.kind ?? "personal",
    role: data.role,
    stack: data.stack ?? [],
    external_link: data.external_link,
    github: data.github,
    release_date: data.release_date,
    end_date: data.end_date,
    ongoing: data.ongoing,
    thumbnail: {
        ref: data.thumbnail?.ref ?? "",
        url: await imageURL(data.thumbnail?.ref) ?? "/assets/images/no-image.png",
    },
});

const readDocs = async (ref: CollectionReference<DocumentData>) => (await getDocs(ref)).docs;

// Public projects, completed with their private details when a vault code is given
const getProjects = async (vaultCode?: string | null) => {
    const publicDocs = await readDocs(projectsCollection());
    const projects = await Promise.all(publicDocs.map((d) => toProject(d.id, d.data())));

    if (!vaultCode) return projects;

    const [detailDocs, legacyDocs] = await Promise.all([
        readDocs(vaultCollection(vaultCode, "project_details")),
        readDocs(vaultCollection(vaultCode, "confidential_projects")),
    ]);

    const details = new Map<string, ProjectDetails>();
    for (const d of detailDocs) {
        const data = d.data();
        details.set(d.id, {
            company: data.company,
            name: data.name,
            external_link: data.external_link,
            github: data.github,
            thumbnail: data.thumbnail?.ref
                ? { ref: data.thumbnail.ref, url: await imageURL(data.thumbnail.ref) }
                : undefined,
        });
    }

    // Previous model: the whole project was stored in the vault. Shown with
    // its details until the admin saves it again in the new format.
    const legacy = await Promise.all(
        legacyDocs.map(async (d) => {
            const data = d.data();
            const project = await toProject(d.id, data);
            return {
                ...project,
                name: data.role || "Professional project",
                external_link: "",
                github: "",
                legacyVault: true,
                details: {
                    company: data.company,
                    name: data.name,
                    external_link: data.external_link,
                    github: data.github,
                    thumbnail: project.thumbnail.ref ? project.thumbnail : undefined,
                },
            } as Project;
        })
    );

    return [...projects.map((p) => ({ ...p, details: p.id ? details.get(p.id) : undefined })), ...legacy];
}

// Firestore rejects undefined values; read-only fields are resolved on read
const toDocument = (project: Project) => {
    const { id, thumbnail, details, legacyVault, ...data } = project;
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    return { ...clean, thumbnail: { ref: thumbnail.ref } };
}

const toDetailsDocument = (details: ProjectDetails) => ({
    company: details.company ?? "",
    name: details.name ?? "",
    external_link: details.external_link ?? "",
    github: details.github ?? "",
    thumbnail: { ref: details.thumbnail?.ref ?? "" },
});

const hasDetails = (details?: ProjectDetails) =>
    !!details && Object.values(toDetailsDocument(details)).some((v) => (typeof v === "string" ? v : v.ref));

// Saves the public card and, for pro projects, its private details.
// Returns the project id.
const saveProject = async (project: Project, details: ProjectDetails | null, vaultCode: string | null) => {
    let id = project.id;

    if (id && !project.legacyVault) {
        // `company` used to be stored publicly: make sure it is gone
        await updateDoc(doc(projectsCollection(), id), { ...toDocument(project), company: deleteField() });
    } else {
        id = (await addDoc(projectsCollection(), toDocument(project))).id;
        // A legacy vault project now has a public card: remove the old copy
        if (project.legacyVault && project.id && vaultCode) {
            await deleteDoc(doc(vaultCollection(vaultCode, "confidential_projects"), project.id));
        }
    }

    if (vaultCode) {
        if (details && hasDetails(details)) await setDoc(detailsDoc(vaultCode, id), toDetailsDocument(details));
        else await deleteDoc(detailsDoc(vaultCode, id)).catch(() => undefined);
    }

    return id;
}

const deleteProject = async (project: Project, vaultCode: string | null) => {
    for (const ref of [project.thumbnail.ref, project.details?.thumbnail?.ref]) {
        if (ref) await deleteFile(ref).catch(() => undefined);
    }

    if (project.legacyVault && vaultCode) {
        await deleteDoc(doc(vaultCollection(vaultCode, "confidential_projects"), project.id || ''));
        return;
    }

    await deleteDoc(doc(projectsCollection(), project.id || ''));
    if (vaultCode && project.id) await deleteDoc(detailsDoc(vaultCode, project.id)).catch(() => undefined);
}

// Admin only (rules): the current vault code
const getVaultCode = async (): Promise<string | null> => {
    const snapshot = await getDoc(doc(firestore, "admin", "recruiter")).catch(() => null);
    return snapshot?.data()?.code ?? null;
}

// Admin: older vaults predate the marker
const ensureVaultMarker = (vaultCode: string) => setDoc(markerDoc(vaultCode), { createdAt: Date.now() }, { merge: true });

// Private notes the recruiter assistant answers from (availability, contract…)
const assistantNotesDoc = (vaultCode: string) => doc(firestore, "vault", vaultCode, "assistant", "profile");

const getAssistantNotes = async (vaultCode: string): Promise<AssistantProfile> => {
    const snapshot = await getDoc(assistantNotesDoc(vaultCode)).catch(() => null);
    return toAssistantProfile(snapshot?.data());
}

const setAssistantNotes = (vaultCode: string, profile: AssistantProfile) =>
    setDoc(assistantNotesDoc(vaultCode), toAssistantProfile(profile as unknown as Record<string, unknown>));

// Copies the whole vault under a new code and deletes the old one. The access
// links are re-pointed by the caller (see access.ts).
const changeVaultCode = async (newCode: string, oldCode: string | null) => {
    await ensureVaultMarker(newCode);

    if (oldCode) {
        for (const name of ["project_details", "confidential_projects", "assistant"]) {
            for (const d of await readDocs(vaultCollection(oldCode, name))) {
                await setDoc(doc(vaultCollection(newCode, name), d.id), d.data());
                await deleteDoc(d.ref);
            }
        }
        await deleteDoc(markerDoc(oldCode)).catch(() => undefined);
    }

    await setDoc(doc(firestore, "admin", "recruiter"), { code: newCode });
}

export {
    getProjects,
    saveProject,
    deleteProject,
    getVaultCode,
    ensureVaultMarker,
    changeVaultCode,
    getAssistantNotes,
    setAssistantNotes,
}
