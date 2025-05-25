
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, ExternalLink } from "lucide-react";
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
import { useProgramContext } from "@/contexts/ProgramContext";
import AddProgramDialog from "@/components/program/AddProgramDialog";
import { supabase } from "@/integrations/supabase/client";

interface USUniversityResult {
  name: string;
  location: string;
  ranking?: number;
  tuition?: string;
  acceptanceRate?: string;
  programsOffered?: string[];
  description?: string;
}

const USSearch = () => {
  const { addProgram } = useProgramContext();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<USUniversityResult[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Searching for:', query);
      
      const { data, error } = await supabase.functions.invoke('us-university-search', {
        body: { query: query.trim() }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Search results:', data);
      setSearchResults(data.results || []);
      
      if (data.results && data.results.length > 0) {
        toast.success(`Found ${data.results.length} universities`);
      } else {
        toast.info("No universities found for your search");
      }
      
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search universities. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToShortlist = (result: USUniversityResult) => {
    addProgram({
      programName: result.programsOffered?.[0] || "Program",
      university: result.name,
      degreeType: "Bachelor's", // Default, user can edit
      country: "United States",
      tuition: result.tuition || "",
      deadline: "",
      notes: result.description || "",
      statusTagId: "status-considering",
      customTagIds: [],
    });
  };

  const handleGoogleSearch = (result: USUniversityResult) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(result.name)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">US Universities Search</h1>
          <p className="text-muted-foreground mt-1">
            Search for universities in the United States using Scoreboard API
          </p>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="pt-6 pb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search for US universities (e.g. engineering programs, California universities...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} className="whitespace-nowrap">
              {isLoading ? (
                <>Searching...</>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Search US Universities
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results</h2>
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
                  <GraduationCap className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-lg text-muted-foreground text-center">
                    {query ? "No results found. Try another search." : "Search for US universities to see results"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.ranking && <Badge>#{result.ranking}</Badge>}
                        <Badge variant="outline">United States</Badge>
                        {result.acceptanceRate && (
                          <Badge variant="secondary">{result.acceptanceRate} acceptance</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 md:pb-3">
                    <div className="space-y-2">
                      {result.tuition && (
                        <p className="text-sm">
                          <span className="font-medium">Tuition:</span> {result.tuition}
                        </p>
                      )}
                      {result.programsOffered && result.programsOffered.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.programsOffered.map((program, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {result.description && (
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                      )}
                    </div>
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

export default USSearch;
