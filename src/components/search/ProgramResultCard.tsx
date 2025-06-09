
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  GraduationCap,
  ExternalLink,
  Target,
  Plus
} from "lucide-react";

interface ProgramResultCardProps {
  programData: {
    number?: string;
    title: string;
    university?: string;
    location?: string;
    degreeLevel?: string;
    duration?: string;
    tuitionFees?: string;
    applicationDeadline?: string;
    entryRequirements?: string;
    programHighlights?: string;
    url?: string;
  };
  onAddToShortlist?: () => void;
}

export const ProgramResultCard = ({ programData, onAddToShortlist }: ProgramResultCardProps) => {
  const handleGoogleSearch = () => {
    const searchQuery = `"${programData.title}" "${programData.university}" official website`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleUrl, '_blank');
  };

  const handleVisitWebsite = () => {
    if (programData.url) {
      window.open(programData.url, '_blank');
    } else {
      handleGoogleSearch();
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              {programData.number && (
                <Badge variant="outline" className="text-xs font-normal shrink-0 bg-primary/10">
                  #{programData.number}
                </Badge>
              )}
              <CardTitle className="text-lg font-bold line-clamp-2 leading-tight">
                {programData.title}
              </CardTitle>
            </div>
            
            {programData.university && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{programData.university}</span>
              </div>
            )}
          </div>
          
          {onAddToShortlist && (
            <Button onClick={onAddToShortlist} size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Information Badges */}
        <div className="flex items-center justify-start flex-wrap gap-2">
          {programData.degreeLevel && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {programData.degreeLevel}
            </Badge>
          )}
          {programData.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {programData.location}
            </Badge>
          )}
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 gap-3">
          {programData.duration && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">{programData.duration}</div>
              </div>
            </div>
          )}

          {programData.tuitionFees && (
            <div className="flex items-start gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Tuition Fees</div>
                <div className="text-muted-foreground">{programData.tuitionFees}</div>
              </div>
            </div>
          )}

          {programData.applicationDeadline && (
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Application Deadline</div>
                <div className="text-muted-foreground">{programData.applicationDeadline}</div>
              </div>
            </div>
          )}
        </div>

        {/* Entry Requirements */}
        {programData.entryRequirements && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="font-medium text-sm">Entry Requirements</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
              {programData.entryRequirements}
            </p>
          </div>
        )}

        {/* Program Highlights */}
        {programData.programHighlights && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Program Highlights</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {programData.programHighlights}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleGoogleSearch}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Search
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleVisitWebsite}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
