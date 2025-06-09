
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
  Star,
  Plus,
  CheckCircle
} from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { toast } from "sonner";
import { useState } from "react";

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
  location?: string;
  tuition?: string;
  deadline?: string;
  duration?: string;
  requirements?: string;
  degreeType?: string;
  description?: string;
  highlighted?: boolean;
}

interface ParsedSection {
  type: 'overview' | 'programs' | 'insights' | 'considerations' | 'other';
  title: string;
  content: string;
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  const { addProgram } = useProgramContext();
  const [addingPrograms, setAddingPrograms] = useState<Set<string>>(new Set());

  // Enhanced content parsing with multiple strategies
  const parseContent = (content: string): { programs: ParsedProgram[], sections: ParsedSection[] } => {
    if (!content) return { programs: [], sections: [] };

    const programs: ParsedProgram[] = [];
    const sections: ParsedSection[] = [];
    
    // Split content into lines and clean up
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentSection = '';
    let currentSectionContent: string[] = [];
    let inProgramSection = false;
    let currentProgram: Partial<ParsedProgram> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect section headers (## or **bold**)
      if (line.startsWith('##') || (line.includes('**') && line.length < 100)) {
        // Save previous section
        if (currentSection && currentSectionContent.length > 0) {
          sections.push({
            type: getSectionType(currentSection),
            title: currentSection,
            content: currentSectionContent.join('\n')
          });
        }
        
        // Start new section
        currentSection = line.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
        currentSectionContent = [];
        inProgramSection = currentSection.toLowerCase().includes('program') || 
                          currentSection.toLowerCase().includes('available') ||
                          currentSection.toLowerCase().includes('options');
        continue;
      }
      
      // Parse program information in program sections
      if (inProgramSection) {
        const programData = extractProgramFromLine(line, lines, i);
        if (programData) {
          programs.push({
            id: `program-${programs.length + 1}`,
            ...programData,
            highlighted: Math.random() > 0.6 // Random highlighting
          });
          continue;
        }
      }
      
      // Add to current section content
      if (line.length > 0 && !line.match(/^\[?\d+\]?:/)) {
        currentSectionContent.push(line);
      }
    }
    
    // Don't forget the last section
    if (currentSection && currentSectionContent.length > 0) {
      sections.push({
        type: getSectionType(currentSection),
        title: currentSection,
        content: currentSectionContent.join('\n')
      });
    }
    
    return { programs, sections };
  };

  const extractProgramFromLine = (line: string, allLines: string[], index: number): Partial<ParsedProgram> | null => {
    // Strategy 1: Look for markdown links with program titles
    const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch[1].length > 10) {
      const title = linkMatch[1];
      const url = linkMatch[2];
      
      // Look ahead for additional details
      const details = extractProgramDetails(allLines, index + 1);
      
      return {
        title,
        url,
        university: extractUniversity(title, details),
        ...details
      };
    }
    
    // Strategy 2: Look for numbered program entries
    const numberedMatch = line.match(/^\d+\.\s*(.+?)(?:\s*-\s*(.+))?$/);
    if (numberedMatch && numberedMatch[1].length > 10) {
      const title = numberedMatch[1];
      const subtitle = numberedMatch[2];
      
      const details = extractProgramDetails(allLines, index + 1);
      
      return {
        title,
        university: subtitle || extractUniversity(title, details),
        ...details
      };
    }
    
