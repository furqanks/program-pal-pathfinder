
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Setup PDF.js worker with version-matched CDN fallbacks
const setupPDFWorker = async () => {
  const workerUrls = [
    // Try matching version 5.3.31 first
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js',
    'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js',
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.js',
    // Fallback to known working version 3.11.174 if 5.3.31 doesn't exist
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
  ];

  for (const workerUrl of workerUrls) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      console.log(`PDF.js worker set to: ${workerUrl}`);
      return true;
    } catch (error) {
      console.warn(`Failed to set worker from ${workerUrl}:`, error);
    }
  }
  
  throw new Error('All PDF.js worker CDN sources failed');
};

// Initialize worker setup
setupPDFWorker().catch(error => {
  console.error('PDF.js worker setup failed:', error);
});

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

  // Process PDF files
  const processPDF = async (file: File): Promise<string> => {
    try {
      toast.info("Setting up PDF processor...");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setUploadProgress(20 + (pageNum / numPages) * 60); // 20-80% for PDF processing
        toast.info(`Processing page ${pageNum} of ${numPages}...`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += pageText + "\n\n";
      }

      return fullText.trim();
    } catch (error: any) {
      console.error("PDF processing error:", error);
      if (error.message && error.message.includes('worker')) {
        throw new Error('PDF processor setup failed. Please try again.');
      }
      throw new Error(`Failed to process PDF: ${error.message || 'Unknown error'}`);
    }
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
        extractedText = await processPDF(file);
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
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload Document"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default FileUploadButton;
