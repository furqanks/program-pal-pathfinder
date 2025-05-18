
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <div>
      <Label htmlFor="document-content">
        {documentTypeLabel} Content
      </Label>
      <Textarea
        id="document-content"
        value={documentContent}
        onChange={(e) => setDocumentContent(e.target.value)}
        placeholder={`Enter your ${documentTypeLabel} content here...`}
        className="mt-1"
        style={{ 
          height: isMobile ? '280px' : 'calc(100vh - 25rem)',
          minHeight: '150px'
        }}
      />
    </div>
  );
};

export default DocumentContentEditor;
