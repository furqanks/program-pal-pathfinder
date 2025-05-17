import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentContext, DocumentProvider } from "@/contexts/DocumentContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentTypeSelector from "@/components/documents/DocumentTypeSelector";
import DocumentsList from "@/components/documents/DocumentsList";
import DocumentEditor from "@/components/documents/DocumentEditor";
import DocumentViewer from "@/components/documents/DocumentViewer";
import DocumentsProgramSelector from "@/components/documents/DocumentsProgramSelector";

const DocumentsPage = () => {
  return (
    <DocumentProvider>
      <Documents />
    </DocumentProvider>
  );
};

const Documents = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("sop");
  const { documents, getVersions } = useDocumentContext();
  
  const [documentContent, setDocumentContent] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  
  const documentTypes = {
    sop: "SOP",
    cv: "CV",
    essay: "Essay",
    lor: "LOR",
    personalEssay: "PersonalEssay",
    scholarshipEssay: "ScholarshipEssay"
  };
  
  const documentTypeLabels = {
    SOP: "Statement of Purpose",
    CV: "Curriculum Vitae/Resume",
    Essay: "General Essay",
    LOR: "Letter of Recommendation",
    PersonalEssay: "Personal Essay",
    ScholarshipEssay: "Scholarship Essay"
  };
  
  // Get versions for the current document type
  const activeDocumentType = documentTypes[activeTab as keyof typeof documentTypes];
  const documentVersions = getVersions(activeDocumentType, selectedProgramId);
  
  // Find selected document
  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);
  
  // When changing tabs, reset selection but keep content if creating new
  useEffect(() => {
    if (documentVersions.length > 0) {
      setSelectedDocumentId(documentVersions[0].id);
    } else {
      setSelectedDocumentId(null);
    }
  }, [activeTab, selectedProgramId, documentVersions]);
  
  // Update content when selection changes
  useEffect(() => {
    if (selectedDocument) {
      setDocumentContent(selectedDocument.contentRaw);
    } else {
      setDocumentContent("");
    }
  }, [selectedDocument]);
  
  const handleCreateNewVersion = () => {
    if (selectedDocument) {
      setSelectedDocumentId(null);
      setDocumentContent(selectedDocument.contentRaw);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Get AI feedback on your applications and essays
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar for document types and versions */}
        <div className={`${isMobile ? "w-full" : "w-64"}`}>
          <div className="space-y-4">
            <DocumentTypeSelector
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedProgramId={selectedProgramId}
              setSelectedProgramId={setSelectedProgramId}
              isMobile={isMobile}
            />
            
            <DocumentsList
              activeDocumentType={activeDocumentType}
              selectedProgramId={selectedProgramId}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={setSelectedDocumentId}
            />
          </div>
        </div>
        
        {/* Main document content area */}
        <div className="flex-1 space-y-4">
          <Card className={isMobile ? "h-auto min-h-[60vh]" : "h-[calc(100vh-18rem)]"}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <CardTitle className="text-lg">
                  {selectedDocument 
                    ? `${documentTypeLabels[selectedDocument.documentType]} - Version ${selectedDocument.versionNumber}` 
                    : `New ${documentTypeLabels[activeDocumentType]}`}
                </CardTitle>
                
                {!selectedDocument && (
                  <DocumentsProgramSelector
                    selectedProgramId={selectedProgramId}
                    setSelectedProgramId={setSelectedProgramId}
                    isMobile={isMobile}
                  />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2 h-[calc(100vh-7rem)] overflow-auto">
              {selectedDocument ? (
                <DocumentViewer
                  selectedDocument={selectedDocument}
                  onCreateNewVersion={handleCreateNewVersion}
                  documentTypeLabels={documentTypeLabels}
                />
              ) : (
                <DocumentEditor
                  activeDocumentType={activeDocumentType}
                  documentTypeLabels={documentTypeLabels}
                  selectedDocument={selectedDocument}
                  onSaveSuccess={setSelectedDocumentId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
