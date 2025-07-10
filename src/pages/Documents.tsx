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
import SubscriptionGuard from "@/components/auth/SubscriptionGuard";

const DocumentsPage = () => {
  return (
    <SubscriptionGuard feature="document review and feedback">
      <DocumentProvider>
        <Documents />
      </DocumentProvider>
    </SubscriptionGuard>
  );
};

const Documents = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("sop");
  const { documents, getVersions } = useDocumentContext();
  const [documentContent, setDocumentContent] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  
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

  // When changing tabs, reset selection but only if not creating new
  useEffect(() => {
    if (!creatingNew) {
      if (documentVersions.length > 0) {
        setSelectedDocumentId(documentVersions[0].id);
      } else {
        setSelectedDocumentId(null);
      }
    }
  }, [activeTab, selectedProgramId, documentVersions, creatingNew]);

  // Update content when selection changes (but not when creating new)
  useEffect(() => {
    if (selectedDocument && !creatingNew) {
      setDocumentContent(selectedDocument.contentRaw);
    } else if (creatingNew) {
      setDocumentContent("");
    }
  }, [selectedDocument, creatingNew]);

  const handleCreateNewVersion = () => {
    if (selectedDocument) {
      setSelectedDocumentId(null);
      setDocumentContent(selectedDocument.contentRaw);
    }
  };

  const handleCreateNew = () => {
    console.log("Creating new document - before:", { selectedDocumentId, creatingNew });
    setSelectedDocumentId(null);
    setCreatingNew(true);
    setDocumentContent(""); // Clear content immediately
    console.log("Creating new document - after:", { selectedDocumentId: null, creatingNew: true });
  };

  const handleDocumentSelect = (docId: string | null) => {
    console.log("Selecting document:", docId);
    setSelectedDocumentId(docId);
    setCreatingNew(false);
  };

  const handleSaveSuccess = (docId: string) => {
    console.log("Document saved successfully:", docId);
    setSelectedDocumentId(docId);
    setCreatingNew(false);
  };

  return (
    <div className="spacing-grid animate-fade-in">
      {/* Enhanced header with better typography */}
      <div className="text-center space-y-4 pb-2">
        <div className="space-y-2">
          <h1 className="text-display">Document Assistant</h1>
          <p className="text-body-secondary max-w-2xl mx-auto">
            Get AI-powered feedback on your applications, essays, and uploaded documents. 
            Create, edit, and perfect your application materials with intelligent suggestions.
          </p>
        </div>
      </div>
      
      {/* Main layout with improved responsive design */}
      <div className={cn(
        "grid gap-6 h-[calc(100vh-12rem)]",
        isMobile ? "grid-cols-1" : "lg:grid-cols-[320px_1fr]"
      )}>
        {/* Sidebar for document types and versions */}
        <div className="space-y-6">
          {/* Document type selector */}
          <Card className="card-modern">
            <CardHeader className="pb-3">
              <CardTitle className="text-subheading">Document Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DocumentTypeSelector 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                selectedProgramId={selectedProgramId} 
                setSelectedProgramId={setSelectedProgramId} 
                isMobile={isMobile} 
              />
            </CardContent>
          </Card>
          
          {/* Document versions list */}
          <Card className="card-modern flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-subheading">
                {documentTypeLabels[activeDocumentType]} Versions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DocumentsList 
                activeDocumentType={activeDocumentType} 
                selectedProgramId={selectedProgramId} 
                selectedDocumentId={selectedDocumentId} 
                onSelectDocument={handleDocumentSelect}
                onCreateNew={handleCreateNew}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Main document content area with enhanced styling */}
        <Card className="card-modern flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-subheading">
                  {selectedDocument && !creatingNew 
                    ? `${documentTypeLabels[selectedDocument.documentType]} - Version ${selectedDocument.versionNumber}` 
                    : `New ${documentTypeLabels[activeDocumentType]}`
                  }
                </CardTitle>
                <p className="text-body-secondary">
                  {selectedDocument && !creatingNew
                    ? `Created ${new Date(selectedDocument.createdAt).toLocaleDateString()}`
                    : "Create a new document from scratch or upload an existing file"
                  }
                </p>
              </div>
              
              {/* Program selector for new documents */}
              {(!selectedDocument || creatingNew) && (
                <div className="md:min-w-[200px]">
                  <DocumentsProgramSelector 
                    selectedProgramId={selectedProgramId} 
                    setSelectedProgramId={setSelectedProgramId} 
                    isMobile={isMobile} 
                  />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-6 overflow-hidden">
            <div className="h-full">
              {selectedDocument && !creatingNew ? (
                <DocumentViewer 
                  selectedDocument={selectedDocument} 
                  onCreateNewVersion={handleCreateNewVersion} 
                  documentTypeLabels={documentTypeLabels} 
                />
              ) : (
                <DocumentEditor 
                  activeDocumentType={activeDocumentType} 
                  documentTypeLabels={documentTypeLabels} 
                  selectedDocument={creatingNew ? null : selectedDocument} 
                  onSaveSuccess={handleSaveSuccess}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentsPage;