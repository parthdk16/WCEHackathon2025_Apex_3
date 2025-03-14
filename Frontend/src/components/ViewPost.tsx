import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Database/FirebaseConfig';

interface AdditionalField {
  title: string;
  detail: string;
}

interface RichTextNode {
  children: { text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }[];
}

interface JobCardProps {
  title: string;
  department: string;
  role: string;
  whatYouWillDo: RichTextNode[];
  benefits: string;
  additionalFields: AdditionalField[];
  createdBy: string;
  createdOn: string;
}

function ViewPost() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<JobCardProps | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        const docRef = doc(db, 'Posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as JobCardProps);
        } else {
          console.log('No such document!');
        }
      };

      fetchDocument();
    }
  }, [id]);

  const renderFormattedText = (node: RichTextNode) => {
    return node.children.map((child, index) => {
      const textClasses = [
        child.bold ? 'font-bold' : '',
        child.italic ? 'italic' : '',
        child.underline ? 'underline' : '',
        child.strikethrough ? 'line-through' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <span key={index} className={textClasses}>
          {child.code ? <code className="bg-gray-100 text-red-600 p-0.5 rounded">{child.text}</code> : child.text}
        </span>
      );
    });
  };

  if (!data) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className={`p-4 border border-gray-300 rounded-lg`}>
      <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
      <p className="text-lg"><strong>Department:</strong> {data.department}</p>
      <p className="text-lg"><strong>Role:</strong> {data.role}</p>
      <div className="my-4">
        <h2 className="text-xl font-semibold mb-2">What You Will Do</h2>
        {data.whatYouWillDo.map((node, index) => (
          <p key={index} className="mb-2">{renderFormattedText(node)}</p>
        ))}
      </div>
      <p className="text-lg"><strong>Benefits:</strong> {data.benefits}</p>
      <div className="my-4">
        <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
        {data.additionalFields.map((field, index) => (
          <div key={index}>
            <p className="text-lg"><strong>{field.title}:</strong> {field.detail}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500"><strong>Created By:</strong> {data.createdBy}</p>
      <p className="text-sm text-gray-500"><strong>Created On:</strong> {new Date(data.createdOn).toLocaleDateString()}</p>
    </div>
  );
}

export default ViewPost;
