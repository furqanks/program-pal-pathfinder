
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Badge variant="outline" className="text-xs font-normal shrink-0 bg-primary/10">
                  #{number}
                </Badge>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground mb-3 leading-relaxed">
                    {title}
                  </h3>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Program Page
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Parse program details sections with better formatting
      const programDetailsMatch = trimmedSection.match(/University:\s*([^\n]+)|Program:\s*([^\n]+)|Tuition:\s*([^\n]+)|Deadline:\s*([^\n]+)|Duration:\s*([^\n]+)/);
      if (programDetailsMatch) {
        return (
          <div key={index} className="bg-muted/20 p-6 rounded-lg border mb-6">
            <div className="space-y-4">
              {trimmedSection.split('\n').map((line, lineIndex) => {
                const [label, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                
                if (!value) return null;

                const getIcon = (label: string) => {
                  if (label.toLowerCase().includes('university')) return <GraduationCap className="h-5 w-5 text-primary" />;
                  if (label.toLowerCase().includes('tuition') || label.toLowerCase().includes('fee')) return <DollarSign className="h-5 w-5 text-green-600" />;
                  if (label.toLowerCase().includes('deadline')) return <Calendar className="h-5 w-5 text-red-600" />;
                  if (label.toLowerCase().includes('duration')) return <Clock className="h-5 w-5 text-blue-600" />;
                  return <BookOpen className="h-5 w-5 text-muted-foreground" />;
                };

                return (
                  <div key={lineIndex} className="flex items-start gap-4">
                    {getIcon(label)}
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-foreground mb-1">{label.trim()}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // Check for section headers - improve styling
      const isHeader = trimmedSection.startsWith('##') || 
                     (trimmedSection.includes('**') && trimmedSection.length < 150) ||
                     trimmedSection.match(/^[A-Z][^.!?]*:?\s*$/);
      
      if (isHeader) {
        const cleanHeader = trimmedSection.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
        return (
          <div key={index} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{cleanHeader}</h2>
            </div>
            <Separator className="mb-6" />
          </div>
        );
      }

      // Check for list-like content and format as bullet points
      const isList = trimmedSection.includes('•') || 
                    trimmedSection.split('\n').length > 2 ||
                    trimmedSection.match(/^\d+\./m) ||
                    trimmedSection.match(/^-\s/m);

      if (isList && trimmedSection.length > 100) {
        const lines = trimmedSection.split('\n').filter(line => line.trim());
        return (
          <div key={index} className="mb-6">
            <ul className="space-y-3 list-disc list-inside">
              {lines.map((line, lineIndex) => {
                const cleanLine = line.replace(/^[•\-\d\.]\s*/, '').trim();
                if (!cleanLine) return null;
                
                return (
                  <li key={lineIndex} className="text-sm text-foreground leading-relaxed">
                    {formatTextWithLinks(cleanLine)}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      // Format regular paragraphs
      const formatTextWithLinks = (text: string) => {
        // Parse inline URLs
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
                className="text-primary hover:underline font-medium break-all inline-flex items-center gap-1"
              >
                {part.length > 50 ? `${part.substring(0, 50)}...` : part}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          }
          
          // Format text with bold markers - stronger emphasis
          return part
            .split(/(\*\*[^*]+\*\*)/)
            .map((textPart, textIndex) => {
              if (textPart.startsWith('**') && textPart.endsWith('**')) {
                return (
                  <strong key={textIndex} className="font-bold text-foreground">
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
            <p className="text-sm text-foreground leading-relaxed">
              {formatTextWithLinks(trimmedSection)}
            </p>
          </div>
        </div>
      );
    });
  };

  // Move formatTextWithLinks outside to avoid redefinition
  const formatTextWithLinks = (text: string) => {
    // Parse inline URLs
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
            className="text-primary hover:underline font-medium break-all inline-flex items-center gap-1"
          >
            {part.length > 50 ? `${part.substring(0, 50)}...` : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      // Format text with bold markers - stronger emphasis
      return part
        .split(/(\*\*[^*]+\*\*)/)
        .map((textPart, textIndex) => {
          if (textPart.startsWith('**') && textPart.endsWith('**')) {
            return (
              <strong key={textIndex} className="font-bold text-foreground">
                {textPart.slice(2, -2)}
              </strong>
            );
          }
          return textPart;
        });
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SearchIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">University Program Search Report</h1>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    Comprehensive analysis of: <span className="font-bold italic">"{query}"</span>
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
                <span>Powered by AI Research</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Report Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {parseContentWithStructure(rawContent)}
          </div>
        </CardContent>
      </Card>
      
      {/* Important Verification Notice */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-amber-800 dark:text-amber-200">
                Verification Required
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  This report provides AI-generated insights from official university sources. 
                  <strong className="font-bold"> Always verify all program details, fees, deadlines, and requirements directly with the universities</strong> before making application decisions.
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  University information can change frequently, and admission requirements may vary by student status and academic year.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  <strong>Check Current Fees</strong>
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  <strong>Verify Deadlines</strong>
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  <strong>Confirm Requirements</strong>
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources & Citations */}
      {citations.length > 0 && citations.some(citation => citation.title || citation.text) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-bold">Sources & References ({citations.filter(citation => citation.title || citation.text).length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {citations
                .filter(citation => citation.title || citation.text)
                .map((citation, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:underline line-clamp-2 block mb-2"
                    >
                      {citation.title || citation.url}
                    </a>
                    {citation.text && (
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
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
