
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
  // Enhanced fee structure with categories
  feeCategory?: string; // "Budget-friendly", "Mid-range", "Premium", "Luxury", "Verify with University"
  feeRange?: string; // Estimated range with disclaimers
  tuition?: string; // For backward compatibility
  deadline?: string;
  applicationDeadline?: string;
  duration?: string;
  requirements?: string;
  fees?: {
    category?: string;
    estimatedRange?: string;
    domestic?: string;
    international?: string;
    eu?: string;
    note?: string;
  };
  website?: string;
  feesPageUrl?: string; // Direct link to university fees page
  admissionRequirements?: string[];
  programDetails?: {
    credits?: string;
    format?: string; // "Full-time", "Part-time", "Online", etc.
    startDate?: string;
    language?: string;
    coursework?: string[];
    accreditation?: string;
  };
  // Enhanced quality assessment fields
  dataQuality?: {
    confidence?: string; // "High", "Good", "Moderate", "Low"
    lastUpdated?: string;
    sourceType?: string; // "Official website", "Educational directory", "Multiple sources"
    accuracyNote?: string;
  };
  confidenceScore?: number;
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
  accuracyDisclaimer?: string;
};

type SearchMetadata = {
  query: string;
  originalQuery?: string;
  resultCount: number;
  requestedCount?: number;
  totalFound?: number;
  model?: string;
  fallback?: boolean;
  dataQuality?: string;
  searchQuality?: number;
  accuracy?: string;
  feeAccuracyNote?: string;
  disclaimer?: string;
  validationLevel?: string;
  suggestion?: string;
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
  
  // Extract fee information (more conservative approach)
  const feePatterns = [
    /(?:fees?|tuition|cost)[:\s]*([£$€¥₹]?[\d,]+(?:\.\d{2})?[\s\-to]*[£$€¥₹]?[\d,]*(?:\.\d{2})?[\/\s]*(?:per\s+)?(?:year|semester|term|annum)?)/i
  ];
  
  feePatterns.forEach(pattern => {
    const match = description.match(pattern);
    if (match && !parsed.feeRange) {
      parsed.feeRange = match[1].trim();
    }
  });
  
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
        // Enhanced data processing with improved disclaimer handling
        const enhancedResults = data.searchResults.map((result: SearchResult) => {
          const parsedData = parseStructuredData(result.description);
          
          // Enhanced fee category handling
          if (!result.feeCategory && result.tuition) {
            const tuitionStr = result.tuition.toLowerCase();
            if (tuitionStr.includes('budget') || tuitionStr.includes('affordable')) {
              result.feeCategory = 'Budget-friendly';
            } else if (tuitionStr.includes('premium') || tuitionStr.includes('expensive')) {
              result.feeCategory = 'Premium';
            } else {
              result.feeCategory = 'Verify with University';
            }
          }
          
          return {
            ...result,
            ...parsedData,
            // Enhanced fee handling with clear disclaimers
            feeCategory: result.feeCategory || 'Verify with University',
            feeRange: result.feeRange || parsedData.feeRange || 'Contact university for current fees',
            tuition: result.feeCategory ? `${result.feeCategory} - ${result.feeRange || 'Verify with university'}` : result.tuition,
            deadline: result.deadline || parsedData.deadline,
            duration: result.duration || parsedData.duration,
            website: result.website || parsedData.website,
            requirements: result.requirements || parsedData.requirements,
            feesPageUrl: result.feesPageUrl || result.website,
            programDetails: {
              ...parsedData.programDetails,
              ...result.programDetails
            },
            dataQuality: {
              confidence: result.dataQuality?.confidence || 'Moderate',
              lastUpdated: result.dataQuality?.lastUpdated || 'Unknown',
              sourceType: result.dataQuality?.sourceType || 'Multiple sources',
              accuracyNote: 'Fee estimates require verification with university',
              ...result.dataQuality
            },
            fees: {
              category: result.feeCategory || 'Verify with University',
              estimatedRange: result.feeRange || 'Contact university',
              note: 'IMPORTANT: All fee information should be verified directly with the university',
              ...result.fees
            },
            accuracyDisclaimer: result.accuracyDisclaimer || 'Always verify program details and fees with the university before applying'
          };
        });
        
        setSearchResults(enhancedResults);
        
        // Enhanced search metadata with validation info
        const metadata: SearchMetadata = {
          query: data.searchMetadata?.query || query,
          originalQuery: query,
          resultCount: enhancedResults.length,
          requestedCount: resultCount,
          totalFound: data.searchMetadata?.totalFound,
          disclaimer: 'Fee information is estimated and should be verified with universities',
          validationLevel: data.searchMetadata?.validationLevel || 'standard',
          ...data.searchMetadata
        };
        setSearchMetadata(metadata);

        // Enhanced success message with transparency
        const validationMessage = metadata.validationLevel === 'relaxed' ? 
          ' (relaxed validation applied for better results)' : '';
        
        toast.success(`Found ${enhancedResults.length} programs${validationMessage} - verify fees with universities`);
        
        // Show additional info if fewer results than requested
        if (enhancedResults.length < resultCount && enhancedResults.length > 0) {
          toast.info(`Found ${enhancedResults.length} of ${resultCount} requested programs. Try a broader search for more results.`);
        }
        
      } else if (data && data.error) {
        // Handle specific error cases with user-friendly messages
        if (data.suggestion) {
          toast.error(`${data.error} ${data.suggestion}`);
        } else {
          throw new Error(data.error);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to search programs. Please try again with different keywords.');
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
