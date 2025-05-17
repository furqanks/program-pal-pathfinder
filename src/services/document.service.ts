
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/document.types";

// Convert Supabase document format to our Document interface
export const formatDocumentFromDb = (doc: any): Document => ({
  id: doc.id,
  documentType: doc.document_type,
  linkedProgramId: doc.program_id,
  contentRaw: doc.original_text,
  contentFeedback: doc.feedback_summary,
  improvementPoints: doc.improvement_points,
  score: doc.score,
  versionNumber: doc.version_number,
  createdAt: doc.created_at
});

// Fetch all documents for the current user
export const fetchUserDocuments = async (): Promise<Document[]> => {
  try {
    const { data: userDocuments, error } = await supabase
      .from('user_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (userDocuments) {
      return userDocuments.map(formatDocumentFromDb);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    toast.error('Failed to load your documents');
    return [];
  }
};

// Add a new document
export const addDocument = async (
  doc: Omit<Document, "id" | "versionNumber" | "createdAt">
): Promise<Document | undefined> => {
  try {
    // Get the current user's ID
    const currentUser = await supabase.auth.getUser();
    
    if (!currentUser.data.user) {
      toast.error("You must be logged in to save documents");
      return;
    }
    
    // Get the next version number from Supabase
    const { data: versionNumber, error: versionError } = await supabase.rpc(
      'get_next_version_number',
      {
        p_user_id: currentUser.data.user.id,
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

    // Format and return the new document
    const newDocument = formatDocumentFromDb(data);
    toast.success("Document saved successfully");
    return newDocument;
  } catch (error) {
    console.error("Error adding document:", error);
    toast.error("Failed to save document");
  }
};

// Generate feedback for a document
export const generateDocumentFeedback = async (documentId: string): Promise<{
  summary?: string;
  improvementPoints?: string[];
  score?: number;
} | undefined> => {
  try {
    // Find document in database
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;
    
    if (!document) {
      toast.error("Document not found");
      return;
    }
    
    // Call the review-document edge function
    const { data, error } = await supabase.functions.invoke('review-document', {
      body: {
        content: document.original_text,
        documentType: document.document_type,
        programId: document.program_id
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
      
      return {
        summary: data.summary,
        improvementPoints: data.improvementPoints,
        score: data.score
      };
    } else {
      throw new Error(data?.error || "Failed to generate feedback");
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw error;
  }
};

// Generate mock feedback for development/testing
export const generateMockFeedback = () => {
  const mockFeedback = "This is a simulated feedback for testing purposes. In a real environment, this would be replaced with AI-generated feedback based on the document content.";
  const mockPoints = [
    "Consider adding more specific examples about your experience.",
    "The introduction could be stronger to grab attention.",
    "Make sure to align your skills with the program requirements.",
    "Proofread for grammatical errors and clarity.",
    "Add more details about your long-term goals."
  ];
  const mockScore = 7;
  
  return {
    summary: mockFeedback,
    improvementPoints: mockPoints,
    score: mockScore
  };
};
