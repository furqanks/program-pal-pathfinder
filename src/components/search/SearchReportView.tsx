
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Search as SearchIcon, 
  ExternalLink, 
  Info, 
  AlertTriangle,
  GraduationCap,
  FileText
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  // Helper function to parse and format content with clickable links
  const parseContentWithLinks = (content: string) => {
    if (!content) return [];

    // Split content into sections
    const sections = content.split('\n\n').filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Check if this is a program listing with URL
      const programMatch = trimmedSection.match(/^\[(\d+)\]:\s*\[([^\]]+)\]\s*\(([^)]+)\)/);
      if (programMatch) {
        const [, number, title, url] = programMatch;
        return (
          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="text-xs font-mono shrink-0">
                #{number}
              </Badge>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-2 leading-tight">
                  {title}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Program Page
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Check if this is a URL reference
      const urlMatch = trimmedSection.match(/University program page URL:\s*\[([^\]]+)\]\[(\d+)\]/);
      if (urlMatch) {
        const [, title, number] = urlMatch;
        return (
          <div key={index} className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-700 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800 dark:text-amber-200">Program Website:</span>
              <span className="text-amber-700 dark:text-amber-300">{title} [Ref #{number}]</span>
            </div>
          </div>
        );
      }

      // Parse inline URLs in regular text
      const urlRegex = /(https?:\/\/[^\s\)]+)/g;
      const parts = trimmedSection.split(urlRegex);
      
      const formattedContent = parts.map((part, partIndex) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={partIndex}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium break-all"
            >
              {part}
            </a>
          );
        }
        
        // Format text with bold markers
        return part
          .split(/(\*\*[^*]+\*\*)/)
          .map((textPart, textIndex) => {
            if (textPart.startsWith('**') && textPart.endsWith('**')) {
              return (
                <strong key={textIndex} className="font-semibold text-foreground">
                  {textPart.slice(2, -2)}
                </strong>
              );
            }
            return textPart;
          });
      });

      // Determine section type for styling
      const isHeading = trimmedSection.startsWith('##') || 
                      trimmedSection.includes('**') && trimmedSection.length < 100;
      
      if (isHeading) {
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {trimmedSection.replace(/^##\s*/, '').replace(/\*\*/g, '')}
            </h3>
            <Separator className="mb-4" />
          </div>
        );
      }

      return (
        <div key={index} className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {formattedContent}
          </p>
        </div>
      );
    });
  };

  const handleSearchGoogle = () => {
    const searchQuery = `${query} university programs official website`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <SearchIcon className="h-5 w-5" />
              Program Search Report
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Search query: <span className="font-medium italic">"{query}"</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchGoogle}
            className="shrink-0"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Search Google
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Content */}
        <div className="space-y-4">
          {parseContentWithLinks(rawContent)}
        </div>
        
        {/* Verification Notice */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Important Verification Notice
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                This information is provided via AI search and may not reflect the most current details. 
                <strong className="font-medium"> Always verify all program details, fees, deadlines, and requirements directly with the universities</strong> using the official links provided above before making any application decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Source Information */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Data sourced via Perplexity AI from official university websites</span>
            </div>
            {citations.length > 0 && (
              <span>{citations.length} sources referenced</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchReportView;
