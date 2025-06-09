
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
  FileText,
  Globe,
  BookOpen,
  DollarSign,
  Calendar,
  Clock
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  // Enhanced content parsing for better presentation
  const parseContentWithStructure = (content: string) => {
    if (!content) return [];

    // Split content into meaningful sections
    const sections = content.split('\n\n').filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Check for program listings with enhanced formatting
      const programMatch = trimmedSection.match(/^\[(\d+)\]:\s*\[([^\]]+)\]\s*\(([^)]+)\)/);
      if (programMatch) {
        const [, number, title, url] = programMatch;
        return (
          <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent mb-4">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="text-xs font-mono shrink-0 bg-primary/10">
                  #{number}
                </Badge>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground mb-2 leading-tight">
                    {title}
                  </h3>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit Program Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Parse program details sections
      const programDetailsMatch = trimmedSection.match(/University:\s*([^\n]+)|Program:\s*([^\n]+)|Tuition:\s*([^\n]+)|Deadline:\s*([^\n]+)|Duration:\s*([^\n]+)/);
      if (programDetailsMatch) {
        return (
          <div key={index} className="bg-muted/30 p-3 rounded-lg border mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {trimmedSection.split('\n').map((line, lineIndex) => {
                const [label, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                
                if (!value) return null;

                const getIcon = (label: string) => {
                  if (label.toLowerCase().includes('university')) return <GraduationCap className="h-3 w-3 text-primary" />;
                  if (label.toLowerCase().includes('tuition') || label.toLowerCase().includes('fee')) return <DollarSign className="h-3 w-3 text-green-600" />;
                  if (label.toLowerCase().includes('deadline')) return <Calendar className="h-3 w-3 text-red-600" />;
                  if (label.toLowerCase().includes('duration')) return <Clock className="h-3 w-3 text-blue-600" />;
                  return <BookOpen className="h-3 w-3 text-muted-foreground" />;
                };

                return (
                  <div key={lineIndex} className="flex items-start gap-2">
                    {getIcon(label)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{label.trim()}</div>
                      <div className="text-sm text-muted-foreground break-words">{value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // Check for section headers - clean up # symbols
      const isHeader = trimmedSection.startsWith('##') || trimmedSection.startsWith('#') ||
                     (trimmedSection.includes('**') && trimmedSection.length < 150) ||
                     trimmedSection.match(/^[A-Z][^.!?]*:?\s*$/);
      
      if (isHeader) {
        const cleanHeader = trimmedSection
          .replace(/^#+\s*/, '') // Remove # symbols
          .replace(/\*\*/g, '') // Remove ** symbols
          .replace(/:$/, ''); // Remove trailing colon
        return (
          <div key={index} className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-base font-medium text-foreground">{cleanHeader}</h2>
            </div>
            <Separator className="mb-3" />
          </div>
        );
      }

      // Format regular paragraphs with consistent text styling matching the intro
      const formatTextWithLinks = (text: string) => {
        // Parse inline URLs - improved regex for better URL detection
        const urlRegex = /(https?:\/\/[^\s\)\]\,\;]+)/g;
        const parts = text.split(urlRegex);
        
        return parts.map((part, partIndex) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={partIndex}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-normal break-all inline-flex items-center gap-1 text-sm"
              >
                {part.length > 60 ? `${part.substring(0, 60)}...` : part}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          }
          
          // Format text with bold markers - consistent weight
          return part
            .split(/(\*\*[^*]+\*\*)/)
            .map((textPart, textIndex) => {
              if (textPart.startsWith('**') && textPart.endsWith('**')) {
                return (
                  <span key={textIndex} className="font-medium text-foreground">
                    {textPart.slice(2, -2)}
                  </span>
                );
              }
              return textPart;
            });
        });
      };

      return (
        <div key={index} className="mb-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed font-normal">
              {formatTextWithLinks(trimmedSection)}
            </p>
          </div>
        </div>
      );
    });
  };

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
                  <h1 className="text-lg font-medium">University Program Search Report</h1>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    Comprehensive analysis of: <span className="font-medium italic">"{query}"</span>
                  </p>
                </div>
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>Sourced from official university websites</span>
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

      {/* Main Report Content */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {parseContentWithStructure(rawContent)}
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
                This report provides AI-generated insights from official university sources. 
                <span className="font-medium"> Always verify all program details, fees, deadlines, and requirements directly with the universities</span> before making application decisions. 
                University information can change frequently, and admission requirements may vary by student status and academic year.
              </p>
              <div className="flex flex-wrap gap-1 pt-2">
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  Check Current Fees
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  Verify Deadlines
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  Confirm Requirements
                </Badge>
              </div>
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
              Sources & References ({citations.filter(citation => citation.title || citation.text).length})
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