    // Strategy 3: Look for bold program names
    const boldMatch = line.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch[1].length > 10 && !boldMatch[1].includes(':')) {
      const title = boldMatch[1];
      const details = extractProgramDetails(allLines, index + 1);
      
      return {
        title,
        university: extractUniversity(title, details),
        ...details
      };
    }
    
    return null;
  };

  const extractProgramDetails = (lines: string[], startIndex: number): Partial<ParsedProgram> => {
    const details: Partial<ParsedProgram> = {};
    const lookAhead = 8; // Look at next few lines
    
    for (let i = startIndex; i < Math.min(startIndex + lookAhead, lines.length); i++) {
      const line = lines[i];
      
      // Stop at next program or section
      if (line.match(/^\d+\./) || line.startsWith('##') || line.includes('**')) break;
      
      // Extract specific details
      if (line.toLowerCase().includes('university:') || line.toLowerCase().includes('institution:')) {
        details.university = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('location:') || line.toLowerCase().includes('country:')) {
        details.location = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('tuition:') || line.toLowerCase().includes('fees:')) {
        details.tuition = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('deadline:') || line.toLowerCase().includes('application:')) {
        details.deadline = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('duration:') || line.toLowerCase().includes('length:')) {
        details.duration = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('requirements:') || line.toLowerCase().includes('entry:')) {
        details.requirements = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('degree:') || line.toLowerCase().includes('level:')) {
        details.degreeType = line.split(':')[1]?.trim();
      } else if (line.length > 20 && !line.includes(':') && !details.description) {
        details.description = line;
      }
    }
    
    return details;
  };

  const extractUniversity = (title: string, details: Partial<ParsedProgram>): string => {
    if (details.university) return details.university;
    
    // Try to extract university name from title
    const patterns = [
      /at\s+([^,]+)/i,
      /\-\s*([^,]+)\s*$/,
      /,\s*([^,]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'University information not available';
  };

  const getSectionType = (title: string): ParsedSection['type'] => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('overview') || lowerTitle.includes('summary')) return 'overview';
    if (lowerTitle.includes('program') || lowerTitle.includes('available')) return 'programs';
    if (lowerTitle.includes('insight') || lowerTitle.includes('analysis')) return 'insights';
    if (lowerTitle.includes('consideration') || lowerTitle.includes('application')) return 'considerations';
    return 'other';
  };

  const { programs, sections } = parseContent(rawContent);

  const handleAddToShortlist = async (program: ParsedProgram) => {
    setAddingPrograms(prev => new Set(prev).add(program.id));
    
    try {
      await addProgram({
        programName: program.title,
        university: program.university,
        degreeType: program.degreeType || 'Not specified',
        country: program.location || 'Location not specified',
        tuition: program.tuition || 'Contact university for fees',
        deadline: program.deadline || 'Check university website',
        statusTagId: 'status-considering',
        customTagIds: [],
        notes: `Added from search results.\n\nProgram Details:\n${program.description || 'No description available'}\n\n${
          program.requirements ? `Requirements: ${program.requirements}\n` : ''
        }${
          program.duration ? `Duration: ${program.duration}\n` : ''
        }\n\nIMPORTANT: Always verify all details directly with the university before applying.`
      });
      
      toast.success(`${program.title} added to your shortlist!`);
    } catch (error) {
      toast.error("Failed to add program to shortlist");
    } finally {
      setAddingPrograms(prev => {
        const newSet = new Set(prev);
        newSet.delete(program.id);
        return newSet;
      });
    }
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
            {part.length > 50 ? `${part.substring(0, 50)}...` : part}
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
          </div>
        </CardHeader>
      </Card>

      {/* Program Cards - Enhanced Design */}
      {programs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Featured Programs
            </h2>
            <Badge variant="secondary" className="text-xs">
              {programs.length} programs
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {programs.map((program) => (
              <Card 
                key={program.id} 
                className={`transition-all duration-200 hover:shadow-lg border ${
                  program.highlighted ? 'ring-2 ring-primary/30 bg-gradient-to-r from-primary/5 to-transparent border-primary/30' : 'hover:border-primary/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {/* Program Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          {program.highlighted && (
                            <div className="p-1 bg-primary/10 rounded-full shrink-0 mt-1">
                              <Star className="h-3 w-3 text-primary fill-current" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
                              {program.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <GraduationCap className="h-4 w-4" />
                              <span className="font-medium">{program.university}</span>
                              {program.location && (
                                <>
                                  <span>•</span>
                                  <MapPin className="h-3 w-3" />
                                  <span>{program.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Degree Type Badge */}
                        {program.degreeType && (
                          <Badge variant="outline" className="mb-3">
                            {program.degreeType}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Add to Shortlist Button */}
                      <Button
                        onClick={() => handleAddToShortlist(program)}
                        disabled={addingPrograms.has(program.id)}
                        size="sm"
                        className="shrink-0"
                      >
                        {addingPrograms.has(program.id) ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {addingPrograms.has(program.id) ? "Adding..." : "Add to Shortlist"}
                      </Button>
                    </div>

                    {/* Program Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {program.tuition && (
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground mb-1">Tuition Fees</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTextWithLinks(program.tuition)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {program.deadline && (
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Calendar className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground mb-1">Application Deadline</div>
                            <div className="text-sm text-muted-foreground">{program.deadline}</div>
                          </div>
                        </div>
                      )}
                      
                      {program.duration && (
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground mb-1">Duration</div>
                            <div className="text-sm text-muted-foreground">{program.duration}</div>
                          </div>
                        </div>
                      )}
                      
                      {program.requirements && (
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground mb-1">Entry Requirements</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {formatTextWithLinks(program.requirements)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Program Description */}
                    {program.description && (
                      <div className="pt-2">
                        <Separator className="mb-3" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {formatTextWithLinks(program.description)}
                        </p>
                      </div>
                    )}

                    {/* Visit Program Button */}
                    {program.url && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
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

      {/* Content Sections */}
      {sections.length > 0 && (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {section.type === 'overview' && <Info className="h-4 w-4" />}
                  {section.type === 'insights' && <BookOpen className="h-4 w-4" />}
                  {section.type === 'considerations' && <AlertTriangle className="h-4 w-4" />}
                  {section.type === 'other' && <FileText className="h-4 w-4" />}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {formatTextWithLinks(section.content)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
