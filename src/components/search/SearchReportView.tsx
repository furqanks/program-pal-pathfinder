
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
  ChevronRight,
  MapPin,
  Target,
  Star
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

interface ParsedProgram {
  id: string;
  title: string;
  university: string;
  url?: string;
  details: Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
  }>;
  description?: string;
  highlighted?: boolean;
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  // Enhanced content parsing to extract structured program information
  const parseContentIntoPrograms = (content: string): { programs: ParsedProgram[], sections: string[] } => {
    if (!content) return { programs: [], sections: [] };

    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const programs: ParsedProgram[] = [];
    const sections: string[] = [];
    
    let currentProgram: Partial<ParsedProgram> = {};
    let programCounter = 1;
    let collectingProgramDetails = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for program title with URL pattern
      const programMatch = line.match(/^\[(\d+)\]:\s*\[([^\]]+)\]\s*\(([^)]+)\)/);
      if (programMatch) {
        // Save previous program if exists
        if (currentProgram.title) {
          programs.push({
            id: `program-${programs.length + 1}`,
            title: currentProgram.title,
            university: currentProgram.university || 'University information not available',
            url: currentProgram.url,
            details: currentProgram.details || [],
            description: currentProgram.description,
            highlighted: Math.random() > 0.7 // Randomly highlight some programs
          });
        }

        // Start new program
        currentProgram = {
          title: programMatch[2],
          url: programMatch[3],
          details: []
        };
        collectingProgramDetails = true;
        continue;
      }

      // Check for program details (University:, Tuition:, etc.)
      const detailMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (detailMatch && collectingProgramDetails) {
        const [, label, value] = detailMatch;
        
        const getDetailIcon = (label: string) => {
          const lowerLabel = label.toLowerCase();
          if (lowerLabel.includes('university') || lowerLabel.includes('college')) return <GraduationCap className="h-4 w-4 text-primary" />;
          if (lowerLabel.includes('location') || lowerLabel.includes('country')) return <MapPin className="h-4 w-4 text-blue-600" />;
          if (lowerLabel.includes('tuition') || lowerLabel.includes('fee') || lowerLabel.includes('cost')) return <DollarSign className="h-4 w-4 text-green-600" />;
          if (lowerLabel.includes('deadline') || lowerLabel.includes('application')) return <Calendar className="h-4 w-4 text-red-600" />;
          if (lowerLabel.includes('duration') || lowerLabel.includes('length')) return <Clock className="h-4 w-4 text-purple-600" />;
          if (lowerLabel.includes('requirement') || lowerLabel.includes('criteria')) return <Target className="h-4 w-4 text-orange-600" />;
          return <BookOpen className="h-4 w-4 text-muted-foreground" />;
        };

        currentProgram.details = currentProgram.details || [];
        currentProgram.details.push({
          label: label.trim(),
          value: value.trim(),
          icon: getDetailIcon(label)
        });

        // Extract university name if this is a university field
        if (label.toLowerCase().includes('university') && !currentProgram.university) {
          currentProgram.university = value.trim();
        }
        continue;
      }

      // Check for section headers
      if (line.startsWith('##') || (line.includes('**') && line.length < 100)) {
        collectingProgramDetails = false;
        const cleanHeader = line.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
        sections.push(cleanHeader);
        continue;
      }

      // Check for general content (description or other info)
      if (line.length > 20 && !line.match(/^\[?\d+\]?:/) && collectingProgramDetails) {
        currentProgram.description = (currentProgram.description || '') + ' ' + line;
      } else if (!collectingProgramDetails && line.length > 20) {
        sections.push(line);
      }
    }

    // Don't forget the last program
    if (currentProgram.title) {
      programs.push({
        id: `program-${programs.length + 1}`,
        title: currentProgram.title,
        university: currentProgram.university || 'University information not available',
        url: currentProgram.url,
        details: currentProgram.details || [],
        description: currentProgram.description,
        highlighted: Math.random() > 0.7
      });
    }

    return { programs, sections };
  };

  const { programs, sections } = parseContentIntoPrograms(rawContent);

  const handleSearchGoogle = () => {
    const searchQuery = `${query} university programs official website`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

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
            {part.length > 40 ? `${part.substring(0, 40)}...` : part}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <SearchIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-2">University Program Search Results</CardTitle>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Query:</span> <span className="italic">"{query}"</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>Official sources</span>
                    </div>
                    {programs.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{programs.length} programs found</span>
                      </>
                    )}
                    {citations.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{citations.length} sources</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchGoogle}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Search Google for More
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Program Cards Grid */}
      {programs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Programs</h2>
            <Badge variant="secondary" className="text-xs">
              {programs.length} programs
            </Badge>
          </div>
          
          <div className="grid gap-4 md:gap-6">
            {programs.map((program) => (
              <Card 
                key={program.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  program.highlighted ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Program Header */}
                    <div className="flex items-start gap-3">
                      {program.highlighted && (
                        <div className="p-1 bg-primary/10 rounded-full shrink-0 mt-1">
                          <Star className="h-3 w-3 text-primary fill-current" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
                          {program.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">{program.university}</span>
                        </div>
                      </div>
                    </div>

                    {/* Program Details Grid */}
                    {program.details.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {program.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="shrink-0 mt-0.5">
                              {detail.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground mb-1">
                                {detail.label}
                              </div>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                {formatTextWithLinks(detail.value)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Program Description */}
                    {program.description && (
                      <div className="pt-2">
                        <Separator className="mb-3" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {formatTextWithLinks(program.description.trim())}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    {program.url && (
                      <div className="pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => window.open(program.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Program Page
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Additional Sections */}
      {sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="prose prose-sm max-w-none">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {formatTextWithLinks(section)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Verification Notice */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                Important: Verify All Information
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                This AI-generated report provides insights from official sources. 
                <strong> Always verify details directly with universities</strong> before applying. 
                Information may change frequently.
              </p>
              <div className="flex flex-wrap gap-2">
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

      {/* Sources Section */}
      {citations.length > 0 && citations.some(citation => citation.title || citation.text) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Verified Sources ({citations.filter(citation => citation.title || citation.text).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
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
