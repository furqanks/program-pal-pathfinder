
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Globe,
  Sparkles,
  Star
} from "lucide-react";

interface SearchReportHeaderProps {
  query: string;
  citations: any[];
  onSearchGoogle: () => void;
}

const SearchReportHeader = ({ query, citations, onSearchGoogle }: SearchReportHeaderProps) => {
  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                University Program Search Results
                <Star className="h-5 w-5 text-primary" />
              </CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Search Query:</span> <span className="italic">"{query}"</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>Official university sources</span>
                  </div>
                  {citations.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{citations.length} verified sources</span>
                    </>
                  )}
                  <span>•</span>
                  <span>At least 5 program options included</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSearchGoogle}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Search Google for More
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SearchReportHeader;
