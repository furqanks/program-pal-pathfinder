
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
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
      
      // For development, simulate results after API failure
      const mockResults: SearchResult[] = [
        {
          programName: `${query} Engineering`,
          university: "MIT",
          degreeType: "Masters",
          country: "USA",
          description: `The ${query} Engineering program at MIT offers cutting-edge research opportunities in ${query} and related technologies.`,
        },
        {
          programName: `${query} Science`,
          university: "Stanford University",
          degreeType: "PhD",
          country: "USA",
          description: `Stanford's ${query} Science program is renowned for its interdisciplinary approach integrating ${query} with applied research.`,
        },
        {
          programName: `${query} Technology`,
          university: "ETH Zurich",
          degreeType: "Masters",
          country: "Switzerland",
          description: `ETH Zurich's ${query} Technology program provides a comprehensive curriculum with strong industry connections.`,
        },
        {
          programName: `${query} Innovation`,
          university: "University of Tokyo",
          degreeType: "Masters",
          country: "Japan",
          description: `The University of Tokyo's ${query} Innovation program focuses on emerging technologies and entrepreneurship in ${query} fields.`,
        },
      ];

      setSearchResults(mockResults);
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
