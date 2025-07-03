
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, FileImage, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  isLoading: boolean;
}

const FileUpload = ({ onFileContent, isLoading }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');

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

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    return <FileText className="h-6 w-6 text-muted-foreground" />;
  };

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      setProcessingStatus('uploading');
      setUploadProgress(0);

      // Check file type
      const validTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        setProcessingStatus('error');
        toast.error("Please upload a PDF or Word document");
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setProcessingStatus('error');
        toast.error("File size should not exceed 10MB");
        return;
      }

      // Simulate upload progress
      setUploadProgress(25);
      
      // Extract text from file
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(50);
      setProcessingStatus('processing');

      const response = await fetch('/api/extract-document-text', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(75);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to extract text from file');
      }

      const data = await response.json();
      setUploadProgress(100);
      setProcessingStatus('success');
      
      onFileContent(data.text, file.name);
      toast.success(`Successfully processed file: ${file.name}`);
      
      // Reset after success
      setTimeout(() => {
        setProcessingStatus('idle');
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessingStatus('error');
      toast.error("Failed to process file. Please try again.");
      
      // Reset after error
      setTimeout(() => {
        setProcessingStatus('idle');
        setUploadProgress(0);
      }, 3000);
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

  // Render processing status indicator
  const renderStatusIndicator = () => {
    switch (processingStatus) {
      case 'uploading':
        return (
          <div className="animate-fade-in">
            <Loader className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
            <p className="text-sm font-medium text-primary">Uploading...</p>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        );
      case 'processing':
        return (
          <div className="animate-fade-in">
            <Loader className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
            <p className="text-sm font-medium text-primary">Extracting text...</p>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="animate-scale-in">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm font-medium text-green-600">Upload successful!</p>
          </div>
        );
      case 'error':
        return (
          <div className="animate-scale-in">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
            <p className="text-sm font-medium text-destructive">Upload failed</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 relative overflow-hidden",
        isDragging && "border-primary bg-primary/10 scale-105 shadow-lg animate-pulse",
        processingStatus === 'success' && "border-green-500 bg-green-50",
        processingStatus === 'error' && "border-destructive bg-destructive/10",
        !isDragging && processingStatus === 'idle' && "border-border hover:border-primary/50 hover:bg-accent/30"
      )}
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
      
      {processingStatus !== 'idle' ? (
        renderStatusIndicator()
      ) : (
        <div className={cn("transition-all duration-200", isDragging && "scale-110")}>
          {isDragging ? (
            <div className="animate-bounce">
              <Upload className="h-12 w-12 mx-auto text-primary mb-3" />
              <p className="text-lg font-semibold text-primary mb-2">
                Drop your file here!
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center gap-2 mb-4">
                <FileText className="h-8 w-8 text-red-500" />
                <span className="text-muted-foreground">PDF</span>
                <span className="text-muted-foreground">•</span>
                <FileText className="h-8 w-8 text-blue-500" />
                <span className="text-muted-foreground">DOCX</span>
              </div>
              
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3 hover-scale" />
              <p className="mb-2 text-muted-foreground font-medium">
                Drag and drop your document here
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                Supports PDF, DOC, and DOCX files (Max 10MB)
              </p>
            </>
          )}
          
          {!isDragging && (
            <label htmlFor="file-upload">
              <Button 
                variant="outline" 
                type="button"
                disabled={uploading || isLoading}
                className="cursor-pointer hover-scale transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
