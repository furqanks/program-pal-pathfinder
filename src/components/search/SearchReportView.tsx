
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search as SearchIcon, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  Globe,
  DollarSign,
  Link
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  // Extract fee-related information from raw content for highlighting
  const extractFeeInfo = (content: string) => {
    const feePatterns = [
      /(?:tuition|fees?|cost)[\s\S]*?(?:\$[\d,]+|\£[\d,]+|€[\d,]+|[\d,]+\s*(?:USD|GBP|EUR|per year|annually))/gi,
      /(?:\$[\d,]+|\£[\d,]+|€[\d,]+)[\s\S]*?(?:tuition|fees?|cost)/gi
    ];
    
    const matches = [];
    for (const pattern of feePatterns) {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    }
    
    return matches.slice(0, 5); // Limit to first 5 matches
  };

  const feeHighlights = extractFeeInfo(rawContent);

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

      {/* Fee Information Highlights */}
      {feeHighlights.length > 0 && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-green-600" />
              Fee Information Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feeHighlights.map((fee, index) => (
                <div key={index} className="text-sm bg-background/50 p-3 rounded border">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    {fee.trim()}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-3 font-medium">
              ⚠️ Always verify current fees directly with universities as costs may vary by student status and academic year.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sources & Citations - Move to top for better visibility */}
      {citations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="h-4 w-4 text-blue-600" />
              Official Source URLs ({citations.length})
            </CardTitle>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click any link below to visit the official university source
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {citations.map((citation, index) => (
                <div key={index} className="border rounded-lg p-4 bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={citation.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:underline block mb-2"
                      >
                        {citation.title || new URL(citation.url).hostname}
                      </a>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono bg-muted px-2 py-1 rounded">
                          {citation.url}
                        </span>
                      </div>
                      {citation.text && (
                        <p className="text-sm text-muted-foreground line-clamp-3 font-normal">
                          {citation.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Content Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Detailed Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  );
};

export default SearchReportView;
