
export interface QuotedImprovement {
  originalText: string;
  improvedText: string;
  explanation: string;
}

export interface Document {
  id: string;
  documentType: "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay";
  linkedProgramId: string | null;
  contentRaw: string;
  contentFeedback?: string;
  improvementPoints?: string[];
  quotedImprovements?: QuotedImprovement[];
  score?: number;
  versionNumber: number;
  fileName?: string | null;
  createdAt: string;
}

export type DocumentContextType = {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "versionNumber" | "createdAt">) => Promise<Document | undefined>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  getVersions: (documentType: string, programId: string | null) => Document[];
  generateFeedback: (documentId: string) => Promise<void>;
};
