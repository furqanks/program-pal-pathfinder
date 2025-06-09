
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search as SearchIcon, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  Globe
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  return (
    <div className="space-y-4">
      {/* Report Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SearchIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">University Program Search Results</h1>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    Search query: <span className="font-medium italic">"{query}"</span>
                  </p>
                </div>
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>Official university sources only</span>
                </div>
                {citations.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{citations.length} verified sources</span>
                  </>
                )}
                <span>•</span>
                <span>Powered by Perplexity AI</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Raw Content Display */}
      <Card>
        <CardContent className="pt-4">
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {rawContent}
          </div>
        </CardContent>
      </Card>
      
      {/* Important Verification Notice */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                Verification Required
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed font-normal">
                This information is sourced from official university websites via Perplexity AI. 
                <span className="font-medium"> Always verify all program details, fees, deadlines, and requirements directly with the universities</span> before making application decisions. 
                University information can change frequently, and admission requirements may vary by student status and academic year.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources & Citations */}
      {citations.length > 0 && citations.some(citation => citation.title || citation.text) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Official Sources ({citations.filter(citation => citation.title || citation.text).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {citations
                .filter(citation => citation.title || citation.text)
                .map((citation, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline line-clamp-2 block mb-2"
                    >
                      {citation.title || citation.url}
                    </a>
                    {citation.text && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-2 font-normal">
                        {citation.text}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{new URL(citation.url).hostname}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchReportView;
