import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Database/FirebaseConfig";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { handleUpload } from "../Database/HandleUpload";
import { CloudUpload } from "lucide-react";

export default function StoreImageText() {
    const [img, setImg] = useState<string>(""); // State to store image URL
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const [isUploadComplete, setIsUploadComplete] = useState(false);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                const userDetails: User = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                };
                setUser(userDetails);

                // Retrieve the user's profile image from db
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data && data.profileImageUrl) {
                        setImg(data.profileImageUrl); // Set the retrieved image
                        setIsUploadComplete(true);
                    }
                }
            } else {
                setUser(null);
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            handleUpload(file, user, setImg); // Use the handleUpload function
        }
    };

    const handleFileInputClick = () => {
        document.getElementById("fileInput")?.click();
    };

    return (
        <div>
            {/* Hidden file input */}
            <Input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileSelect} />

            {/* Button to trigger file input */}
            <Button className="h-10" onClick={handleFileInputClick}>
                Change Image <CloudUpload className="pl-2" />
            </Button>

            {/* {isUploadComplete && img && (
                <div>
                    <p>Image upload successful!</p>
                </div>
            )} */}
        </div>
    );
}