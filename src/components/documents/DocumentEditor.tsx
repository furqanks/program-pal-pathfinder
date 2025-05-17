
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Save, Sparkles } from "lucide-react";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DocumentEditorProps {
  activeDocumentType: string;
  documentTypeLabels: Record<string, string>;
  selectedDocument: any;
  onSaveSuccess: (docId: string) => void;
}

const DocumentEditor = ({
  activeDocumentType,
  documentTypeLabels,
  selectedDocument,
  onSaveSuccess
}: DocumentEditorProps) => {
  const isMobile = useIsMobile();
  const { addDocument, generateFeedback } = useDocumentContext();
  const { programs } = useProgramContext();
  
  const [documentContent, setDocumentContent] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [tempFeedback, setTempFeedback] = useState<{
    content: string;
    feedback?: string;
    improvementPoints?: string[];
    score?: number;
  } | null>(null);
  
  // State to control visibility of feedback
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCreateDocument = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: documentContent
      });
      
      if (savedDoc) {
        onSaveSuccess(savedDoc.id);
        toast.success("Document saved successfully");
      }
      
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate feedback without saving
  const handleGenerateTempFeedback = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }
    
    setIsGeneratingFeedback(true);
    setShowFeedback(false); // Reset feedback visibility
    
    try {
      // Simulate feedback generation without saving
      setTimeout(() => {
        const mockFeedback = {
          content: documentContent,
          feedback: "This is sample feedback for testing purposes. In a production environment, this would be AI-generated feedback based on your document content.",
          improvementPoints: [
            "Consider adding more specific examples about your experience.",
            "The introduction could be stronger to grab attention.",
            "Make sure to align your skills with the program requirements.",
            "Proofread for grammatical errors and clarity.",
            "Add more details about your long-term goals."
          ],
          score: 7
        };
        
        setTempFeedback(mockFeedback);
        setShowFeedback(true); // Show feedback after generation
        toast.success("Test feedback generated");
        setIsGeneratingFeedback(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error generating temporary feedback:", error);
      toast.error("Failed to generate test feedback");
      setIsGeneratingFeedback(false);
    }
  };

  const saveAndGenerateFeedback = async () => {
    if (!documentContent.trim()) {
      toast.error("Please enter document content before generating feedback");
      return;
    }
    
    setIsSaving(true);
    try {
      const savedDoc = await addDocument({
        documentType: activeDocumentType as "SOP" | "CV" | "Essay" | "LOR" | "PersonalEssay" | "ScholarshipEssay",
        linkedProgramId: selectedProgramId,
        contentRaw: documentContent
      });
      
      if (savedDoc) {
        onSaveSuccess(savedDoc.id);
        toast.success("Document saved successfully");
        setIsGeneratingFeedback(true);
        await generateFeedback(savedDoc.id);
      }
    } catch (error) {
      console.error("Error creating document and generating feedback:", error);
      toast.error("Failed to save document and generate feedback");
    } finally {
      setIsSaving(false);
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="document-content">
          {documentTypeLabels[activeDocumentType]} Content
        </Label>
        <Textarea
          id="document-content"
          value={documentContent}
          onChange={(e) => setDocumentContent(e.target.value)}
          placeholder={`Enter your ${documentTypeLabels[activeDocumentType]} content here...`}
          className="mt-1"
          style={{ 
            height: isMobile ? '280px' : 'calc(100vh - 25rem)',
            minHeight: '150px'
          }}
        />
      </div>
      
      {/* Display temporary feedback if available and showFeedback is true */}
      {tempFeedback && showFeedback && (
        <Card className="mt-4 border border-accent">
          <CardContent className="pt-4">
            <h3 className="text-lg font-medium mb-2">AI Feedback</h3>
            <div className="bg-accent/20 p-4 rounded-md">
              <div className="prose prose-sm max-w-none">
                <p>{tempFeedback.feedback}</p>
              </div>
              
              {tempFeedback.score !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="font-medium">Overall Score:</span>
                  <Badge variant="secondary">{tempFeedback.score}/10</Badge>
                </div>
              )}
  
              {tempFeedback.improvementPoints && tempFeedback.improvementPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Improvement Points</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {tempFeedback.improvementPoints.map((point, index) => (
                      <li key={index} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className={`flex ${isMobile ? "w-full flex-col" : ""} gap-2 ${!isMobile && "ml-auto"}`}>
        <Button 
          onClick={handleCreateDocument} 
          className={isMobile ? "w-full" : ""}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Document"}
        </Button>
        <Button 
          onClick={saveAndGenerateFeedback}
          variant="secondary"
          className={isMobile ? "w-full" : ""}
          disabled={isSaving || isGeneratingFeedback}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isSaving || isGeneratingFeedback ? "Processing..." : "Save & Get AI Feedback"}
        </Button>
        
        {/* Button for testing feedback without saving */}
        <Button 
          onClick={handleGenerateTempFeedback}
          variant="outline"
          className={isMobile ? "w-full" : ""}
          disabled={isGeneratingFeedback}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isGeneratingFeedback ? "Generating..." : "Test AI Feedback"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentEditor;
