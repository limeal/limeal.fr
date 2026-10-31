import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from "firebase/firestore"
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, User } from "firebase/auth"

import { auth, firestore } from "../firebase"

// Recruiters ask for access with their e-mail. Firebase sends them a sign-in
// link, which proves the address; the request then records who they are and
// the channel (?ref= / utm_source) they came from. Each channel is set to grant
// access immediately or to wait for the admin (see docs/firestore.rules).

export type AccessStatus = "pending" | "approved" | "refused";

export interface AccessRequest {
    uid: string;
    email: string;
    name: string;
    company: string;
    ref: string;
    status: AccessStatus;
    createdAt: Date | null;
}

export type AccessEventType = "visit" | "chat";

export interface AccessEvent {
    id: string;
    type: AccessEventType;
    at: Date | null;
    text?: string;
}

export interface TrafficEvent {
    id: string;
    source: string;
    path: string;
    at: Date | null;
}

// What the visitor typed, kept until they come back from the e-mail link
const PENDING_KEY = "access-request";

type PendingRequest = { email: string; name: string; company: string; ref: string };

const requestDoc = (uid: string) => doc(firestore, "access_requests", uid);
const settingsDoc = doc(firestore, "settings", "access");

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null);

const toRequest = (uid: string, data: Record<string, any>): AccessRequest => ({
    uid,
    email: data.email,
    name: data.name ?? "",
    company: data.company ?? "",
    ref: data.ref ?? "",
    status: data.status,
    createdAt: toDate(data.createdAt),
});

// --- Visitor side ---

// Per channel: approved without waiting ("autoApprove"), or never offered access
// at all ("blocked", e.g. a community where people know the owner personally).
// Any other channel, and no channel, waits for the admin.
export interface AccessSettings {
    autoApprove: string[];
    blocked: string[];
}

export const getAccessSettings = async (): Promise<AccessSettings> => {
    const snapshot = await getDoc(settingsDoc).catch(() => null);
    const data = snapshot?.data();
    return { autoApprove: data?.autoApprove ?? [], blocked: data?.blocked ?? [] };
};

export const sendAccessLink = async (request: PendingRequest) => {
    const url = new URL(window.location.origin);
    if (request.ref) url.searchParams.set("ref", request.ref);
    url.hash = "portfolio";

    await sendSignInLinkToEmail(auth, request.email, { url: url.toString(), handleCodeInApp: true });
    try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(request));
    } catch {}
};

export const isAccessLink = (href: string) => isSignInWithEmailLink(auth, href);

// Back from the e-mail: signs in and files the request. `askEmail` covers a
// link opened on another device, where the typed details are not available.
export const completeAccessLink = async (href: string, askEmail: () => string | null) => {
    let pending: PendingRequest | null = null;
    try {
        pending = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null");
    } catch {}

    const email = pending?.email ?? askEmail();
    if (!email) return null;

    const { user } = await signInWithEmailLink(auth, email, href);
    try {
        localStorage.removeItem(PENDING_KEY);
    } catch {}

    const existing = await getMyRequest(user);
    if (existing) return existing;

    const ref = pending?.ref ?? "";
    const { autoApprove } = await getAccessSettings();
    const status: AccessStatus = ref && autoApprove.includes(ref) ? "approved" : "pending";

    await setDoc(requestDoc(user.uid), {
        email: user.email,
        name: pending?.name ?? "",
        company: pending?.company ?? "",
        ref,
        status,
        createdAt: serverTimestamp(),
    });

    // Lets the admin know by e-mail; the server re-reads the request itself
    user.getIdToken()
        .then((idToken) => fetch("/api/access-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) }))
        .catch(() => undefined);

    return getMyRequest(user);
};

export const getMyRequest = async (user: User): Promise<AccessRequest | null> => {
    const snapshot = await getDoc(requestDoc(user.uid)).catch(() => null);
    return snapshot?.exists() ? toRequest(user.uid, snapshot.data()) : null;
};

export const logAccessEvent = (uid: string, type: AccessEventType, text?: string) =>
    addDoc(collection(requestDoc(uid), "events"), {
        type,
        at: serverTimestamp(),
        ...(text ? { text: text.slice(0, 500) } : {}),
    }).catch(() => undefined);

// Where a visitor comes from: ?ref= / utm_source if present, otherwise the referring site
export const logTraffic = (source: string) =>
    addDoc(collection(firestore, "traffic"), {
        source: source.slice(0, 100),
        path: window.location.pathname.slice(0, 100),
        at: serverTimestamp(),
    }).catch(() => undefined);

// --- Admin only (rules) ---

export const getAccessRequests = async (): Promise<AccessRequest[]> => {
    const docs = await getDocs(query(collection(firestore, "access_requests"), orderBy("createdAt", "desc")));
    return docs.docs.map((d) => toRequest(d.id, d.data()));
};

export const setRequestStatus = (uid: string, status: AccessStatus) => updateDoc(requestDoc(uid), { status });

export const setAccessSettings = (settings: AccessSettings) => setDoc(settingsDoc, settings);

export const getAccessEvents = async (uid: string): Promise<AccessEvent[]> => {
    const docs = await getDocs(query(collection(requestDoc(uid), "events"), orderBy("at", "desc"), limit(200)));
    return docs.docs.map((d) => {
        const data = d.data();
        return { id: d.id, type: data.type, at: toDate(data.at), text: data.text };
    });
};

export const getTraffic = async (sinceDays = 30): Promise<TrafficEvent[]> => {
    const since = Timestamp.fromDate(new Date(Date.now() - sinceDays * 24 * 3600 * 1000));
    const docs = await getDocs(query(collection(firestore, "traffic"), where("at", ">=", since), orderBy("at", "desc"), limit(2000)));
    return docs.docs.map((d) => {
        const data = d.data();
        return { id: d.id, source: data.source, path: data.path, at: toDate(data.at) };
    });
};

// Random value for the private space path
export const randomToken = (length = 24) => {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};
