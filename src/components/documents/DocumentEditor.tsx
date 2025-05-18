
import { useState } from "react";
import { toast } from "sonner";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentContentEditor from "./editor/DocumentContentEditor";
import FeedbackPreview from "./editor/FeedbackPreview";
import EditorActions from "./editor/EditorActions";

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
  const { programs } = useProgramContext();
  
  const [documentContent, setDocumentContent] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [tempFeedback, setTempFeedback] = useState<{
    content: string;
    feedback?: string;
    improvementPoints?: string[];
    score?: number;
  } | null>(null);
  
  // State to control visibility of feedback
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCreateDocument = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: documentContent
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

  // Generate feedback without saving
  const handleGenerateTempFeedback = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsGeneratingFeedback(true);
    setShowFeedback(false); // Reset feedback visibility
    
    try {
      // Simulate feedback generation without saving
      setTimeout(() => {
        const mockFeedback = {
          content: documentContent,
          feedback: "This is sample feedback for testing purposes. In a production environment, this would be AI-generated feedback based on your document content.",
          improvementPoints: [
            "Consider adding more specific examples about your experience.",
            "The introduction could be stronger to grab attention.",
            "Make sure to align your skills with the program requirements.",
            "Proofread for grammatical errors and clarity.",
            "Add more details about your long-term goals."
          ],
          score: 7
        };
        
        setTempFeedback(mockFeedback);
        setShowFeedback(true); // Show feedback after generation
        toast.success("Test feedback generated");
        setIsGeneratingFeedback(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error generating temporary feedback:", error);
      toast.error("Failed to generate test feedback");
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
        contentRaw: documentContent
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
    <div className="space-y-4">
      <DocumentContentEditor
        documentContent={documentContent}
        setDocumentContent={setDocumentContent}
        documentTypeLabel={documentTypeLabels[activeDocumentType]}
        isMobile={isMobile}
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
