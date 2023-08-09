import { auth, storage } from "./firebase";
import { uploadBytes, ref, deleteObject } from "firebase/storage";

const uploadFile = async (file: File, path: string) => {

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const reference = ref(storage, path);

        await uploadBytes(reference, buffer, {
            contentType: file.type,
        })

    } catch (err) {
        throw err;
    }
}

const deleteFile = async (fileRef: string) => {
    try {
        const reference = ref(storage, fileRef);
        await deleteObject(reference);
    } catch (err) {
        throw err;
    }
}

export { uploadFile, deleteFile };