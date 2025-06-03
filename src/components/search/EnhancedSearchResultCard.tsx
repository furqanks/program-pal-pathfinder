
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Search,
  GraduationCap, 
  Users, 
  Award,
  BookOpen,
  Target,
  Plus,
  Languages,
  Building,
  TrendingUp
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
        tuition: result.tuition || result.fees?.international || result.fees?.domestic || '',
        deadline: result.deadline || '',
        statusTagId: 'status-considering',
        customTagIds: [],
        notes: `Added from search results.\n\nProgram Details:\n${result.description}\n\n${
          result.requirements ? `Requirements: ${result.requirements}\n` : ''
        }${
          result.duration ? `Duration: ${result.duration}\n` : ''
        }${
          result.programDetails?.format ? `Format: ${result.programDetails.format}\n` : ''
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

  const handleGoogleSearch = () => {
    const searchQuery = `"${result.programName}" "${result.university}" ${result.country} admissions 2025`
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    window.open(googleUrl, '_blank')
  };

  // Helper function to format application deadlines nicely
  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Not specified';
    
    if (deadline.toLowerCase().includes('rolling')) {
      return 'Rolling Admissions';
    }
    
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
      // If parsing fails, return the original string
    }
    
    return deadline;
  };

  // Get confidence level styling
  const getConfidenceBadge = () => {
    const confidence = (result as any).confidenceScore || 50;
    const quality = (result as any).dataQuality || 'moderate';
    
    if (confidence >= 80) return { variant: "default" as const, text: "High Confidence", color: "text-green-600" };
    if (confidence >= 60) return { variant: "secondary" as const, text: "Good Data", color: "text-blue-600" };
    if (confidence >= 40) return { variant: "outline" as const, text: "Verify Details", color: "text-amber-600" };
    return { variant: "outline" as const, text: "Needs Verification", color: "text-red-600" };
  };

  const confidenceBadge = getConfidenceBadge();

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
        {/* Data Quality Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {result.degreeType}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {result.country}
            </Badge>
          </div>
          <Badge variant={confidenceBadge.variant} className={`flex items-center gap-1 ${confidenceBadge.color}`}>
            <TrendingUp className="h-3 w-3" />
            {confidenceBadge.text}
          </Badge>
        </div>

        {/* Additional Format/Language Badges */}
        {(result.programDetails?.format || result.programDetails?.language) && (
          <div className="flex flex-wrap gap-2">
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
        )}

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

        {/* Google Search Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleGoogleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Verify on Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSearchResultCard;
