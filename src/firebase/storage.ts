import { auth, storage } from "./firebase";
import { uploadBytes, ref } from "firebase/storage";

const uploadFile = async (file: File, path: string) => {

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const reference = ref(storage, path);

        await uploadBytes(reference, buffer, {
            contentType: file.type,
        })

    } catch (err) {
        console.log(err);
        throw err;
    }
}

export { uploadFile };