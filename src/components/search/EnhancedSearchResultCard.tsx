
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
  Plus,
  ExternalLink,
  Target,
  AlertTriangle
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
        tuition: result.tuition || 'Contact university for fees',
        deadline: result.deadline || 'Check university website',
        statusTagId: 'status-considering',
        customTagIds: [],
        notes: `Added from search results.\n\nProgram Details:\n${result.description}\n\n${
          result.requirements ? `Requirements: ${result.requirements}\n` : ''
        }${
          result.duration ? `Duration: ${result.duration}\n` : ''
        }\n\nIMPORTANT: Always verify all details directly with the university before applying.`,
      });
      toast.success(`${result.programName} added to your shortlist!`);
    } catch (error) {
      toast.error("Failed to add program to shortlist");
    } finally {
      setIsAdding(false);
    }
  };

  const handleGoogleSearch = () => {
    const searchQuery = `"${result.programName}" "${result.university}" ${result.country} official website`
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    window.open(googleUrl, '_blank')
  };

  const handleVisitWebsite = () => {
    if (result.website) {
      window.open(result.website, '_blank');
    } else {
      const searchQuery = `"${result.university}" official website`
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
      window.open(googleUrl, '_blank');
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Check university website';
    
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

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 border">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {result.programName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{result.university}</span>
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
        {/* Basic Program Information */}
        <div className="flex items-center justify-start flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {result.degreeType}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {result.country}
          </Badge>
        </div>

        {/* Fee Information - Display exactly as provided without any categorization */}
        {(result.tuition || result.fees?.range) && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Tuition Fees</div>
                <div className="text-muted-foreground break-words">
                  {result.tuition || result.fees?.range || 'Contact university for current fees'}
                </div>
              </div>
            </div>
            
            {/* Verification Warning */}
            <div className="text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Important:</strong> Fee information may vary by student status (domestic/international), academic year, and other factors. Always verify current fees and available financial aid directly with the university.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 gap-3">
          {result.deadline && (
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Application Deadline</div>
                <div className="text-muted-foreground">{formatDeadline(result.deadline)}</div>
              </div>
            </div>
          )}

          {result.duration && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">{result.duration}</div>
              </div>
            </div>
          )}
        </div>

        {/* Requirements */}
        {result.requirements && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="font-medium text-sm">Entry Requirements</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
              {result.requirements}
            </p>
          </div>
        )}

        {/* Description */}
        {result.description && (
          <div className="space-y-2">
            <Separator />
            <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
              {result.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGoogleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              Google Search
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleVisitWebsite}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          </div>
          
          {/* Data Source Information */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Data sourced via Perplexity AI • Always verify details with the university
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSearchResultCard;
