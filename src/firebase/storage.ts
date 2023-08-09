import { auth, storage } from "./firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

const uploadFile = async (file: File, path: string) => {

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const reference = ref(storage, path);

        await uploadBytes(reference, buffer, {
            contentType: file.type,
        })

        // TODO: Change this to path, the download url must be in the getDocs
        return await getDownloadURL(reference);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export { uploadFile };