
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  ExternalLink, 
  GraduationCap, 
  Users, 
  Award,
  BookOpen,
  Target,
  Plus,
  Languages,
  ClipboardList,
  Building
} from "lucide-react";
import { SearchResult } from "@/contexts/PerplexityContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { toast } from "sonner";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EnhancedSearchResultCardProps {
  result: SearchResult;
}

const EnhancedSearchResultCard = ({ result }: EnhancedSearchResultCardProps) => {
  const { addProgram } = useProgramContext();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToShortlist = async () => {
    setIsAdding(true);
    try {
      await addProgram({
        programName: result.programName,
        university: result.university,
        degreeType: result.degreeType,
        country: result.country,
        // Use the enhanced data instead of hardcoded empty values
        tuition: result.tuition || result.fees?.international || result.fees?.domestic || '',
        deadline: result.deadline || '',
        // Add the missing required properties
        statusTagId: 'status-considering',
        customTagIds: [],
        notes: `Added from search results.\n\nProgram Details:\n${result.description}\n\n${
          result.requirements ? `Requirements: ${result.requirements}\n` : ''
        }${
          result.duration ? `Duration: ${result.duration}\n` : ''
        }${
          result.programDetails?.format ? `Format: ${result.programDetails.format}\n` : ''
        }${
          result.website ? `Website: ${result.website}\n` : ''
        }${
          result.scholarships ? `Scholarships: ${result.scholarships}\n` : ''
        }${
          result.careerOutcomes ? `Career Outcomes: ${result.careerOutcomes}\n` : ''
        }`,
      });
      toast.success(`${result.programName} added to your shortlist!`);
    } catch (error) {
      toast.error("Failed to add program to shortlist");
    } finally {
      setIsAdding(false);
    }
  };

  // Helper function to format application deadlines nicely
  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Not specified';
    
    if (deadline.toLowerCase().includes('rolling')) {
      return 'Rolling Admissions';
    }
    
    // Try to parse the date, if it's a valid date format
    try {
      const date = new Date(deadline);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }).format(date);
      }
    } catch (e) {
      // If parsing fails, just return the original string
    }
    
    return deadline;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {result.programName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              {result.university}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAddToShortlist}
                  disabled={isAdding}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isAdding ? "Adding..." : "Add"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to your program shortlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info Row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {result.degreeType}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {result.country}
          </Badge>
          {result.programDetails?.format && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {result.programDetails.format}
            </Badge>
          )}
          {result.programDetails?.language && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Languages className="h-3 w-3" />
              {result.programDetails.language}
            </Badge>
          )}
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.tuition && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">Tuition</div>
                <div className="text-muted-foreground">{result.tuition}</div>
              </div>
            </div>
          )}

          {result.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-red-600" />
              <div>
                <div className="font-medium">Deadline</div>
                <div className="text-muted-foreground">{formatDeadline(result.deadline)}</div>
              </div>
            </div>
          )}

          {result.duration && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">{result.duration}</div>
              </div>
            </div>
          )}

          {result.ranking && (
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="font-medium">Ranking</div>
                <div className="text-muted-foreground">{result.ranking}</div>
              </div>
            </div>
          )}

          {result.programDetails?.startDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <div className="font-medium">Start Date</div>
                <div className="text-muted-foreground">{result.programDetails.startDate}</div>
              </div>
            </div>
          )}

          {result.programDetails?.accreditation && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-indigo-600" />
              <div>
                <div className="font-medium">Accreditation</div>
                <div className="text-muted-foreground">{result.programDetails.accreditation}</div>
              </div>
            </div>
          )}

          {result.applicationProcess && (
            <div className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4 text-teal-600" />
              <div>
                <div className="font-medium">Application</div>
                <div className="text-muted-foreground line-clamp-1">{result.applicationProcess}</div>
              </div>
            </div>
          )}
        </div>

        {/* Requirements */}
        {result.requirements && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm">Requirements</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {result.requirements}
            </p>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Separator />
          <p className="text-sm text-muted-foreground line-clamp-3">
            {result.description}
          </p>
        </div>

        {/* Additional Information */}
        {(result.scholarships || result.careerOutcomes) && (
          <div className="space-y-2">
            <Separator />
            {result.scholarships && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Scholarships:</span> {result.scholarships}
              </div>
            )}
            {result.careerOutcomes && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Career Outcomes:</span> {result.careerOutcomes}
              </div>
            )}
          </div>
        )}

        {/* Website Link */}
        {result.website && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(result.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Program Website
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSearchResultCard;
