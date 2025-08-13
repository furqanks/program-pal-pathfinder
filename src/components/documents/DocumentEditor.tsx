import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentContentEditor from "./editor/DocumentContentEditor";
import FeedbackPreview from "./editor/FeedbackPreview";
import EditorActions from "./editor/EditorActions";
import DocumentTemplates from "./templates/DocumentTemplates";
import { generateTestFeedback } from "@/services/document.service";
import { QuotedImprovement } from "@/types/document.types";

interface DocumentEditorProps {
  activeDocumentType: string;
  documentTypeLabels: Record<string, string>;
  selectedDocument: any;
  onSaveSuccess: (docId: string) => void;
  onReset?: () => void;
}

const DocumentEditor = ({
  activeDocumentType,
  documentTypeLabels,
  selectedDocument,
  onSaveSuccess
}: DocumentEditorProps) => {
  const isMobile = useIsMobile();
  const { addDocument, updateDocument, generateFeedback } = useDocumentContext();
  
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
    detailedScores?: {
      clarity?: number;
      authenticity?: number;
      structure?: number;
      impact?: number;
      grammar?: number;
      programFit?: number;
    };
    strengthsIdentified?: string[];
    industrySpecificAdvice?: string[];
  } | null>(null);
  
  // State for file upload related functionality
  const [isUploading, setIsUploading] = useState(false);
  
  // State to control visibility of feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Effect to handle document selection
  useEffect(() => {
    if (selectedDocument) {
      setDocumentContent(selectedDocument.contentRaw);
      setSelectedProgramId(selectedDocument.linkedProgramId);
      setIsEditMode(true);
      setEditingDocumentId(selectedDocument.id);
    } else {
      resetEditor();
    }
  }, [selectedDocument]);

  // Method to reset editor
  const resetEditor = () => {
    setDocumentContent("");
    setSelectedProgramId(null);
    setIsEditMode(false);
    setEditingDocumentId(null);
    setTempFeedback(null);
    setShowFeedback(false);
    setShowTemplates(false);
  };

  const handleTemplateSelect = (template: any) => {
    setDocumentContent(template.content);
    setShowTemplates(false);
    toast.success(`${template.name} template loaded`);
  };

  const handleFileContent = (content: string, uploadedFileName: string) => {
    setDocumentContent(content);
    toast.success(`Content loaded from ${uploadedFileName}`);
  };

  const handleCreateDocument = async () => {
    // Check if we have editor content
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isEditMode && editingDocumentId) {
        // Update existing document
        await updateDocument(editingDocumentId, {
          contentRaw: documentContent,
          linkedProgramId: selectedProgramId
        });
        onSaveSuccess(editingDocumentId);
        toast.success("Document updated successfully");
      } else {
        // Create new document
        console.log("Attempting to save document:", {
          documentType: activeDocumentType,
          contentLength: documentContent.length,
          programId: selectedProgramId
        });

        const savedDoc = await addDocument({
          documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
          linkedProgramId: selectedProgramId,
          contentRaw: documentContent,
          fileName: null
        });
        
        if (savedDoc) {
          console.log("Document saved successfully:", savedDoc.id);
          onSaveSuccess(savedDoc.id);
          resetEditor();
          toast.success("Document saved successfully");
        } else {
          throw new Error("No document returned from save operation");
        }
      }
      
    } catch (error) {
      console.error("Error saving document:", error);
      
      // Provide more specific error messages based on error type
      if (error && typeof error === 'object' && 'code' in error) {
        if ((error as any).code === '42501') {
          toast.error("Permission denied. Please make sure you're logged in and try again.");
        } else if ((error as any).code === '23503') {
          toast.error("Invalid program reference. Please check your program selection.");
        } else {
          toast.error(`Failed to save document: ${(error as any).message || 'Unknown error'}`);
        }
      } else {
        toast.error("Failed to save document. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Generate feedback without saving - using casual tone
  const handleGenerateTempFeedback = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsGeneratingFeedback(true);
    setShowFeedback(false);
    
    try {
      toast.info("Getting your feedback...");
      console.log("Generating casual feedback for content (length):", documentContent.length);
      
      // Use casual, conversational tone by default
      const feedback = await generateTestFeedback(
        documentContent, 
        activeDocumentType,
        selectedProgramId,
        "conversational", // Always use conversational tone
        "detailed"
      );
      
      setTempFeedback({
        content: documentContent,
        feedback: feedback.summary,
        improvementPoints: feedback.improvementPoints,
        quotedImprovements: feedback.quotedImprovements,
        score: feedback.score,
        detailedScores: (feedback as any).detailedScores,
        strengthsIdentified: (feedback as any).strengthsIdentified,
        industrySpecificAdvice: (feedback as any).industrySpecificAdvice
      });
      
      setShowFeedback(true);
      toast.success("Feedback ready!");
    } catch (error) {
      console.error("Error generating feedback:", error);
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
      console.log("Saving and generating feedback for document");
      
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: documentContent,
        fileName: null
      });
      
      if (savedDoc) {
        console.log("Document saved, generating feedback");
        onSaveSuccess(savedDoc.id);
        // Clear the content after successful save
        setDocumentContent("");
        toast.success("Document saved successfully");
        setIsGeneratingFeedback(true);
        await generateFeedback(savedDoc.id);
      }
    } catch (error) {
      console.error("Error creating document and generating feedback:", error);
      
      // Provide more specific error messages
      if (error && typeof error === 'object' && 'code' in error) {
        if ((error as any).code === '42501') {
          toast.error("Permission denied. Please make sure you're logged in and try again.");
        } else {
          toast.error("Failed to save document and generate feedback. Please try again.");
        }
      } else {
        toast.error("Failed to save document and generate feedback");
      }
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
        onUseTemplate={() => setShowTemplates(true)}
        isEditMode={isEditMode}
        onReset={resetEditor}
      />
      
      <DocumentTemplates
        documentType={activeDocumentType}
        onSelectTemplate={handleTemplateSelect}
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </div>
  );
};

export default DocumentEditor;
