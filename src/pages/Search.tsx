
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Plus, ExternalLink, Info } from "lucide-react";
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
    addProgram({
      programName: result.programName,
      university: result.university,
      degreeType: result.degreeType,
      country: result.country,
      tuition: "",
      deadline: "",
      notes: result.description,
      statusTagId: "status-considering",
      customTagIds: [],
    });
  };
  
  const handleGoogleSearch = (result: SearchResult) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`${result.programName} ${result.university}`)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Program Search</h1>
        <p className="text-muted-foreground mt-1">
          Search for academic programs powered by Perplexity AI
        </p>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="pt-6 pb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search for programs (e.g. Computer Science, Data Science...)"
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
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{result.programName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.university}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{result.degreeType}</Badge>
                        <Badge variant="outline">{result.country}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 md:pb-3">
                    <p className="text-sm">{result.description}</p>
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
