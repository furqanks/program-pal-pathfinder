
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
  extendedData?: {
    ownership: string;
    isMainCampus: boolean;
    religiousAffiliation: string | null;
    menOnly: boolean;
    womenOnly: boolean;
    costs: {
      avgNetPrice: string | null;
      totalAttendanceCost: string | null;
    };
    admissions: {
      satScore: number | null;
      actScore: number | null;
    };
    demographics: {
      menPercentage: string | null;
      womenPercentage: string | null;
      diversity: {
        white: string | null;
        black: string | null;
        hispanic: string | null;
        asian: string | null;
      };
    };
    degreeTypes: string[];
    programPercentages: Array<{
      program: string;
      percentage: string;
    }>;
    outcomes: {
      medianEarnings: string | null;
      defaultRate: string | null;
      completionRate: string | null;
    };
  };
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">US Universities Search</h1>
            <p className="text-muted-foreground mt-1">
              Search for universities in the United States using Scoreboard API
            </p>
          </div>
        </div>
      
        <Card className="overflow-hidden bg-card border-border">
          <CardContent className="pt-6 pb-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search for US universities (e.g. engineering programs, California universities...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90"
              >
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
            <h2 className="text-xl font-semibold text-foreground">Search Results</h2>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(true)}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
          </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-2/3 bg-muted" />
                  <Skeleton className="h-4 w-1/3 mt-2 bg-muted" />
                </CardHeader>
                <CardContent className="pb-2">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-5/6 mt-2 bg-muted" />
                  <Skeleton className="h-4 w-2/3 mt-2 bg-muted" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full bg-muted" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {searchResults.length === 0 ? (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center h-40 p-6">
                  <GraduationCap className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-lg text-muted-foreground text-center">
                    {query ? "No results found. Try another search." : "Search for US universities to see results"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((result, index) => (
                <Card key={index} className="overflow-hidden bg-card border-border">
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg text-card-foreground">{result.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.location}
                        </p>
                        {result.extendedData && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.extendedData.ownership}
                            </Badge>
                            {result.extendedData.isMainCampus && (
                              <Badge variant="outline" className="text-xs">Main Campus</Badge>
                            )}
                            {result.extendedData.menOnly && (
                              <Badge variant="outline" className="text-xs">Men Only</Badge>
                            )}
                            {result.extendedData.womenOnly && (
                              <Badge variant="outline" className="text-xs">Women Only</Badge>
                            )}
                            {result.extendedData.religiousAffiliation && (
                              <Badge variant="outline" className="text-xs">Religious</Badge>
                            )}
                          </div>
                        )}
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
                    <div className="space-y-3">
                       {/* Costs Section */}
                       <div>
                         <h4 className="font-medium text-sm mb-1 text-card-foreground">Costs</h4>
                         <div className="text-sm space-y-1 text-muted-foreground">
                           {result.tuition && (
                             <p><span className="font-medium text-card-foreground">Tuition:</span> {result.tuition}</p>
                           )}
                           {result.extendedData?.costs.avgNetPrice && (
                             <p><span className="font-medium text-card-foreground">Average Net Price:</span> {result.extendedData.costs.avgNetPrice}</p>
                           )}
                           {result.extendedData?.costs.totalAttendanceCost && (
                             <p><span className="font-medium text-card-foreground">Total Cost of Attendance:</span> {result.extendedData.costs.totalAttendanceCost}</p>
                           )}
                         </div>
                       </div>

                       {/* Admissions Section */}
                       {result.extendedData?.admissions && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Admissions</h4>
                           <div className="text-sm space-y-1 text-muted-foreground">
                             {result.acceptanceRate && (
                               <p><span className="font-medium text-card-foreground">Acceptance Rate:</span> {result.acceptanceRate}</p>
                             )}
                             {result.extendedData.admissions.satScore && (
                               <p><span className="font-medium text-card-foreground">Average SAT:</span> {result.extendedData.admissions.satScore}</p>
                             )}
                             {result.extendedData.admissions.actScore && (
                               <p><span className="font-medium text-card-foreground">Average ACT:</span> {result.extendedData.admissions.actScore}</p>
                             )}
                           </div>
                         </div>
                       )}

                       {/* Student Body Section */}
                       {result.extendedData?.demographics && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Student Body</h4>
                           <div className="text-sm space-y-1 text-muted-foreground">
                             <p><span className="font-medium text-card-foreground">Enrollment:</span> {result.description?.split('.')[0] || 'N/A'}</p>
                             {result.extendedData.demographics.menPercentage && result.extendedData.demographics.womenPercentage && (
                               <p><span className="font-medium text-card-foreground">Gender:</span> {result.extendedData.demographics.menPercentage} men, {result.extendedData.demographics.womenPercentage} women</p>
                             )}
                           </div>
                         </div>
                       )}

                       {/* Programs Section */}
                       {result.extendedData?.degreeTypes && result.extendedData.degreeTypes.length > 0 && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Degree Types Available</h4>
                           <div className="flex flex-wrap gap-1">
                             {result.extendedData.degreeTypes.map((degree, idx) => (
                               <Badge key={idx} variant="outline" className="text-xs">
                                 {degree}
                               </Badge>
                             ))}
                           </div>
                         </div>
                       )}

                       {result.programsOffered && result.programsOffered.length > 0 && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Popular Programs</h4>
                           <div className="flex flex-wrap gap-1">
                             {result.programsOffered.map((program, idx) => (
                               <Badge key={idx} variant="outline" className="text-xs">
                                 {program}
                               </Badge>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Program Percentages */}
                       {result.extendedData?.programPercentages && result.extendedData.programPercentages.length > 0 && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Program Distribution</h4>
                           <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                             {result.extendedData.programPercentages.slice(0, 6).map((prog, idx) => (
                               <div key={idx} className="flex justify-between">
                                 <span>{prog.program}:</span>
                                 <span>{prog.percentage}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Outcomes Section */}
                       {result.extendedData?.outcomes && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Outcomes</h4>
                           <div className="text-sm space-y-1 text-muted-foreground">
                             {result.extendedData.outcomes.medianEarnings && (
                               <p><span className="font-medium text-card-foreground">Median Earnings (10 years):</span> {result.extendedData.outcomes.medianEarnings}</p>
                             )}
                             {result.extendedData.outcomes.completionRate && (
                               <p><span className="font-medium text-card-foreground">4-Year Completion Rate:</span> {result.extendedData.outcomes.completionRate}</p>
                             )}
                             {result.extendedData.outcomes.defaultRate && (
                               <p><span className="font-medium text-card-foreground">3-Year Default Rate:</span> {result.extendedData.outcomes.defaultRate}</p>
                             )}
                           </div>
                         </div>
                       )}

                       {/* Website */}
                       {result.description?.includes('Website:') && (
                         <div>
                           <h4 className="font-medium text-sm mb-1 text-card-foreground">Website</h4>
                           <p className="text-sm text-muted-foreground">
                             {result.description.split('Website: ')[1]}
                           </p>
                         </div>
                       )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleGoogleSearch(result)}
                      className="w-full sm:w-auto border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Search on Google
                    </Button>
                    <Button 
                      onClick={() => handleAddToShortlist(result)}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
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
    </div>
  );
};

export default USSearch;
