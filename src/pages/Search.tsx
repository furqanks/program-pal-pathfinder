
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, X, Info, ArrowRight, GraduationCap, MapPin, DollarSign } from "lucide-react";
import { usePerplexityContext } from "@/contexts/PerplexityContext";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SearchReportView from "@/components/search/SearchReportView";

const Search = () => {
  const { searchPrograms, searchResults, isLoading, clearResults, searchMetadata, citations, rawContent } = usePerplexityContext();
  const [customQuery, setCustomQuery] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({
    field: "",
    level: "",
    location: "",
    budget: "",
    format: ""
  });

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

  const handleGuidedSearch = async () => {
    const query = buildQueryFromAnswers();
    if (query.trim()) {
      await searchPrograms(query.trim(), 8);
    }
  };

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      await searchPrograms(customQuery.trim(), 8);
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
    clearResults();
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
            {(searchResults.length > 0 || hasAnswers) && (
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

              {searchMetadata && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>Powered by Perplexity AI</span>
                  {citations.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{citations.length} sources</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results - Always use report view */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Search Results
            </h2>
            <Badge variant="secondary">
              {citations.length} sources referenced
            </Badge>
          </div>

          <SearchReportView 
            rawContent={rawContent} 
            query={searchMetadata?.query || customQuery || generatedQuery}
            citations={citations}
          />
        </div>
      )}

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

      {/* Empty State */}
      {!isLoading && searchResults.length === 0 && !hasAnswers && !customQuery && (
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
