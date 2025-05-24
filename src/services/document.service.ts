
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
  quotedImprovements: doc.quoted_improvements,
  score: doc.score,
  versionNumber: doc.version_number,
  fileName: doc.file_name || null,
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
    const currentUser = await supabase.auth.getUser();
    
    if (!currentUser.data.user) {
      toast.error("You must be logged in to save documents");
      return;
    }
    
    const { data: versionNumber, error: versionError } = await supabase.rpc(
      'get_next_version_number',
      {
        p_user_id: currentUser.data.user.id,
        p_document_type: doc.documentType,
        p_program_id: doc.linkedProgramId
      }
    );

    if (versionError) throw versionError;

    const { data, error } = await supabase
      .from('user_documents')
      .insert({
        document_type: doc.documentType,
        program_id: doc.linkedProgramId,
        original_text: doc.contentRaw,
        file_name: doc.fileName || null,
        version_number: versionNumber || 1
      })
      .select()
      .single();

    if (error) throw error;

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
  quotedImprovements?: Array<{
    originalText: string;
    improvedText: string;
    explanation: string;
  }>;
  score?: number;
} | undefined> => {
  try {
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
    
    const { data, error } = await supabase.functions.invoke('review-document', {
      body: {
        content: document.original_text,
        documentType: document.document_type,
        programId: document.program_id,
        fileName: document.file_name
      }
    });

    if (error) throw error;
    
    if (data && data.summary) {
      const { error: updateError } = await supabase
        .from('user_documents')
        .update({
          feedback_summary: data.summary,
          improvement_points: data.improvementPoints,
          quoted_improvements: data.quotedImprovements || [],
          score: data.score
        })
        .eq('id', documentId);

      if (updateError) throw updateError;
      
      return {
        summary: data.summary,
        improvementPoints: data.improvementPoints,
        quotedImprovements: data.quotedImprovements || [],
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

// Generate an improved draft based on feedback
export const generateImprovedDraft = async (
  originalContent: string,
  feedback: {
    summary: string;
    improvementPoints: string[];
    quotedImprovements: Array<{
      originalText: string;
      improvedText: string;
      explanation: string;
    }>;
    score: number;
  },
  documentType: string
): Promise<string> => {
  try {
    console.log("Requesting improved draft for document...");
    
    const { data, error } = await supabase.functions.invoke('review-document', {
      body: {
        action: 'generate-improved-draft',
        documentType,
        originalContent,
        feedback
      }
    });

    if (error) {
      console.error("Error from generate-improved-draft function:", error);
      throw error;
    }
    
    if (data && data.improvedDraft) {
      console.log("Received improved draft from AI");
      return data.improvedDraft;
    } else {
      throw new Error(data?.error || "Failed to generate improved draft");
    }
  } catch (error) {
    console.error("Error generating improved draft:", error);
    toast.error("Error generating improved draft. Please try again.");
    throw error;
  }
};

// Generate real test feedback without saving to database
export const generateTestFeedback = async (
  content: string,
  documentType: string,
  programId: string | null,
  fileName?: string
): Promise<{
  summary: string;
  improvementPoints: string[];
  quotedImprovements: Array<{
    originalText: string;
    improvedText: string;
    explanation: string;
  }>;
  score: number;
}> => {
  try {
    console.log(`Sending content for review. Content length: ${content.length}, File: ${fileName || 'No file'}`);
    console.log("First 100 chars of content:", content.substring(0, 100) + "...");
    
    // Make sure we use the exact content provided without any modification
    const { data, error } = await supabase.functions.invoke('review-document', {
      body: {
        content, // Send the exact content without any modification
        documentType,
        programId,
        testMode: true,
        fileName
      }
    });

    if (error) {
      console.error("Error from review-document function:", error);
      throw error;
    }
    
    if (data && data.summary) {
      console.log("Received feedback from AI:", data);
      return {
        summary: data.summary,
        improvementPoints: data.improvementPoints,
        quotedImprovements: data.quotedImprovements || [],
        score: data.score
      };
    } else {
      throw new Error(data?.error || "Failed to generate test feedback");
    }
  } catch (error) {
    console.error("Error generating test feedback:", error);
    toast.error("Error generating feedback. Please try again.");
    throw error;
  }
};
