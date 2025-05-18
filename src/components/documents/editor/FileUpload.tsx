
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  isLoading: boolean;
}

const FileUpload = ({ onFileContent, isLoading }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = async (file: File) => {
    try {
      setUploading(true);

      // Check file type
      const validTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should not exceed 10MB");
        return;
      }

      // Extract text from file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-document-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to extract text from file');
      }

      const data = await response.json();
      onFileContent(data.text, file.name);
      toast.success(`Successfully processed file: ${file.name}`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file. Please try again.");
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 text-center transition-all ${
        isDragging ? "border-primary bg-primary/10" : "border-border"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInput}
        disabled={uploading || isLoading}
      />
      
      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
      <p className="mb-2 text-muted-foreground">
        Drag and drop your document here or click to select
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Supports PDF, DOC, and DOCX (Max 10MB)
      </p>
      
      <label htmlFor="file-upload">
        <Button 
          variant="outline" 
          type="button"
          disabled={uploading || isLoading}
          className="cursor-pointer"
        >
          {uploading ? "Processing..." : "Select File"}
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;
