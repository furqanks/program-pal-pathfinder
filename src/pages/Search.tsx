import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, X, Info, ExternalLink } from "lucide-react";
import { usePerplexityContext } from "@/contexts/PerplexityContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EnhancedSearchResultCard from "@/components/search/EnhancedSearchResultCard";

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

  // Helper function to format raw content for better display
  const formatRawContent = (content: string) => {
    if (!content) return "";
    
    // Split content into sections and format
    return content
      .split('\n\n')
      .map(section => section.trim())
      .filter(section => section.length > 0)
      .map((section, index) => {
        // Check if section is a heading (starts with ## or has **bold** patterns)
        if (section.startsWith('##') || section.includes('**')) {
          return (
            <div key={index} className="mb-4">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: section
                    .replace(/##\s*(.*)/g, '<h3 class="text-lg font-semibold text-foreground mb-2 mt-4">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-foreground">$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
          );
        }
        
        // Regular paragraph content
        return (
          <div key={index} className="mb-3">
            <p 
              className="text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: section
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-foreground">$1</strong>')
                  .replace(/\n/g, '<br />')
              }}
            />
          </div>
        );
      });
  };

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
                <EnhancedSearchResultCard key={index} result={result} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="h-5 w-5" />
                  Program Search Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border">
                  <div className="formatted-content space-y-3">
                    {formatRawContent(rawContent)}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Important Verification Notice
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                        These results are provided directly from Perplexity AI and may not reflect the most current information. 
                        <strong className="font-medium"> Always verify all program details, fees, deadlines, and requirements directly with the universities</strong> using the source links below before making any application decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Citations - Only show if there are actual citations with content */}
      {citations.length > 0 && citations.some(citation => citation.title || citation.text) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Sources & Citations ({citations.filter(citation => citation.title || citation.text).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {citations
                .filter(citation => citation.title || citation.text)
                .map((citation, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline line-clamp-2 block mb-2"
                    >
                      {citation.title || citation.url}
                    </a>
                    {citation.text && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {citation.text}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground mt-2 truncate">
                      {citation.url}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
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
