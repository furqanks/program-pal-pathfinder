
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
  Clock,
  ChevronRight
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  // Enhanced content parsing with improved mobile layout
  const parseContentWithStructure = (content: string) => {
    if (!content) return [];

    const sections = content.split('\n\n').filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Enhanced program card with mobile-first design
      const programMatch = trimmedSection.match(/^\[(\d+)\]:\s*\[([^\]]+)\]\s*\(([^)]+)\)/);
      if (programMatch) {
        const [, number, title, url] = programMatch;
        return (
          <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent mb-4">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs font-mono shrink-0 bg-primary/10 px-2 py-1">
                    #{number}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-foreground leading-snug mb-2">
                      {title}
                    </h3>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-sm"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Program Page
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Improved program details with mobile-optimized grid
      const programDetailsMatch = trimmedSection.match(/University:\s*([^\n]+)|Program:\s*([^\n]+)|Tuition:\s*([^\n]+)|Deadline:\s*([^\n]+)|Duration:\s*([^\n]+)/);
      if (programDetailsMatch) {
        return (
          <div key={index} className="bg-muted/30 rounded-lg border mb-4 overflow-hidden">
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {trimmedSection.split('\n').map((line, lineIndex) => {
                  const [label, ...valueParts] = line.split(':');
                  const value = valueParts.join(':').trim();
                  
                  if (!value) return null;

                  const getIcon = (label: string) => {
                    if (label.toLowerCase().includes('university')) return <GraduationCap className="h-4 w-4 text-primary" />;
                    if (label.toLowerCase().includes('tuition') || label.toLowerCase().includes('fee')) return <DollarSign className="h-4 w-4 text-green-600" />;
                    if (label.toLowerCase().includes('deadline')) return <Calendar className="h-4 w-4 text-red-600" />;
                    if (label.toLowerCase().includes('duration')) return <Clock className="h-4 w-4 text-blue-600" />;
                    return <BookOpen className="h-4 w-4 text-muted-foreground" />;
                  };

                  return (
                    <div key={lineIndex} className="flex items-start gap-3 p-3 bg-background/50 rounded-md">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(label)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="font-medium text-sm text-foreground">{label.trim()}</div>
                        <div className="text-sm text-muted-foreground break-words leading-relaxed">{value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // Enhanced section headers with better mobile typography
      const isHeader = trimmedSection.startsWith('##') || 
                     (trimmedSection.includes('**') && trimmedSection.length < 150) ||
                     trimmedSection.match(/^[A-Z][^.!?]*:?\s*$/);
      
      if (isHeader) {
        const cleanHeader = trimmedSection.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground flex-1">{cleanHeader}</h2>
            </div>
            <Separator className="mb-4" />
          </div>
        );
      }

      // Enhanced text formatting with improved readability
      const formatTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s\)]+)/g;
        const parts = text.split(urlRegex);
        
        return parts.map((part, partIndex) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={partIndex}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium break-all inline-flex items-center gap-1 text-sm"
              >
                {part.length > 50 ? `${part.substring(0, 50)}...` : part}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            );
          }
          
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
      };

      return (
        <div key={index} className="mb-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed text-sm">
              {formatTextWithLinks(trimmedSection)}
            </p>
          </div>
        </div>
      );
    });
  };

  const handleSearchGoogle = () => {
    const searchQuery = `${query} university programs official website`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Optimized Report Header */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <SearchIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg mb-2">University Program Search Report</CardTitle>
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
                    <span>Powered by Perplexity AI</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearchGoogle}
                className="flex-1 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Search Google
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Report Content with improved spacing */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {parseContentWithStructure(rawContent)}
          </div>
        </CardContent>
      </Card>
      
      {/* Streamlined Verification Notice */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                Verification Required
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                This report provides AI-generated insights from official sources. 
                <strong className="font-semibold"> Always verify all details directly with universities</strong> before applying. 
                Information may change frequently.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 px-2 py-0.5">
                  Check Fees
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 px-2 py-0.5">
                  Verify Deadlines
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 px-2 py-0.5">
                  Confirm Requirements
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Sources Section */}
      {citations.length > 0 && citations.some(citation => citation.title || citation.text) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Sources ({citations.filter(citation => citation.title || citation.text).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {citations
                .filter(citation => citation.title || citation.text)
                .map((citation, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline line-clamp-2 block mb-2 leading-snug"
                    >
                      {citation.title || citation.url}
                    </a>
                    {citation.text && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                        {citation.text}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">{new URL(citation.url).hostname}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
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
