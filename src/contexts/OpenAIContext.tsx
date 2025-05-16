
import { createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";

// Define types for OpenAI interactions
type DocumentFeedbackResponse = {
  feedback: string;
  score: number;
};

type ShortlistAnalysisResponse = {
  insights: string[];
};

type OpenAIContextType = {
  reviewDocument: (documentType: "SOP" | "CV" | "Essay", content: string, programId?: string) => Promise<DocumentFeedbackResponse | null>;
  analyzeShortlist: (programs: any[]) => Promise<ShortlistAnalysisResponse | null>;
};

const OpenAIContext = createContext<OpenAIContextType | undefined>(undefined);

export const useOpenAI = () => {
  const context = useContext(OpenAIContext);
  if (!context) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }
  return context;
};

export const OpenAIProvider = ({ children }: { children: ReactNode }) => {
  // Function to review documents using OpenAI
  const reviewDocument = async (
    documentType: "SOP" | "CV" | "Essay", 
    content: string,
    programId?: string
  ): Promise<DocumentFeedbackResponse | null> => {
    try {
      const response = await fetch("/api/review-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType,
          content,
          programId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Document review error:", error);
      toast.error("Failed to get document feedback");
      return null;
    }
  };

  // Function to analyze shortlist using OpenAI
  const analyzeShortlist = async (programs: any[]): Promise<ShortlistAnalysisResponse | null> => {
    try {
      const response = await fetch("/api/shortlist-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programs
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Shortlist analysis error:", error);
      toast.error("Failed to analyze shortlist");
      return null;
    }
  };

  return (
    <OpenAIContext.Provider
      value={{
        reviewDocument,
        analyzeShortlist,
      }}
    >
      {children}
    </OpenAIContext.Provider>
  );
};
