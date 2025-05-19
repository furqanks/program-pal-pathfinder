
import { useState } from "react";
import { toast } from "sonner";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentContentEditor from "./editor/DocumentContentEditor";
import FeedbackPreview from "./editor/FeedbackPreview";
import EditorActions from "./editor/EditorActions";
import { generateTestFeedback } from "@/services/document.service";
import { FileText } from "lucide-react";
import { QuotedImprovement } from "@/types/document.types";
import { Badge } from "@/components/ui/badge";

interface DocumentEditorProps {
  activeDocumentType: string;
  documentTypeLabels: Record<string, string>;
  selectedDocument: any;
  onSaveSuccess: (docId: string) => void;
}

const DocumentEditor = ({
  activeDocumentType,
  documentTypeLabels,
  selectedDocument,
  onSaveSuccess
}: DocumentEditorProps) => {
  const isMobile = useIsMobile();
  const { addDocument, generateFeedback } = useDocumentContext();
  
  const [documentContent, setDocumentContent] = useState("");
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [tempFeedback, setTempFeedback] = useState<{
    content: string;
    feedback?: string;
    improvementPoints?: string[];
    quotedImprovements?: QuotedImprovement[];
    score?: number;
  } | null>(null);
  
  // State for uploaded file
  const [fileName, setFileName] = useState<string | null>(null);
  
  // State to control visibility of feedback
  const [showFeedback, setShowFeedback] = useState(false);
  
  // State to control file uploading
  const [isUploading, setIsUploading] = useState(false);

  const handleFileContent = (content: string, uploadedFileName: string) => {
    setUploadedFileContent(content); // Store uploaded content separately
    setFileName(uploadedFileName);
    console.log("File content set (length):", content.length);
    console.log("File name set:", uploadedFileName);
    toast.success(`File "${uploadedFileName}" processed successfully`);
  };

  const handleCreateDocument = async () => {
    // Check if we have either editor content or uploaded file content
    const contentToSave = uploadedFileContent || documentContent;
    
    if (!contentToSave.trim()) {
      toast.error("Please enter document content or upload a file");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: contentToSave,
        fileName: fileName
      });
      
      if (savedDoc) {
        onSaveSuccess(savedDoc.id);
        toast.success("Document saved successfully");
      }
      
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate feedback without saving - using the correct content
  const handleGenerateTempFeedback = async () => {
    // Use uploaded file content if available, otherwise use editor content
    const contentToAnalyze = uploadedFileContent || documentContent;
    
    if (!contentToAnalyze.trim()) {
      toast.error("Please enter document content or upload a file");
      return;
    }
    
    setIsGeneratingFeedback(true);
    setShowFeedback(false); // Reset feedback visibility
    
    try {
      toast.info("Generating AI feedback...");
      console.log("Generating feedback for content (length):", contentToAnalyze.length);
      console.log("Using file:", fileName || "No file (direct input)");
      
      // Use the real API to generate feedback without saving to the database
      const feedback = await generateTestFeedback(
        contentToAnalyze, 
        activeDocumentType,
        selectedProgramId,
        fileName || undefined
      );
      
      setTempFeedback({
        content: contentToAnalyze,
        feedback: feedback.summary,
        improvementPoints: feedback.improvementPoints,
        quotedImprovements: feedback.quotedImprovements,
        score: feedback.score
      });
      
      setShowFeedback(true);
      toast.success("AI feedback generated");
    } catch (error) {
      console.error("Error generating temporary feedback:", error);
      toast.error("Failed to generate feedback");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const saveAndGenerateFeedback = async () => {
    // Use uploaded file content if available, otherwise use editor content
    const contentToSave = uploadedFileContent || documentContent;
    
    if (!contentToSave.trim()) {
      toast.error("Please enter document content or upload a file before generating feedback");
      return;
    }
    
    setIsSaving(true);
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: contentToSave,
        fileName: fileName
      });
      
      if (savedDoc) {
        onSaveSuccess(savedDoc.id);
        toast.success("Document saved successfully");
        setIsGeneratingFeedback(true);
        await generateFeedback(savedDoc.id);
      }
    } catch (error) {
      console.error("Error creating document and generating feedback:", error);
      toast.error("Failed to save document and generate feedback");
    } finally {
      setIsSaving(false);
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File upload indicator */}
      {fileName && (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Uploaded document:</span>
              <span>{fileName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This document has been processed and will be used for feedback generation.
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">Ready for review</Badge>
        </div>
      )}
      
      <DocumentContentEditor
        documentContent={documentContent}
        setDocumentContent={setDocumentContent}
        documentTypeLabel={documentTypeLabels[activeDocumentType]}
        isMobile={isMobile}
        onFileContent={handleFileContent}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />
      
      <FeedbackPreview 
        feedback={tempFeedback} 
        showFeedback={showFeedback} 
      />
      
      <EditorActions
        isMobile={isMobile}
        isSaving={isSaving}
        isGeneratingFeedback={isGeneratingFeedback}
        onSave={handleCreateDocument}
        onSaveAndGenerateFeedback={saveAndGenerateFeedback}
        onGenerateTempFeedback={handleGenerateTempFeedback}
      />
    </div>
  );
};

export default DocumentEditor;
