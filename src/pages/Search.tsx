
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Plus, ExternalLink, Info, Clock, DollarSign, Calendar, Globe, GraduationCap, FileText } from "lucide-react";
import { usePerplexityContext, SearchResult } from "@/contexts/PerplexityContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import AddProgramDialog from "@/components/program/AddProgramDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const Search = () => {
  const { searchPrograms, searchResults, isLoading } = usePerplexityContext();
  const { addProgram, isLocalMode } = useProgramContext();
  const [query, setQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    searchPrograms(query);
  };
  
  const handleAddToShortlist = (result: SearchResult) => {
    // Extract structured data for intelligent program addition
    const tuitionInfo = result.tuition || result.fees?.international || result.fees?.domestic || "";
    const deadlineInfo = result.deadline || result.applicationDeadline || "";
    
    addProgram({
      programName: result.programName,
      university: result.university,
      degreeType: result.degreeType,
      country: result.country,
      tuition: tuitionInfo,
      deadline: deadlineInfo,
      notes: result.description,
      statusTagId: "status-considering",
      customTagIds: [],
    });
    
    toast.success("Program added with detailed information!");
  };
  
  const handleGoogleSearch = (result: SearchResult) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`${result.programName} ${result.university}`)}`, "_blank");
  };

  const formatFeeInfo = (result: SearchResult) => {
    if (result.fees) {
      return Object.entries(result.fees)
        .filter(([_, value]) => value)
        .map(([type, value]) => `${type}: ${value}`)
        .join(" | ");
    }
    return result.tuition || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Program Search</h1>
        <p className="text-muted-foreground mt-1">
          Search for academic programs with detailed information powered by Perplexity AI
        </p>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="pt-6 pb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search for programs (e.g. Computer Science, Data Science, affordable MBA...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} className="whitespace-nowrap">
              {isLoading ? (
                <>Searching...</>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search Programs
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Search Results</h2>
            {isLocalMode && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help">
                      <Info className="h-3 w-3 mr-1" /> Local Mode
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Programs are being saved locally because there was an issue connecting to the database. Data will be stored in your browser.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Manually
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {searchResults.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-40 p-6">
                  <SearchIcon className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-lg text-muted-foreground text-center">
                    {query ? "No results found. Try another search." : "Search for programs to see results"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{result.programName}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {result.university} • {result.country}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{result.degreeType}</Badge>
                        <Badge variant="outline">{result.country}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Program Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Cost Information */}
                      {(result.tuition || result.fees) && (
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Tuition
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatFeeInfo(result)}
                          </p>
                        </div>
                      )}
                      
                      {/* Duration & Deadlines */}
                      <div className="space-y-2">
                        {result.duration && (
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Duration
                            </h4>
                            <p className="text-sm text-muted-foreground">{result.duration}</p>
                          </div>
                        )}
                        
                        {(result.deadline || result.applicationDeadline) && (
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Deadline
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {result.deadline || result.applicationDeadline}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Program Format */}
                      {result.programDetails && (
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            Format
                          </h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {result.programDetails.format && (
                              <p>{result.programDetails.format}</p>
                            )}
                            {result.programDetails.credits && (
                              <p>{result.programDetails.credits}</p>
                            )}
                            {result.programDetails.startDate && (
                              <p>Starts: {result.programDetails.startDate}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Description */}
                    <div>
                      <p className="text-sm">{result.description}</p>
                    </div>
                    
                    {/* Requirements */}
                    {(result.requirements || result.admissionRequirements) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Requirements
                          </h4>
                          {result.admissionRequirements ? (
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {result.admissionRequirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-xs">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">{result.requirements}</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* Website */}
                    {result.website && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Website</h4>
                        <a 
                          href={result.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {result.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleGoogleSearch(result)}
                      className="w-full sm:w-auto"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Search on Google
                    </Button>
                    <Button 
                      onClick={() => handleAddToShortlist(result)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Save to Shortlist
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <AddProgramDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
};

export default Search;
