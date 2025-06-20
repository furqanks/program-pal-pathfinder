
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, X, Info, ArrowRight, GraduationCap, MapPin, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMarkdownRenderer } from "@/components/search/MarkdownRenderer";
import SearchReportHeader from "@/components/search/SearchReportHeader";
import SearchReportContent from "@/components/search/SearchReportContent";
import SearchReportSources from "@/components/search/SearchReportSources";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Search = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [citations, setCitations] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({
    field: "",
    level: "",
    location: "",
    budget: "",
    format: ""
  });

  const { renderMarkdown } = useMarkdownRenderer();

  const questions = [
    {
      id: "field",
      question: "What field are you interested in?",
      options: [
        "Computer Science & Technology",
        "Business & Management", 
        "Engineering",
        "Medicine & Health Sciences",
        "Psychology",
        "Data Science & Analytics",
        "Other/Custom Field"
      ]
    },
    {
      id: "level",
      question: "What degree level?",
      options: [
        "Bachelor's",
        "Master's",
        "PhD/Doctorate",
        "MBA",
        "Any Level"
      ]
    },
    {
      id: "location",
      question: "Where would you like to study?",
      options: [
        "United Kingdom",
        "United States",
        "Canada", 
        "Australia",
        "Europe",
        "Anywhere"
      ]
    },
    {
      id: "budget",
      question: "What's your budget preference?",
      options: [
        "Budget-friendly (looking for affordable options)",
        "Mid-range",
        "No budget constraints",
        "Scholarships & funding opportunities"
      ]
    },
    {
      id: "format",
      question: "Study format preference?",
      options: [
        "Full-time on-campus",
        "Part-time",
        "Online/Distance learning",
        "Any format"
      ]
    }
  ];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const buildQueryFromAnswers = () => {
    const parts = [];
    
    if (selectedAnswers.field && selectedAnswers.field !== "Other/Custom Field") {
      parts.push(selectedAnswers.field);
    }
    if (selectedAnswers.level && selectedAnswers.level !== "Any Level") {
      parts.push(selectedAnswers.level);
    }
    if (selectedAnswers.location && selectedAnswers.location !== "Anywhere") {
      parts.push(`in ${selectedAnswers.location}`);
    }
    if (selectedAnswers.budget === "Budget-friendly (looking for affordable options)") {
      parts.push("budget-friendly affordable");
    } else if (selectedAnswers.budget === "Scholarships & funding opportunities") {
      parts.push("with scholarships funding available");
    }
    if (selectedAnswers.format && selectedAnswers.format !== "Any format") {
      parts.push(selectedAnswers.format.toLowerCase());
    }

    return parts.join(" ");
  };

  const searchPrograms = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting search with query:', query);
      
      const { data, error } = await supabase.functions.invoke('search-programs', {
        body: { query, resultCount: 10 },
      });

      if (error) {
        console.error('Search error:', error);
        throw new Error(error.message || 'Error searching programs');
      }

      console.log('Search response received:', data);

      if (data?.rawContent) {
        setSearchResponse(data.rawContent);
        setCitations(data.citations || []);
        setSearchMetadata(data.searchMetadata || null);
        console.log('Citations:', data.citations);
        console.log('Search metadata:', data.searchMetadata);
        toast.success("Search completed successfully");
      } else {
        // Fallback to old format for backward compatibility
        const rawContent = data?.searchResults?.[0]?.description || '';
        if (rawContent) {
          setSearchResponse(rawContent);
          setCitations([]);
          setSearchMetadata(null);
          console.log('Using fallback content extraction');
          toast.success("Search completed successfully");
        } else {
          throw new Error('No content received from search');
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to search programs. Please try again.');
      setSearchResponse("");
      setCitations([]);
      setSearchMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuidedSearch = async () => {
    const query = buildQueryFromAnswers();
    if (query.trim()) {
      await searchPrograms(query.trim());
    }
  };

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      await searchPrograms(customQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setCustomQuery("");
    setSelectedAnswers({
      field: "",
      level: "",
      location: "",
      budget: "",
      format: ""
    });
    setSearchResponse("");
    setCitations([]);
    setSearchMetadata(null);
  };

  const handleSearchGoogle = () => {
    const searchQuery = customQuery || buildQueryFromAnswers();
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + " university programs")}`;
    window.open(googleSearchUrl, '_blank');
  };

  const hasAnswers = Object.values(selectedAnswers).some(answer => answer);
  const generatedQuery = buildQueryFromAnswers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">University Program Search</h1>
        <p className="text-muted-foreground">
          Find university programs worldwide with accurate information from official sources
        </p>
      </div>

      {/* Guided Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Find Your Perfect Program
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Answer a few questions to get personalized program recommendations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <h4 className="font-medium text-foreground">{question.question}</h4>
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    variant={selectedAnswers[question.id as keyof typeof selectedAnswers] === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnswerSelect(question.id, option)}
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Generated Query Preview */}
          {generatedQuery && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-start gap-3">
                <SearchIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Search query:</p>
                  <p className="text-sm text-muted-foreground italic">"{generatedQuery}"</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleGuidedSearch} 
              disabled={isLoading || !hasAnswers}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Search Programs
            </Button>
            {(searchResponse || hasAnswers) && (
              <Button variant="outline" onClick={handleClearSearch}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Search Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Custom Search
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Or describe your requirements in your own words
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCustomSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Clinical Psychology Masters in UK with funding opportunities..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !customQuery.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    Search Tips
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Search Tips</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Be specific: "Clinical Psychology Masters"</li>
                      <li>Include location: "in UK", "Canada", "Europe"</li>
                      <li>Mention budget: "budget-friendly", "scholarships"</li>
                      <li>Add format: "online", "part-time", "2025 intake"</li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="text-xs text-muted-foreground">
                <span>Powered by Perplexity AI</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Searching official university sources for accurate information...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResponse && !isLoading && (
        <div className="space-y-6">
          <SearchReportHeader 
            query={customQuery || generatedQuery}
            citations={citations}
            onSearchGoogle={handleSearchGoogle}
          />
          
          <Card>
            <CardContent className="p-6">
              <SearchReportContent rawContent={searchResponse} query={customQuery || generatedQuery} />
            </CardContent>
          </Card>
          
          {citations.length > 0 && (
            <SearchReportSources citations={citations} />
          )}

          {/* Debug Information */}
          {searchMetadata && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-orange-800">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-orange-700 space-y-1">
                  <p><strong>Content Length:</strong> {searchResponse.length} characters</p>
                  <p><strong>Citations Found:</strong> {searchMetadata.citationCount}</p>
                  <p><strong>Model Used:</strong> {searchMetadata.model}</p>
                  <p><strong>Content Preview:</strong> {searchMetadata.contentPreview}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !searchResponse && !hasAnswers && !customQuery && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <MapPin className="h-6 w-6 text-muted-foreground" />
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Find Your Ideal University Program</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Answer the questions above or use custom search to discover programs that match your goals, budget, and preferences.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground max-w-2xl mx-auto">
              <div className="text-center">
                <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p><strong>Comprehensive</strong></p>
                <p>Programs from universities worldwide</p>
              </div>
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p><strong>Accurate</strong></p>
                <p>Information from official sources</p>
              </div>
              <div className="text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p><strong>Budget-Aware</strong></p>
                <p>Find programs within your budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
