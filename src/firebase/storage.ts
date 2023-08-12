import { auth, storage } from "./firebase";
import { uploadBytes, ref, deleteObject, getDownloadURL, getBlob } from "firebase/storage";

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

const getImagesURL = async (images: {
    ref: string;
    url?: string;
}[]) => {
    let urls: string[] = [];
    let defaultImage = "/assets/images/no-image.png";

    for (let i = 0; i < images.length; i++) {
        try {
            const imageURL = await getDownloadURL(ref(storage, images[i].ref));
            urls.push(imageURL);
        } catch (err) {
            urls.push(defaultImage);
        }
    }

    return urls;
}

const getFileFromUrl = async (imageRef: string, name: string, defaultType = 'image/jpeg') => {
    const file = await getBlob(ref(storage, imageRef));
    return new File([file], name, { type: file.type || defaultType });
}

const deleteFile = async (fileRef: string) => {
    try {
        const reference = ref(storage, fileRef);
        await deleteObject(reference);
    } catch (err) {
        throw err;
    }
}

export { uploadFile, deleteFile, getImagesURL, getFileFromUrl };