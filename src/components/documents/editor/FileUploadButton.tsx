
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
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(30);
      
      // Use direct fetch instead of supabase.functions.invoke for proper FormData handling
      const response = await fetch(`https://ljoxowcnyiqsbmzkkudn.supabase.co/functions/v1/extract-document-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb3hvd2NueWlxc2JtemtrdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODIwMzEsImV4cCI6MjA2MzA1ODAzMX0.Ogn9ZXzTrEwKns_EQXrH1g04GXbnSPAUDN4-0hEHcHw'
        },
        body: formData,
      });
      
      setUploadProgress(90);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to extract text from document");
      }
      
      const data = await response.json();
      
      if (!data || !data.text) {
        throw new Error("No content extracted from document");
      }
      
      // Log the extracted content for debugging
      console.log("Extracted document content length:", data.text.length);
      console.log("Extracted content sample:", data.text.substring(0, 100) + "...");
      
      // Pass extracted text back to parent component WITHOUT MODIFICATION
      onFileContent(data.text, file.name);
      setUploadProgress(100);
      toast.success(`File "${file.name}" processed successfully`);
      
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
