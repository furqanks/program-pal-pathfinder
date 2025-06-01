
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentContext, DocumentProvider } from "@/contexts/DocumentContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentTypeSelector from "@/components/documents/DocumentTypeSelector";
import DocumentsList from "@/components/documents/DocumentsList";
import DocumentEditor from "@/components/documents/DocumentEditor";
import DocumentViewer from "@/components/documents/DocumentViewer";
import DocumentsProgramSelector from "@/components/documents/DocumentsProgramSelector";
import { cn } from "@/lib/utils";

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
    <div className={cn("space-y-4", isMobile ? "space-y-3" : "space-y-6")}>
      <div className={isMobile ? "px-2" : ""}>
        <h1 className={cn(
          "font-bold tracking-tight",
          isMobile ? "text-2xl" : "text-3xl"
        )}>Document Assistant</h1>
        <p className={cn(
          "text-muted-foreground mt-1",
          isMobile ? "text-sm" : ""
        )}>
          Get AI feedback on your applications, essays, and uploaded documents
        </p>
      </div>
      
      <div className={cn(
        "flex gap-4",
        isMobile ? "flex-col px-2" : "flex-col md:flex-row"
      )}>
        {/* Sidebar for document types and versions */}
        <div className={cn(isMobile ? "w-full" : "w-64")}>
          <div className={cn("space-y-4", isMobile ? "space-y-3" : "")}>
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
          <Card className={cn(
            isMobile ? "min-h-[70vh]" : "h-[calc(100vh-18rem)]"
          )}>
            <CardHeader className={cn("pb-3", isMobile ? "px-4" : "")}>
              <div className={cn(
                "flex justify-between items-center gap-2",
                isMobile ? "flex-col items-start space-y-2" : "flex-wrap"
              )}>
                <CardTitle className={cn(
                  isMobile ? "text-base" : "text-lg"
                )}>
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
            
            <CardContent className={cn(
              "pb-2 overflow-auto",
              isMobile ? "px-4 h-[calc(70vh-8rem)]" : "h-[calc(100vh-7rem)]"
            )}>
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
