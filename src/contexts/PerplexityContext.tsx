
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
  // Enhanced fields
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
  };
};

type PerplexityContextType = {
  isLoading: boolean;
  searchResults: SearchResult[];
  searchPrograms: (query: string) => Promise<void>;
};

const PerplexityContext = createContext<PerplexityContextType | undefined>(undefined);

export const usePerplexityContext = () => {
  const context = useContext(PerplexityContext);
  if (!context) {
    throw new Error("usePerplexityContext must be used within a PerplexityProvider");
  }
  return context;
};

export const PerplexityProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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
        setSearchResults(data.searchResults);
        toast.success(`Found ${data.searchResults.length} programs related to "${query}"`);
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
      }}
    >
      {children}
    </PerplexityContext.Provider>
  );
};
