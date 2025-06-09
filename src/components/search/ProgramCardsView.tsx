
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Globe } from "lucide-react";
import { ProgramResultCard } from "./ProgramResultCard";
import { CitationsList } from "./CitationsList";
import { VerificationNotice } from "./VerificationNotice";
import { parseProgramsFromContent } from "./ProgramDataParser";
import { useProgramContext } from "@/contexts/ProgramContext";
import { toast } from "sonner";

interface ProgramCardsViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

export const ProgramCardsView = ({ rawContent, query, citations }: ProgramCardsViewProps) => {
  const { addProgram } = useProgramContext();
  const programs = parseProgramsFromContent(rawContent);

  const handleAddToShortlist = async (program: any) => {
    try {
      await addProgram({
        programName: program.title,
        university: program.university || 'University not specified',
        degreeType: program.degreeLevel || 'Degree level not specified',
        country: program.location || 'Location not specified',
        tuition: program.tuitionFees || 'Contact university for fees',
        deadline: program.applicationDeadline || 'Check university website',
        statusTagId: 'status-considering',
        customTagIds: [],
        notes: `Added from search results.\n\nProgram Details:\n${
          program.programHighlights ? `Highlights: ${program.programHighlights}\n` : ''
        }${
          program.entryRequirements ? `Requirements: ${program.entryRequirements}\n` : ''
        }${
          program.duration ? `Duration: ${program.duration}\n` : ''
        }\n\nIMPORTANT: Always verify all details directly with the university before applying.`,
      });
      toast.success(`${program.title} added to your shortlist!`);
    } catch (error) {
      toast.error("Failed to add program to shortlist");
    }
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
                  <h1 className="text-xl font-bold">University Program Search Results</h1>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    Search results for: <span className="font-bold italic">"{query}"</span>
                  </p>
                </div>
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>Sourced from official university websites</span>
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

      {/* Programs Grid */}
      {programs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Available Programs ({programs.length})
            </h2>
            <Badge variant="secondary">
              {citations.length} sources referenced
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.map((program, index) => (
              <ProgramResultCard
                key={index}
                programData={program}
                onAddToShortlist={() => handleAddToShortlist(program)}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No structured program data found in the search results. The content will be displayed in report format.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Verification Notice */}
      <VerificationNotice />

      {/* Sources & Citations */}
      <CitationsList citations={citations} />
    </div>
  );
};
