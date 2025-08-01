
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SearchReportHeader from "@/components/search/SearchReportHeader";
import SearchReportContent from "@/components/search/SearchReportContent";
import SearchReportSources from "@/components/search/SearchReportSources";

const UpdatedSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [citations, setCitations] = useState([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting updated search with query:', searchQuery);
      
      const { data, error } = await supabase.functions.invoke('updated-search', {
        body: { query: searchQuery },
      });

      if (error) {
        console.error('Updated search error:', error);
        throw new Error(error.message || 'Error searching programs');
      }

      console.log('Updated search response:', data);

      if (data?.results) {
        setSearchResults(data.results);
        setCitations(data.citations || []);
        toast.success("Search completed successfully");
      } else {
        throw new Error('No results received from search');
      }
    } catch (error) {
      console.error("Updated search error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to search programs. Please try again.');
      setSearchResults("");
      setCitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults("");
    setCitations([]);
  };

  const handleSearchGoogle = () => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + " university programs")}`;
    window.open(googleSearchUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-foreground">Updated Search</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find university programs with official information from verified sources
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <SearchIcon className="h-5 w-5 text-primary" />
              Search University Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Input
                  placeholder="e.g., Computer Science Masters in UK, Psychology PhD programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !searchQuery.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SearchIcon className="h-4 w-4" />
                    )}
                  </Button>
                  {searchResults && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClear}
                      className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Searching official university sources...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResults && !isLoading && (
          <div className="space-y-6">
            <SearchReportHeader 
              query={searchQuery}
              citations={citations}
              onSearchGoogle={handleSearchGoogle}
            />
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <SearchReportContent rawContent={searchResults} query={searchQuery} />
              </CardContent>
            </Card>
            
            {citations.length > 0 && (
              <SearchReportSources citations={citations} />
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !searchResults && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 text-card-foreground">Search University Programs</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Enter your search criteria above to find university programs from official sources.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Information from official university websites only</p>
                <p>• At least 10 program options per search</p>
                <p>• Verified and up-to-date information</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpdatedSearch;
