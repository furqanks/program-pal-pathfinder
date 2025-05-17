
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentContext, Document } from "@/contexts/DocumentContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { PlusCircle, FileText, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProgramContext } from "@/contexts/ProgramContext";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const DocumentsPage = () => {
  return (
    <DocumentProvider>
      <Documents />
    </DocumentProvider>
  );
};

const Documents = () => {
  const [activeTab, setActiveTab] = useState("sop");
  const { 
    documents, 
    addDocument, 
    getVersions, 
    generateFeedback 
  } = useDocumentContext();
  const { programs } = useProgramContext();
  
  const [documentContent, setDocumentContent] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  
  const documentTypes = {
    sop: "SOP",
    cv: "CV",
    essay: "Essay"
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
  
  const handleCreateDocument = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    await addDocument({
      documentType: activeDocumentType as "SOP" | "CV" | "Essay",
      linkedProgramId: selectedProgramId,
      contentRaw: documentContent
    });
    
    // Reset content
    setDocumentContent("");
  };
  
  const handleGenerateFeedback = async () => {
    if (selectedDocumentId) {
      await generateFeedback(selectedDocumentId);
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
        <div className="w-full md:w-64">
          <div className="space-y-4">
            <Select 
              value={selectedProgramId || "all-documents"} 
              onValueChange={(value) => setSelectedProgramId(value === "all-documents" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-documents">All documents</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.programName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="sop" className="flex-1">SOPs</TabsTrigger>
                <TabsTrigger value="cv" className="flex-1">CVs</TabsTrigger>
                <TabsTrigger value="essay" className="flex-1">Essays</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Versions</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedDocumentId(null);
                    setDocumentContent("");
                  }}
                  className="h-8 px-2"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              
              {documentVersions.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                  No documents yet
                </div>
              ) : (
                <div className="space-y-2">
                  {documentVersions.map((doc) => {
                    const program = doc.linkedProgramId 
                      ? programs.find(p => p.id === doc.linkedProgramId) 
                      : null;
                    
                    return (
                      <Button
                        key={doc.id}
                        variant={selectedDocumentId === doc.id ? "default" : "outline"}
                        className="w-full justify-start h-auto py-2 px-3"
                        onClick={() => setSelectedDocumentId(doc.id)}
                      >
                        <div className="flex flex-col items-start text-left">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>v{doc.versionNumber}</span>
                            {doc.score && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                {doc.score}/10
                              </Badge>
                            )}
                          </div>
                          {program && (
                            <span className="text-xs text-muted-foreground mt-1 truncate w-full">
                              {program.programName}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground mt-1">
                            {format(new Date(doc.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <Card className="h-[calc(100vh-18rem)]">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedDocument 
                    ? `${activeDocumentType} - Version ${selectedDocument.versionNumber}` 
                    : `New ${activeDocumentType}`}
                </CardTitle>
                
                {!selectedDocument && (
                  <Select 
                    value={selectedProgramId || "no-program"} 
                    onValueChange={(value) => setSelectedProgramId(value === "no-program" ? null : value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Link to program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-program">No program link</SelectItem>
                      {programs.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.programName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2 h-[calc(100vh-7rem)] overflow-auto">
              {selectedDocument ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedDocument.contentRaw}
                    </pre>
                  </div>
                  
                  {selectedDocument.contentFeedback ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">AI Feedback</h3>
                      <div className="border rounded-md p-4 bg-accent/20">
                        <div className="prose prose-sm max-w-none">
                          <p>{selectedDocument.contentFeedback}</p>
                        </div>
                        
                        {selectedDocument.score !== null && (
                          <div className="mt-4 flex items-center gap-2">
                            <span className="font-medium">Overall Score:</span>
                            <Badge>{selectedDocument.score}/10</Badge>
                          </div>
                        )}

                        {selectedDocument.improvementPoints && selectedDocument.improvementPoints.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Improvement Points</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {selectedDocument.improvementPoints.map((point, index) => (
                                <li key={index} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      <Sparkles className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-center text-muted-foreground">
                        No feedback generated yet. Click "Get AI Feedback" to analyze this document.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="document-content">
                    {activeDocumentType} Content
                  </Label>
                  <Textarea
                    id="document-content"
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    placeholder={`Enter your ${activeDocumentType} content here...`}
                    className="mt-1 h-[calc(100vh-25rem)]"
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              {selectedDocument ? (
                <div className="flex w-full gap-2 justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedDocumentId(null);
                      setDocumentContent(selectedDocument.contentRaw);
                    }}
                  >
                    Create New Version
                  </Button>
                  <Button 
                    onClick={handleGenerateFeedback}
                    disabled={!!selectedDocument.contentFeedback}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {selectedDocument.contentFeedback ? "Feedback Generated" : "Get AI Feedback"}
                  </Button>
                </div>
              ) : (
                <Button onClick={handleCreateDocument} className="ml-auto">
                  Save Document
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
