import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, X } from "lucide-react";

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const uploadFile = async () => {
    if (files.length === 0) {
      setMessage("No file selected");
      return;
    }
    
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await fetch("http://localhost:5000/detect-anomalies", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      if (response.ok) {
        setMessage("File uploaded successfully! Processing...");
        console.log("Upload result:", result);
        setMessage("Anomalies detected: " + result.anomalies_detected);
      } else {
        setMessage("Upload failed: " + result.message);
      }
    } catch (error) {
      setMessage("Error uploading file");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Card className="w-full max-w-lg p-4 border border-dashed border-gray-300 rounded-lg">
      <CardContent className="flex flex-col items-center gap-4">
        <div
          {...getRootProps()}
          className="w-full p-6 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 transition"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-gray-600">Drop the files here...</p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-10 h-10 text-gray-500" />
              <p className="text-gray-600">Drag & drop your dataset here, or click to select</p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="w-full mt-4">
            <h4 className="text-sm font-semibold mb-2">Selected File</h4>
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
              <span className="text-sm truncate max-w-[80%]">{files[0].name}</span>
              <Button variant="ghost" size="icon" onClick={() => removeFile(files[0].name)}>
                <X className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        )}

        <Button onClick={uploadFile} disabled={uploading} className="w-full">
          {uploading ? "Uploading..." : "Upload File"}
        </Button>

        {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
      </CardContent>
    </Card>
  );
}