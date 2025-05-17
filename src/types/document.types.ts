
export interface Document {
  id: string;
  documentType: "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay";
  linkedProgramId: string | null;
  contentRaw: string;
  contentFeedback?: string;
  improvementPoints?: string[];
  score?: number;
  versionNumber: number;
  createdAt: string;
}

export type DocumentContextType = {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "versionNumber" | "createdAt">) => Promise<Document | undefined>;
  getVersions: (documentType: string, programId: string | null) => Document[];
  generateFeedback: (documentId: string) => Promise<void>;
};
