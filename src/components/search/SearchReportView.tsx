
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
          <ProgramCard
            key={index}
            number={number}
            title={title}
            url={url}
            index={index}
          />
        );
      }

      // Parse program details sections with better formatting
      const programDetailsMatch = trimmedSection.match(/University:\s*([^\n]+)|Program:\s*([^\n]+)|Tuition:\s*([^\n]+)|Deadline:\s*([^\n]+)|Duration:\s*([^\n]+)/);
      if (programDetailsMatch) {
        return (
          <ProgramDetailsSection
            key={index}
            content={trimmedSection}
            index={index}
          />
        );
      }

      // Check for section headers - improve styling
      const isHeader = trimmedSection.startsWith('##') || 
                     (trimmedSection.includes('**') && trimmedSection.length < 150) ||
                     trimmedSection.match(/^[A-Z][^.!?]*:?\s*$/);
      
      if (isHeader) {
        return (
          <SectionHeader
            key={index}
            title={trimmedSection}
            index={index}
          />
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
                    <FormattedText text={cleanLine} />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      // Format regular paragraphs
      return (
        <div key={index} className="mb-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-foreground leading-relaxed">
              <FormattedText text={trimmedSection} />
            </p>
          </div>
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
