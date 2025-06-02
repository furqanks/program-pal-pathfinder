
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
};

type PerplexityContextType = {
  isLoading: boolean;
  searchResults: SearchResult[];
  searchPrograms: (query: string) => Promise<void>;
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

// Helper function to parse structured data from description
const parseStructuredData = (description: string): Partial<SearchResult> => {
  const parsed: Partial<SearchResult> = {};
  
  // Extract tuition/fees information
  const tuitionMatch = description.match(/(?:tuition|fees?)[:\s]*([£$€]?[\d,]+(?:\.\d{2})?[\/\s]*(?:per\s+)?(?:year|semester|term)?)/i);
  if (tuitionMatch) {
    parsed.tuition = tuitionMatch[1].trim();
  }
  
  // Extract deadline information
  const deadlineMatch = description.match(/(?:deadline|apply\s+by|application\s+due)[:\s]*([a-zA-Z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[a-zA-Z]+\s+\d{4})/i);
  if (deadlineMatch) {
    parsed.deadline = deadlineMatch[1].trim();
  }
  
  // Extract duration
  const durationMatch = description.match(/(?:duration|length)[:\s]*(\d+\s+(?:years?|months?|semesters?))/i);
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
    /(?:GRE)[:\s]*(\d+)/i
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
  const formatMatch = description.match(/\b(full-time|part-time|online|hybrid|distance\s+learning)\b/i);
  if (formatMatch) {
    parsed.programDetails = {
      format: formatMatch[1].trim()
    };
  }
  
  return parsed;
};

export const PerplexityProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const clearResults = () => {
    setSearchResults([]);
  };

  const searchPrograms = async (query: string): Promise<void> => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      // Call the search-programs edge function
      const { data, error } = await supabase.functions.invoke('search-programs', {
        body: { query },
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
              ...result.programDetails,
              ...parsedData.programDetails
            }
          };
        });
        
        setSearchResults(enhancedResults);
        toast.success(`Found ${enhancedResults.length} programs with enhanced details`);
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to search programs. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PerplexityContext.Provider
      value={{
        isLoading,
        searchResults,
        searchPrograms,
        clearResults,
      }}
    >
      {children}
    </PerplexityContext.Provider>
  );
};
