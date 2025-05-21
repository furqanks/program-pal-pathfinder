
import { useState } from "react";
import { toast } from "sonner";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentContentEditor from "./editor/DocumentContentEditor";
import FeedbackPreview from "./editor/FeedbackPreview";
import EditorActions from "./editor/EditorActions";
import { generateTestFeedback } from "@/services/document.service";
import { QuotedImprovement } from "@/types/document.types";

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
  
  // State for file upload related functionality removed
  const [isUploading, setIsUploading] = useState(false);
  
  // State to control visibility of feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // Simplified version that only passes along empty values
  const handleFileContent = (content: string, uploadedFileName: string) => {
    // This is kept as a placeholder to maintain the component interface
    console.log("File upload functionality temporarily removed");
  };

  const handleCreateDocument = async () => {
    // Check if we have editor content
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: documentContent,
        fileName: null
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

  // Generate feedback without saving - using only editor content
  const handleGenerateTempFeedback = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsGeneratingFeedback(true);
    setShowFeedback(false); // Reset feedback visibility
    
    try {
      toast.info("Generating AI feedback...");
      console.log("Generating feedback for content (length):", documentContent.length);
      
      // Use the real API to generate feedback without saving to the database
      const feedback = await generateTestFeedback(
        documentContent, 
        activeDocumentType,
        selectedProgramId
      );
      
      setTempFeedback({
        content: documentContent,
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
    if (!documentContent.trim()) {
      toast.error("Please enter document content before generating feedback");
      return;
    }
    
    setIsSaving(true);
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: documentContent,
        fileName: null
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

  // Handle receiving a generated draft
  const handleDraftGenerated = (draft: string) => {
    setDocumentContent(draft);
  };

  return (
    <div className="space-y-6">
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
        documentType={activeDocumentType}
        onDraftGenerated={handleDraftGenerated}
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
