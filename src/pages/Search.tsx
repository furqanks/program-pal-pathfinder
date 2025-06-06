
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, X, Info, ExternalLink } from "lucide-react";
import { usePerplexityContext } from "@/contexts/PerplexityContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Search = () => {
  const { searchPrograms, searchResults, isLoading, clearResults, searchMetadata, citations, rawContent } = usePerplexityContext();
  const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState<number>(8);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await searchPrograms(query.trim(), resultCount);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    clearResults();
  };

  // Simple search result card component
  const SearchResultCard = ({ result, index }: { result: any; index: number }) => (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
          {result.programName}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{result.university}</span>
          {result.country && (
            <>
              <span>•</span>
              <span>{result.country}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {result.degreeType && (
            <Badge variant="secondary">{result.degreeType}</Badge>
          )}
          {result.duration && (
            <Badge variant="outline">{result.duration}</Badge>
          )}
        </div>

        {result.tuition && (
          <div className="text-sm">
            <span className="font-medium">Tuition:</span> {result.tuition}
          </div>
        )}

        {result.deadline && (
          <div className="text-sm">
            <span className="font-medium">Deadline:</span> {result.deadline}
          </div>
        )}

        {result.requirements && (
          <div className="text-sm">
            <span className="font-medium">Requirements:</span> {result.requirements}
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">
          {result.description}
        </p>

        <div className="flex gap-2 pt-2">
          {result.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={result.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit University
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const searchQuery = `"${result.programName}" "${result.university}"`
              window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')
            }}
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            Google Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Program Search</h1>
        <p className="text-muted-foreground">
          Search for university programs worldwide with information from official sources
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Search Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Computer Science Masters in UK, MBA programs with scholarships..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SearchIcon className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
              {(searchResults.length > 0 || query) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Results:</span>
                <Select value={resultCount.toString()} onValueChange={(value) => setResultCount(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Search Tips</h4>
                      <p className="text-sm text-muted-foreground">
                        Be specific for better results:
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                        <li>Program field: "Computer Science", "Psychology"</li>
                        <li>Degree level: "Bachelor's", "Master's", "PhD"</li>
                        <li>Location: "UK", "Canada", "Europe"</li>
                        <li>Special requirements: "no GMAT", "scholarships available"</li>
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {searchMetadata && (
                <div className="text-xs text-muted-foreground">
                  <span>Powered by Perplexity AI • </span>
                  {citations.length > 0 && (
                    <span>{citations.length} sources • </span>
                  )}
                  <span>Always verify with universities</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Citations */}
      {citations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Sources & Citations ({citations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {citations.map((citation, index) => (
                <div key={index} className="border rounded p-3 hover:bg-muted/50">
                  <a 
                    href={citation.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline line-clamp-2"
                  >
                    {citation.title || citation.url}
                  </a>
                  {citation.text && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {citation.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Search Results ({searchResults.length} programs)
            </h2>
          </div>

          {searchMetadata?.hasStructuredData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((result, index) => (
                <SearchResultCard key={index} result={result} index={index} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Program Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {rawContent}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> These results are provided directly from Perplexity AI. 
                    Please verify all program details, fees, and requirements directly with the universities 
                    using the source links above.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Searching official university sources...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && searchResults.length === 0 && !query && (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Search University Programs</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Enter keywords to search for university programs worldwide. Results come from official university sources.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Example searches:</strong></p>
              <p>"Computer Science Masters in Canada"</p>
              <p>"MBA programs with GMAT waiver"</p>
              <p>"PhD Psychology programs with funding"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
