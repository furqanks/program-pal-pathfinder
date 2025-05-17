
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  documentType: "SOP" | "CV" | "Essay";
  linkedProgramId: string | null;
  contentRaw: string;
  contentFeedback?: string;
  improvementPoints?: string[];
  score?: number;
  versionNumber: number;
  createdAt: string;
}

type DocumentContextType = {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "versionNumber" | "createdAt">) => void;
  getVersions: (documentType: string, programId: string | null) => Document[];
  generateFeedback: (documentId: string) => Promise<void>;
};

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
    const fetchDocuments = async () => {
      try {
        const { data: userDocuments, error } = await supabase
          .from('user_documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (userDocuments) {
          // Convert Supabase document format to our Document interface
          const formattedDocuments: Document[] = userDocuments.map((doc: any) => ({
            id: doc.id,
            documentType: doc.document_type,
            linkedProgramId: doc.program_id,
            contentRaw: doc.original_text,
            contentFeedback: doc.feedback_summary,
            improvementPoints: doc.improvement_points,
            score: doc.score,
            versionNumber: doc.version_number,
            createdAt: doc.created_at
          }));

          setDocuments(formattedDocuments);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load your documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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
      // Get the next version number from Supabase
      const { data: versionNumber, error: versionError } = await supabase.rpc(
        'get_next_version_number',
        {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_document_type: doc.documentType,
          p_program_id: doc.linkedProgramId
        }
      );

      if (versionError) throw versionError;

      // Insert the document into Supabase
      const { data, error } = await supabase
        .from('user_documents')
        .insert({
          document_type: doc.documentType,
          program_id: doc.linkedProgramId,
          original_text: doc.contentRaw,
          version_number: versionNumber || 1
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new document to state
      const newDocument: Document = {
        id: data.id,
        documentType: data.document_type,
        linkedProgramId: data.program_id,
        contentRaw: data.original_text,
        contentFeedback: data.feedback_summary,
        improvementPoints: data.improvement_points,
        score: data.score,
        versionNumber: data.version_number,
        createdAt: data.created_at
      };

      setDocuments([newDocument, ...documents]);
      toast.success("Document saved successfully");
      return newDocument;
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to save document");
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
      // Call the review-document edge function
      const { data, error } = await supabase.functions.invoke('review-document', {
        body: {
          content: document.contentRaw,
          documentType: document.documentType,
          programId: document.linkedProgramId
        }
      });

      if (error) throw error;
      
      if (data && data.summary) {
        // Update the document with the feedback
        const { error: updateError } = await supabase
          .from('user_documents')
          .update({
            feedback_summary: data.summary,
            improvement_points: data.improvementPoints,
            score: data.score
          })
          .eq('id', documentId);

        if (updateError) throw updateError;

        // Update the document in state
        setDocuments(documents.map(doc => 
          doc.id === documentId ? {
            ...doc,
            contentFeedback: data.summary,
            improvementPoints: data.improvementPoints,
            score: data.score
          } : doc
        ));
        
        toast.success("Feedback generated successfully");
      } else {
        throw new Error(data?.error || "Failed to generate feedback");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate feedback");
      
      // For development, simulate feedback after API failure
      const mockFeedback = "This is a simulated feedback for testing purposes. In a real environment, this would be replaced with AI-generated feedback based on the document content.";
      const mockPoints = [
        "Consider adding more specific examples about your experience.",
        "The introduction could be stronger to grab attention.",
        "Make sure to align your skills with the program requirements.",
        "Proofread for grammatical errors and clarity.",
        "Add more details about your long-term goals."
      ];
      const mockScore = 7;
      
      // Update the document in state with mock feedback
      setDocuments(documents.map(doc => 
        doc.id === documentId ? {
          ...doc,
          contentFeedback: mockFeedback,
          improvementPoints: mockPoints,
          score: mockScore
        } : doc
      ));
      
      toast.success("Simulated feedback generated for testing");
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
