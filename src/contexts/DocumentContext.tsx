
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { Document, DocumentContextType } from "@/types/document.types";
import { 
  fetchUserDocuments, 
  addDocument as addDocumentService, 
  generateDocumentFeedback
} from "@/services/document.service";

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocumentContext must be used within a DocumentProvider");
  }
  return context;
};

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from Supabase on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await fetchUserDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Get all versions of a document type, optionally filtered by program
  const getVersions = (documentType: string, programId: string | null) => {
    return documents.filter(
      (doc) => 
        doc.documentType === documentType && 
        (programId === null || doc.linkedProgramId === programId)
    ).sort((a, b) => b.versionNumber - a.versionNumber);
  };

  // Add a new document
  const addDocument = async (doc: Omit<Document, "id" | "versionNumber" | "createdAt">) => {
    try {
      const newDocument = await addDocumentService(doc);
      
      if (newDocument) {
        setDocuments([newDocument, ...documents]);
        return newDocument;
      }
    } catch (error) {
      console.error("Error in context addDocument:", error);
      throw error; // Re-throw to allow handling in the component
    }
  };

  // Generate feedback for a document
  const generateFeedback = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      toast.error("Document not found");
      return;
    }
    
    if (document.contentFeedback) {
      toast.info("Feedback already generated for this document");
      return;
    }
    
    toast.info("Generating feedback...", { duration: 2000 });
    
    try {
      const feedback = await generateDocumentFeedback(documentId);
      
      if (feedback) {
        // Update the document in state
        setDocuments(documents.map(doc => 
          doc.id === documentId ? {
            ...doc,
            contentFeedback: feedback.summary,
            improvementPoints: feedback.improvementPoints,
            quotedImprovements: feedback.quotedImprovements,
            score: feedback.score
          } : doc
        ));
        
        toast.success("Feedback generated successfully");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate feedback");
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        addDocument,
        getVersions,
        generateFeedback
      }}
    >
      {loading ? <div>Loading documents...</div> : children}
    </DocumentContext.Provider>
  );
};

export type { Document };
