
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchReportContentProps {
  rawContent: string;
  query?: string;
}

const SearchReportContent = ({ rawContent, query }: SearchReportContentProps) => {
  const [organizedContent, setOrganizedContent] = useState<string>("");
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [showOrganized, setShowOrganized] = useState(false);

  const handleOrganizeContent = async () => {
    setIsOrganizing(true);
    try {
      console.log('Requesting content organization...');
      
      const { data, error } = await supabase.functions.invoke('organize-search-results', {
        body: { 
          rawContent, 
          query: query || 'University program search'
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to organize content');
      }

      if (data && data.organizedContent) {
        setOrganizedContent(data.organizedContent);
        setShowOrganized(true);
        toast.success('Content organized successfully!');
        console.log('Content organization complete');
      } else {
        throw new Error('No organized content received');
      }
    } catch (error) {
      console.error('Organization error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to organize content');
    } finally {
      setIsOrganizing(false);
    }
  };

  const displayContent = showOrganized ? organizedContent : rawContent;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Search Results</h3>
        <div className="flex gap-2">
          {organizedContent && (
            <Button
              variant={showOrganized ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOrganized(!showOrganized)}
            >
              {showOrganized ? "Show Original" : "Show Organized"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOrganizeContent}
            disabled={isOrganizing}
          >
            {isOrganizing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isOrganizing ? 'Organizing...' : 'Organize with AI'}
          </Button>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {displayContent}
        </pre>
      </div>
    </div>
  );
};

export default SearchReportContent;
