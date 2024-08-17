import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const signIn = async (email: string, password: string) => await signInWithEmailAndPassword(auth, email, password);

const signOut = async () => await auth.signOut();

export { signIn, signOut };