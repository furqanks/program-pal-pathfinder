
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadButtonProps {
  onFileContent: (content: string, fileName: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

const FileUploadButton = ({ 
  onFileContent, 
  isUploading,
  setIsUploading 
}: FileUploadButtonProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    const fileType = file.type;
    if (
      fileType !== "application/pdf" && 
      fileType !== "application/msword" && 
      fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error("Only PDF and Word documents (.doc, .docx) are supported");
      return;
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File size exceeds the 10MB limit");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Create form data to send to the edge function
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(30);
      
      // Send file to edge function for text extraction
      const { data, error } = await supabase.functions.invoke('extract-document-text', {
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUploadProgress(90);
      
      if (error) {
        throw new Error(error.message || "Failed to extract text from document");
      }
      
      if (!data || !data.text) {
        throw new Error("No content extracted from document");
      }
      
      // Pass extracted text back to parent component
      onFileContent(data.text, file.name);
      setUploadProgress(100);
      
    } catch (err) {
      console.error("File upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to process document");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        id="document-upload"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <label htmlFor="document-upload">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer gap-2"
          disabled={isUploading}
          asChild
        >
          <span>
            <FileUp className="h-4 w-4" />
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload Document"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default FileUploadButton;
