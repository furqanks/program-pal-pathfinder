
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import FileUploadButton from "./FileUploadButton";

interface DocumentContentEditorProps {
  documentContent: string;
  setDocumentContent: (content: string) => void;
  documentTypeLabel: string;
  isMobile: boolean;
  onFileContent: (content: string, fileName: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

const DocumentContentEditor = ({ 
  documentContent, 
  setDocumentContent, 
  documentTypeLabel,
  isMobile,
  onFileContent,
  isUploading,
  setIsUploading
}: DocumentContentEditorProps) => {
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <Badge variant="outline" className={isMobile ? "text-xs" : ""}>
            {documentTypeLabel}
          </Badge>
        </div>
        <FileUploadButton 
          onFileContent={onFileContent}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </div>
      <Textarea
        value={documentContent}
        onChange={(e) => setDocumentContent(e.target.value)}
        placeholder={`Type or paste your ${documentTypeLabel.toLowerCase()} here...`}
        className={cn(
          "text-sm resize-none",
          isMobile ? "min-h-48 text-base p-4" : "min-h-80"
        )}
        disabled={isUploading}
      />
      {isUploading && (
        <div className="text-center text-muted-foreground text-sm">
          Extracting document content, please wait...
        </div>
      )}
    </div>
  );
};

export default DocumentContentEditor;
