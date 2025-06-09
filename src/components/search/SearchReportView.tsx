
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search as SearchIcon, 
  Globe
} from "lucide-react";
import { ProgramCard } from "./ProgramCard";
import { ProgramDetailsSection } from "./ProgramDetailsSection";
import { SectionHeader } from "./SectionHeader";
import { FormattedText } from "./FormattedText";
import { CitationsList } from "./CitationsList";
import { VerificationNotice } from "./VerificationNotice";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  // Enhanced content parsing with better structure recognition
  const parseContentWithStructure = (content: string) => {
    if (!content) return [];

    // Pre-process content to normalize formatting
    const normalizedContent = content
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize multiple line breaks
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace

    // Split content into meaningful sections
    const sections = normalizedContent.split(/\n\s*\n/).filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Check for program listings with enhanced pattern matching
      const programPatterns = [
        /^\[(\d+)\]:\s*\[([^\]]+)\]\s*\(([^)]+)\)/,
        /^(\d+)\.\s*\[([^\]]+)\]\s*\(([^)]+)\)/,
        /^(\d+)\.\s*([^(]+)\s*\(([^)]+)\)/
      ];
      
      for (const pattern of programPatterns) {
        const programMatch = trimmedSection.match(pattern);
        if (programMatch) {
          const [, number, title, url] = programMatch;
          return (
            <ProgramCard
              key={index}
              number={number}
              title={title.trim()}
              url={url.trim()}
              index={index}
            />
          );
        }
      }

      // Enhanced program details detection
      const hasStructuredData = trimmedSection.match(/^(University|Program|Tuition|Deadline|Duration|Requirements|Application|Contact):/mi);
      if (hasStructuredData) {
        return (
          <ProgramDetailsSection
            key={index}
            content={trimmedSection}
            index={index}
          />
        );
      }

      // Enhanced section header detection
      const isMajorHeader = 
        trimmedSection.startsWith('##') || 
        trimmedSection.startsWith('###') ||
        (trimmedSection.includes('**') && 
         trimmedSection.length < 200 && 
         !trimmedSection.includes('\n') &&
         (trimmedSection.match(/^\*\*[^*]+\*\*:?\s*$/) || 
          trimmedSection.match(/^\*\*[A-Z][^*]*\*\*$/)));
      
      if (isMajorHeader) {
        return (
          <SectionHeader
            key={index}
            title={trimmedSection}
            index={index}
          />
        );
      }

      // Enhanced content formatting - pass to FormattedText for processing
      return (
        <div key={index} className="mb-6">
          <FormattedText text={trimmedSection} />
        </div>
      );
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
      <VerificationNotice />

      {/* Sources & Citations */}
      <CitationsList citations={citations} />
    </div>
  );
};

export default SearchReportView;
