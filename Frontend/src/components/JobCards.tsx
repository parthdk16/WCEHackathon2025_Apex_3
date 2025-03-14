import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ArrowUpRight, CalendarDays, Trash2, User } from "lucide-react";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { db } from "../Database/FirebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";

interface RichTextNode {
  children: { text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }[];
}

interface AdditionalField {
  title: string;
  detail: string;
}

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  role: string;
  whatYouWillDo: string;
  benefits: string;
  createdBy: string;
  createdOn: string;
  width?: string;
  height?: string;
  onDelete: (postId: string) => void;
}

export function JobCard({
  id,
  title,
  department,
  role,
  whatYouWillDo,
  benefits,
  additionalFields,
  createdBy,
  createdOn,
  width = "300px",
  height = "180px",
  onDelete
}: JobCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchPublishStatus = async () => {
      const jobRef = doc(db, "Posts", id);
      try {
        const docSnap = await getDoc(jobRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPublished(data.publish ?? false);
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchPublishStatus();
  }, [id]);

  const handleSwitchToggle = async () => {
    const newPublishState = !isPublished;
    setIsPublished(newPublishState);

    const jobRef = doc(db, "Posts", id);

    try {
      await updateDoc(jobRef, {
        publish: newPublishState,
        createdOn: new Date()
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const renderWhatYouWillDo = () => {
    return whatYouWillDo.map((node, nodeIndex) => (
      <span key={nodeIndex}>
        {node.children.map((textObj, textIndex) => {
          let formattedText = textObj.text;

          if (textObj.bold) {
            formattedText = <strong key={`bold-${textIndex}`}>{formattedText}</strong>;
          }
          if (textObj.italic) {
            formattedText = <em key={`italic-${textIndex}`}>{formattedText}</em>;
          }
          if (textObj.underline) {
            formattedText = <u key={`underline-${textIndex}`}>{formattedText}</u>;
          }
          if (textObj.strikethrough) {
            formattedText = <s key={`strikethrough-${textIndex}`}>{formattedText}</s>;
          }
          if (textObj.code) {
            formattedText = <code key={`code-${textIndex}`}>{formattedText}</code>;
          }

          return <span key={textIndex}>{formattedText}</span>;
        })}
        {nodeIndex < whatYouWillDo.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
        <Card 
          style={{ width, height }} 
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <CardHeader>
            <CardTitle className="text-center tracking-tight text-lg font-medium">
              {title}
            </CardTitle>
          </CardHeader>

          <CardFooter className="flex flex-col items-start p-2">
            <div className="text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{createdBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>{createdOn}</span>
              </div>
            </div>
          </CardFooter>

          <div className="flex items-center justify-between p-2">
            <Trash2 className="text-gray-500 hover:text-red-600 cursor-pointer" onClick={(e) =>{
              e.stopPropagation();
              onDelete(id);
            }} />
            <Button variant="ghost" className="flex items-center gap-1" onClick={(e) => {
              e.stopPropagation();
              window.open(`/view/${id}`, '_blank');
            }}>
              View <ArrowUpRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Switch id="publish" checked={isPublished} onCheckedChange={handleSwitchToggle} onClick={(e) => e.stopPropagation()} />
              <Label htmlFor="publish">Publish</Label>
            </div>
          </div>
        </Card>
        </DialogTrigger>

        <DialogContent className="p-6 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-4">{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mb-4">
            <p><b>Department:</b> {department}</p>
            <p><b>Role:</b> {role}</p>
            <p><b>What You Will Do:</b> {renderWhatYouWillDo()}</p>
            <p><b>Benefits:</b> {benefits}</p>
            {additionalFields.map((field, index) => (
              <p key={index}>
                <b>{field.title}:</b> {field.detail}
              </p>
            ))}
          </div>
          <DialogClose asChild>
            <Button className="mt-4 py-2 px-4 rounded">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}