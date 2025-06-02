
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, Filter, X } from "lucide-react";
import { usePerplexityContext } from "@/contexts/PerplexityContext";
import EnhancedSearchResultCard from "@/components/search/EnhancedSearchResultCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Search = () => {
  const { searchPrograms, searchResults, isLoading, clearResults } = usePerplexityContext();
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [degreeFilter, setDegreeFilter] = useState<string>("");
  const [formatFilter, setFormatFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await searchPrograms(query.trim());
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    clearResults();
    setCountryFilter("");
    setDegreeFilter("");
    setFormatFilter("");
    setSortBy("relevance");
  };

  // Get unique values for filters
  const uniqueCountries = Array.from(new Set(searchResults.map(r => r.country))).sort();
  const uniqueDegreeTypes = Array.from(new Set(searchResults.map(r => r.degreeType))).sort();
  const uniqueFormats = Array.from(new Set(
    searchResults
      .map(r => r.programDetails?.format)
      .filter(Boolean)
  )).sort();

  // Filter and sort results
  const filteredResults = searchResults
    .filter(result => {
      if (countryFilter && result.country !== countryFilter) return false;
      if (degreeFilter && result.degreeType !== degreeFilter) return false;
      if (formatFilter && result.programDetails?.format !== formatFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "university":
          return a.university.localeCompare(b.university);
        case "program":
          return a.programName.localeCompare(b.programName);
        case "country":
          return a.country.localeCompare(b.country);
        case "deadline":
          // Sort by deadline if available, otherwise put at end
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        default:
          return 0; // relevance (original order)
      }
    });

  const activeFiltersCount = [countryFilter, degreeFilter, formatFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Program Search</h1>
        <p className="text-muted-foreground">
          Search for university programs worldwide with detailed information
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
          </form>
        </CardContent>
      </Card>

      {/* Filters and Results */}
      {searchResults.length > 0 && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Sorting
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} active</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={degreeFilter} onValueChange={setDegreeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Degrees</SelectItem>
                    {uniqueDegreeTypes.map(degree => (
                      <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {uniqueFormats.length > 0 && (
                  <Select value={formatFilter} onValueChange={setFormatFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Formats</SelectItem>
                      {uniqueFormats.map(format => (
                        <SelectItem key={format} value={format}>{format}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="university">University Name</SelectItem>
                    <SelectItem value="program">Program Name</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <div className="flex justify-end pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCountryFilter("");
                      setDegreeFilter("");
                      setFormatFilter("");
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Search Results ({filteredResults.length} programs)
              </h2>
            </div>

            {filteredResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No programs match your current filters. Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResults.map((result, index) => (
                  <EnhancedSearchResultCard key={index} result={result} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Searching for programs with detailed information...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && searchResults.length === 0 && !query && (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Search for University Programs</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Enter keywords to search for university programs worldwide. Include details like degree level, field of study, country, or specific requirements.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Example searches:</strong></p>
              <p>"Computer Science Masters in Canada"</p>
              <p>"MBA programs with GMAT 650+ in Europe"</p>
              <p>"PhD Psychology programs with funding"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
