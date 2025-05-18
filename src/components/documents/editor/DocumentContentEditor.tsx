
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "./FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload } from "lucide-react";

interface DocumentContentEditorProps {
  documentContent: string;
  setDocumentContent: (content: string) => void;
  documentTypeLabel: string;
  isMobile: boolean;
}

const DocumentContentEditor = ({
  documentContent,
  setDocumentContent,
  documentTypeLabel,
  isMobile
}: DocumentContentEditorProps) => {
  const [activeTab, setActiveTab] = useState("write");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileContent = (content: string, fileName: string) => {
    setDocumentContent(content);
    setActiveTab("write"); // Switch back to edit tab after upload
  };

  return (
    <div className="space-y-2">
      <Tabs 
        defaultValue="write" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-2">
          <TabsTrigger value="write" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="mt-0">
          <Textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            placeholder={`Enter your ${documentTypeLabel} content here...`}
            className={`min-h-[300px] ${isMobile ? "" : "min-h-[500px]"} resize-none font-mono`}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <FileUpload 
            onFileContent={handleFileContent}
            isLoading={isUploading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentContentEditor;
