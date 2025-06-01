
import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex gap-2",
      isMobile ? "w-full flex-col" : "ml-auto"
    )}>
      <Button 
        onClick={onSave} 
        className={cn(
          isMobile ? "w-full h-12" : "",
          "min-h-[44px]"
        )}
        disabled={isSaving}
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Document"}
      </Button>
      <Button 
        onClick={onSaveAndGenerateFeedback}
        variant="secondary"
        className={cn(
          isMobile ? "w-full h-12" : "",
          "min-h-[44px]"
        )}
        disabled={isSaving || isGeneratingFeedback}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isSaving || isGeneratingFeedback ? "Processing..." : "Save & Get AI Feedback"}
      </Button>
      
      <Button 
        onClick={onGenerateTempFeedback}
        variant="outline"
        className={cn(
          isMobile ? "w-full h-12" : "",
          "min-h-[44px]"
        )}
        disabled={isGeneratingFeedback}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGeneratingFeedback ? "Generating..." : "Test AI Feedback"}
      </Button>
    </div>
  );
};

export default EditorActions;
