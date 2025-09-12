
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import mammoth from "mammoth";
import { processPDF, ProcessingProgress } from "@/utils/pdfProcessor";

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

  // Handle processing progress updates
  const handleProgress = (progress: ProcessingProgress) => {
    setUploadProgress(progress.progress);
    toast.info(progress.message);
  };

  // Process DOCX files
  const processDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    setUploadProgress(40);
    toast.info("Extracting text from Word document...");
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    setUploadProgress(80);
    
    if (result.messages && result.messages.length > 0) {
      console.log("Mammoth warnings:", result.messages);
    }
    
    return result.value;
  };

  // Process TXT files
  const processTXT = async (file: File): Promise<string> => {
    setUploadProgress(40);
    toast.info("Reading text file...");
    
    const text = await file.text();
    setUploadProgress(80);
    
    return text;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type - now supporting TXT as well
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    const isValidFile = 
      fileType === "application/pdf" || 
      fileType === "application/msword" || 
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "text/plain" ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx');

    if (!isValidFile) {
      toast.error("Only PDF, Word documents (.doc, .docx), and text files (.txt) are supported");
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
      toast.info(`Processing ${file.name}...`);
      let extractedText = "";

      // Process based on file type
      if (fileType === "application/pdf" || fileName.endsWith('.pdf')) {
        const pdfResult = await processPDF(file, handleProgress);
        if (pdfResult.success && pdfResult.text) {
          extractedText = pdfResult.text;
        } else if (pdfResult.fallbackMessage) {
          // Show fallback message and let user decide
          extractedText = pdfResult.fallbackMessage;
        } else {
          throw new Error(pdfResult.error || "Failed to process PDF");
        }
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith('.docx')
      ) {
        extractedText = await processDOCX(file);
      } else if (
        fileType === "application/msword" ||
        fileName.endsWith('.doc')
      ) {
        toast.error("Legacy .doc files are not supported. Please convert to .docx format.");
        return;
      } else if (fileType === "text/plain" || fileName.endsWith('.txt')) {
        extractedText = await processTXT(file);
      }

      setUploadProgress(90);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text content could be extracted from the file");
      }

      // Log the extracted content for debugging
      console.log("Extracted document content length:", extractedText.length);
      console.log("Extracted content sample:", extractedText.substring(0, 100) + "...");
      
      // Pass extracted text back to parent component
      onFileContent(extractedText, file.name);
      setUploadProgress(100);
      toast.success(`File "${file.name}" processed successfully`);
      
    } catch (err) {
      console.error("File processing error:", err);
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
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload Document (PDF, DOCX, TXT)"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default FileUploadButton;
