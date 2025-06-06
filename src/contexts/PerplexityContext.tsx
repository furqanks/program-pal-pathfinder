
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
  tuition?: string;
  deadline?: string;
  duration?: string;
  requirements?: string;
  website?: string;
  fees?: {
    range?: string;
    note?: string;
  };
};

type SearchMetadata = {
  query: string;
  resultCount: number;
  requestedCount?: number;
  model?: string;
  hasStructuredData?: boolean;
  disclaimer?: string;
};

type PerplexityContextType = {
  isLoading: boolean;
  searchResults: SearchResult[];
  searchMetadata?: SearchMetadata;
  citations: any[];
  rawContent?: string;
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

export const PerplexityProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | undefined>();
  const [citations, setCitations] = useState<any[]>([]);
  const [rawContent, setRawContent] = useState<string>("");

  const clearResults = () => {
    setSearchResults([]);
    setSearchMetadata(undefined);
    setCitations([]);
    setRawContent("");
  };

  const searchPrograms = async (query: string, resultCount: number = 8): Promise<void> => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      // Call the simplified search-programs edge function
      const { data, error } = await supabase.functions.invoke('search-programs', {
        body: { query, resultCount },
      });

      if (error) {
        throw new Error(error.message || 'Error searching programs');
      }

      if (data && data.searchResults && Array.isArray(data.searchResults)) {
        setSearchResults(data.searchResults);
        setSearchMetadata(data.searchMetadata);
        setCitations(data.citations || []);
        setRawContent(data.rawContent || "");
        
        toast.success(`Found ${data.searchResults.length} programs from official sources`);
        
        if (data.citations && data.citations.length > 0) {
          toast.info(`${data.citations.length} source citations available for verification`);
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
      setCitations([]);
      setRawContent("");
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
        citations,
        rawContent,
        searchPrograms,
        clearResults,
      }}
    >
      {children}
    </PerplexityContext.Provider>
  );
};
