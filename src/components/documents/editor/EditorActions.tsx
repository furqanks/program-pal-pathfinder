
import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";

interface EditorActionsProps {
  isMobile: boolean;
  isSaving: boolean;
  isGeneratingFeedback: boolean;
  onSave: () => void;
  onSaveAndGenerateFeedback: () => void;
  onGenerateTempFeedback: () => void;
}

const EditorActions = ({
  isMobile,
  isSaving,
  isGeneratingFeedback,
  onSave,
  onSaveAndGenerateFeedback,
  onGenerateTempFeedback
}: EditorActionsProps) => {
  return (
    <div className={`flex ${isMobile ? "w-full flex-col" : ""} gap-2 ${!isMobile && "ml-auto"}`}>
      <Button 
        onClick={onSave} 
        className={isMobile ? "w-full" : ""}
        disabled={isSaving}
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Document"}
      </Button>
      <Button 
        onClick={onSaveAndGenerateFeedback}
        variant="secondary"
        className={isMobile ? "w-full" : ""}
        disabled={isSaving || isGeneratingFeedback}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isSaving || isGeneratingFeedback ? "Processing..." : "Save & Get AI Feedback"}
      </Button>
      
      <Button 
        onClick={onGenerateTempFeedback}
        variant="outline"
        className={isMobile ? "w-full" : ""}
        disabled={isGeneratingFeedback}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGeneratingFeedback ? "Generating..." : "Test AI Feedback"}
      </Button>
    </div>
  );
};

export default EditorActions;
