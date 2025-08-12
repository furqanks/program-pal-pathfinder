import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, X, Info, ArrowRight, GraduationCap, MapPin, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMarkdownRenderer } from "@/components/search/MarkdownRenderer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
const Search = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState("");
  const [allResponse, setAllResponse] = useState("");
  const [verifiedResponse, setVerifiedResponse] = useState("");
  const [meta, setMeta] = useState<any>(null);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(true);
  const [customQuery, setCustomQuery] = useState("");
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
      const { data, error } = await supabase.functions.invoke('search-programs', {
        body: { query, resultCount: 10 },
      });

      if (error) {
        throw new Error(error.message || 'Error searching programs');
      }

      // Extract the raw contents from the response
      const rawContent = data?.rawContent || data?.searchResults?.[0]?.description || '';
      const rawVerified = data?.rawContentVerifiedOnly || '';

      setVerifiedResponse(rawVerified || "");
      setMeta(data?.searchMetadata || null);
      
      const contentToShow = (isVerifiedOnly && rawVerified) ? rawVerified : rawContent;
      if (contentToShow) {
        setSearchResponse(contentToShow);
        const countsMsg = data?.searchMetadata ? ` (${data.searchMetadata.verifiedCount || 0}/${data.searchMetadata.resultCount || 0} verified)` : '';
        toast.success(`Search completed successfully${countsMsg}`);
      } else {
        throw new Error('No content received from search');
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to search programs. Please try again.');
      setSearchResponse("");
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
    setVerifiedResponse("");
    setMeta(null);
    setIsVerifiedOnly(true);
  };

  const hasAnswers = Object.values(selectedAnswers).some(answer => answer);
  const generatedQuery = buildQueryFromAnswers();

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
        {/* Header Section with improved spacing */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">University Program Search</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find university programs worldwide with accurate information from official sources
          </p>
        </div>

        {/* Guided Search Card with improved spacing */}
        <Card className="shadow-lg bg-card border-border">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              Find Your Perfect Program
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              Answer a few questions to get personalized program recommendations
            </p>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8">
            {questions.map((question) => (
              <div key={question.id} className="space-y-3 sm:space-y-4">
                <h4 className="font-medium text-foreground text-base sm:text-lg">{question.question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {question.options.map((option) => (
                    <Button
                      key={option}
                      variant={selectedAnswers[question.id as keyof typeof selectedAnswers] === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswerSelect(question.id, option)}
                      className="text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto min-h-[40px] sm:min-h-[44px] whitespace-normal text-left justify-start leading-tight"
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleGuidedSearch} 
                disabled={isLoading || !hasAnswers}
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Search Programs
              </Button>
              {(searchResponse || hasAnswers) && (
                <Button variant="outline" onClick={handleClearSearch} size="lg" className="sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custom Search Option */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              Custom Search
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              Or describe your requirements in your own words
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <form onSubmit={handleCustomSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="e.g., Clinical Psychology Masters in UK with funding opportunities..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                />
                <Button type="submit" disabled={isLoading || !customQuery.trim()} size="lg" className="sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-sm">
                      <Info className="h-4 w-4 mr-2" />
                      Search Tips
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 z-50 bg-popover border border-border shadow-lg">
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

                <div className="text-sm text-muted-foreground">
                  <span>Powered by Perplexity AI</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Controls */}
        {(allResponse || verifiedResponse) && (
          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="verified-only" className="text-sm">Verified links only</Label>
              <Switch
                id="verified-only"
                checked={isVerifiedOnly}
                onCheckedChange={(v) => {
                  setIsVerifiedOnly(v);
                  setSearchResponse(v ? (verifiedResponse || allResponse) : (allResponse || verifiedResponse));
                }}
              />
            </div>
            {meta && (
              <span className="text-xs text-muted-foreground">
                {meta.verifiedCount || 0}/{meta.resultCount || 0} verified
              </span>
            )}
          </div>
        )}

        {/* Markdown Response Display */}
        {searchResponse && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Search Results</CardTitle>
                <Badge variant="secondary">
                  Powered by Perplexity AI
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {renderMarkdown(searchResponse)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Searching official university sources for accurate information...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !searchResponse && !hasAnswers && !customQuery && (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-4">
                  <GraduationCap className="h-12 w-12 text-primary" />
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-medium mb-4">Find Your Ideal University Program</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Answer the questions above or use custom search to discover programs that match your goals, budget, and preferences.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-muted-foreground max-w-2xl mx-auto">
                <div className="text-center">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-primary" />
                  <p className="font-semibold text-foreground text-sm sm:text-base">Comprehensive</p>
                  <p className="text-xs sm:text-sm">Programs from universities worldwide</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-primary" />
                  <p className="font-semibold text-foreground text-sm sm:text-base">Accurate</p>
                  <p className="text-xs sm:text-sm">Information from official sources</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-primary" />
                  <p className="font-semibold text-foreground text-sm sm:text-base">Budget-Aware</p>
                  <p className="text-xs sm:text-sm">Find programs within your budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Search;
