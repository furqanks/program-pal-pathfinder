
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { useProgramContext } from "./ProgramContext";

export type Document = {
  id: string;
  documentType: "SOP" | "CV" | "Essay";
  linkedProgramId: string | null;
  contentRaw: string;
  contentFeedback: string | null;
  score: number | null;
  versionNumber: number;
  createdAt: string;
};

type DocumentContextType = {
  documents: Document[];
  addDocument: (document: Omit<Document, "id" | "contentFeedback" | "score" | "versionNumber" | "createdAt">) => void;
  updateDocument: (id: string, updates: Partial<Omit<Document, "id" | "createdAt" | "versionNumber">>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  getVersions: (documentType: string, linkedProgramId: string | null) => Document[];
  generateFeedback: (documentId: string) => void;
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocumentContext must be used within a DocumentProvider");
  }
  return context;
};

// Sample documents for demo
const sampleDocuments: Document[] = [
  {
    id: "doc-1",
    documentType: "SOP",
    linkedProgramId: "1",
    contentRaw: "I am applying to Stanford's Computer Science program because of my passion for AI research...",
    contentFeedback: "Your statement is clear but could benefit from more specific examples of your research interests.",
    score: 8,
    versionNumber: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "doc-2",
    documentType: "CV",
    linkedProgramId: null,
    contentRaw: "EDUCATION\n- B.S. Computer Science, 2023\n\nEXPERIENCE\n- Software Engineer Intern, Google",
    contentFeedback: null,
    score: null,
    versionNumber: 1,
    createdAt: new Date().toISOString(),
  },
];

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const { getProgram } = useProgramContext();

  const addDocument = (document: Omit<Document, "id" | "contentFeedback" | "score" | "versionNumber" | "createdAt">) => {
    const existingVersions = getVersions(document.documentType, document.linkedProgramId);
    const versionNumber = existingVersions.length + 1;
    
    const newDocument: Document = {
      ...document,
      id: `doc-${Date.now()}`,
      contentFeedback: null,
      score: null,
      versionNumber,
      createdAt: new Date().toISOString(),
    };
    
    setDocuments([...documents, newDocument]);
    toast.success("Document saved successfully");
  };

  const updateDocument = (id: string, updates: Partial<Omit<Document, "id" | "createdAt" | "versionNumber">>) => {
    setDocuments(documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)));
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    toast.success("Document deleted");
  };

  const getDocument = (id: string) => {
    return documents.find((doc) => doc.id === id);
  };

  const getVersions = (documentType: string, linkedProgramId: string | null) => {
    return documents.filter(
      (doc) => 
        doc.documentType === documentType && 
        doc.linkedProgramId === linkedProgramId
    ).sort((a, b) => b.versionNumber - a.versionNumber);
  };

  const generateFeedback = (documentId: string) => {
    const document = getDocument(documentId);
    if (!document) return;

    // In a real implementation, this would call an AI service
    // For now, let's mock the feedback
    
    // Get the program details if linked
    const program = document.linkedProgramId ? getProgram(document.linkedProgramId) : null;
    
    let feedbackText = "";
    let score = 0;
    
    if (document.documentType === "SOP") {
      feedbackText = `Your statement of purpose is well-structured but could benefit from more specific examples of your research interests. ${program ? `For ${program.university}'s ${program.programName} program, you should emphasize your relevant coursework and research experience.` : "Consider adding more details about your academic background and research experience."} Your introduction is strong, but the conclusion could be more compelling. Overall, good work!`;
      score = 7.5;
    } else if (document.documentType === "CV") {
      feedbackText = "Your CV is well-organized, but consider adding quantifiable achievements to your work experience section. The education section is strong, but you could add relevant coursework. Consider adding a skills section to highlight your technical abilities.";
      score = 8;
    } else {
      feedbackText = "Your essay has a clear thesis and good supporting arguments. Consider strengthening your conclusion and adding more scholarly references. Your writing style is engaging but could benefit from more varied sentence structure.";
      score = 7;
    }
    
    setDocuments(
      documents.map((doc) =>
        doc.id === documentId
          ? { ...doc, contentFeedback: feedbackText, score }
          : doc
      )
    );
    
    toast.success("Feedback generated");
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        getDocument,
        getVersions,
        generateFeedback,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
