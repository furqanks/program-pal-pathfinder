
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
  // Enhanced fields for better data capture
  tuition?: string;
  deadline?: string;
  applicationDeadline?: string;
  duration?: string;
  requirements?: string;
  fees?: {
    domestic?: string;
    international?: string;
    eu?: string;
  };
  website?: string;
  admissionRequirements?: string[];
  programDetails?: {
    credits?: string;
    format?: string; // "Full-time", "Part-time", "Online", etc.
    startDate?: string;
    language?: string;
    coursework?: string[];
    accreditation?: string;
  };
  // Additional structured fields
  ranking?: string;
  accreditation?: string;
  scholarships?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  prerequisites?: string[];
  careerOutcomes?: string;
  researchOpportunities?: string;
  applicationProcess?: string;
};

type SearchMetadata = {
  query: string;
  resultCount: number;
  model?: string;
  fallback?: boolean;
};

type PerplexityContextType = {
  isLoading: boolean;
  searchResults: SearchResult[];
  searchMetadata?: SearchMetadata;
  searchPrograms: (query: string, resultCount?: number) => Promise<void>;
  clearResults: () => void;
};

const PerplexityContext = createContext<PerplexityContextType | undefined>(undefined);

export const usePerplexityContext = () => {
  const context = useContext(PerplexityContext);
  if (!context) {
    throw new Error("usePerplexityContext must be used within a PerplexityProvider");
  }
  return context;
};

// Enhanced helper function to parse structured data from description
const parseStructuredData = (description: string): Partial<SearchResult>=> {
  const parsed: Partial<SearchResult> = {};
  
  // Extract tuition/fees information
  const tuitionMatch = description.match(/(?:tuition|fees?|cost)[:\s]*([£$€]?[\d,]+(?:\.\d{2})?[\/\s]*(?:per\s+)?(?:year|semester|term|annum)?)/i);
  if (tuitionMatch) {
    parsed.tuition = tuitionMatch[1].trim();
  }
  
  // Extract deadline information
  const deadlineMatch = description.match(/(?:deadline|apply\s+by|application\s+due|applications\s+close)[:\s]*([a-zA-Z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[a-zA-Z]+\s+\d{4})/i);
  if (deadlineMatch) {
    parsed.deadline = deadlineMatch[1].trim();
  }
  
  // Extract duration
  const durationMatch = description.match(/(?:duration|length|program\s+length|course\s+duration)[:\s]*(\d+(?:\.\d+)?\s+(?:years?|months?|semesters?|terms?))/i);
  if (durationMatch) {
    parsed.duration = durationMatch[1].trim();
  }
  
  // Extract website
  const websiteMatch = description.match(/(https?:\/\/[^\s]+)/i);
  if (websiteMatch) {
    parsed.website = websiteMatch[1].trim();
  }
  
  // Extract requirements (look for GPA, test scores, etc.)
  const requirementsPatterns = [
    /(?:GPA|grade\s+point\s+average)[:\s]*(\d+\.?\d*)/i,
    /(?:IELTS)[:\s]*(\d+\.?\d*)/i,
    /(?:TOEFL)[:\s]*(\d+)/i,
    /(?:GMAT)[:\s]*(\d+)/i,
    /(?:GRE)[:\s]*(\d+)/i,
    /(?:bachelor'?s\s+degree|undergraduate\s+degree)/i,
    /(?:master'?s\s+degree)/i,
    /(?:work\s+experience)/i
  ];
  
  const requirements: string[] = [];
  requirementsPatterns.forEach(pattern => {
    const match = description.match(pattern);
    if (match) {
      requirements.push(match[0].trim());
    }
  });
  
  if (requirements.length > 0) {
    parsed.requirements = requirements.join(', ');
  }
  
  // Extract format (full-time, part-time, online)
  const formatMatch = description.match(/\b(full-time|part-time|online|hybrid|distance\s+learning|evening|weekend|remote)\b/i);
  if (formatMatch) {
    if (!parsed.programDetails) {
      parsed.programDetails = {};
    }
    parsed.programDetails.format = formatMatch[1].trim();
  }

  // Extract language
  const languageMatch = description.match(/\b(taught in|instruction in|language of instruction|program language)[:\s]*(english|french|german|spanish|mandarin|portuguese|italian)\b/i);
  if (languageMatch && languageMatch[2]) {
    if (!parsed.programDetails) {
      parsed.programDetails = {};
    }
    parsed.programDetails.language = languageMatch[2].trim();
  }
  
  return parsed;
};

export const PerplexityProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | undefined>();

  const clearResults = () => {
    setSearchResults([]);
    setSearchMetadata(undefined);
  };

  const searchPrograms = async (query: string, resultCount: number = 8): Promise<void> => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      // Call the search-programs edge function with the query and result count
      const { data, error } = await supabase.functions.invoke('search-programs', {
        body: { query, resultCount },
      });

      if (error) {
        throw new Error(error.message || 'Error searching programs');
      }

      if (data && data.searchResults && Array.isArray(data.searchResults)) {
        // Enhanced data processing with structure parsing
        const enhancedResults = data.searchResults.map((result: SearchResult) => {
          const parsedData = parseStructuredData(result.description);
          return {
            ...result,
            ...parsedData,
            // Ensure we don't override existing structured data with parsed data
            tuition: result.tuition || parsedData.tuition,
            deadline: result.deadline || parsedData.deadline,
            duration: result.duration || parsedData.duration,
            website: result.website || parsedData.website,
            requirements: result.requirements || parsedData.requirements,
            programDetails: {
              ...parsedData.programDetails,
              ...result.programDetails
            }
          };
        });
        
        setSearchResults(enhancedResults);
        
        // Store search metadata if available
        if (data.searchMetadata) {
          setSearchMetadata(data.searchMetadata);
        } else {
          setSearchMetadata({
            query: query,
            resultCount: enhancedResults.length
          });
        }

        // Show appropriate success message
        if (data.parseError) {
          toast.warning(`Found ${enhancedResults.length} programs with limited details. Data quality may vary.`);
        } else if (data.searchMetadata?.fallback) {
          toast.warning(`Limited search results retrieved. Showing ${enhancedResults.length} programs with basic details.`);
        } else {
          toast.success(`Found ${enhancedResults.length} programs with enhanced details`);
        }
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to search programs. Please try again.');
      setSearchResults([]);
      setSearchMetadata(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PerplexityContext.Provider
      value={{
        isLoading,
        searchResults,
        searchMetadata,
        searchPrograms,
        clearResults,
      }}
    >
      {children}
    </PerplexityContext.Provider>
  );
};
