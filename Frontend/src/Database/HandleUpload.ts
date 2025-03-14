// handleUpload.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";
import { imgDB, db } from "../Database/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const handleUpload = (file: File, user: User, setImg: (url: string) => void) => {
    if (!file || !user) return;

    const fileName = `Profile_${user.uid}`;
    const fileRef = ref(imgDB, `ProfileIcons/${fileName}`);

    uploadBytes(fileRef, file)
        .then((data) => {
            console.log("Upload success:", data);
            return getDownloadURL(data.ref);
        })
        .then(async (downloadURL) => {
            console.log("Download URL:", downloadURL);
            setImg(downloadURL);

            // Store the download URL in db under the user's document
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, { profileImageUrl: downloadURL }, { merge: true });
        })
        .catch((error) => {
            console.error("Upload failed:", error);
        });
};
