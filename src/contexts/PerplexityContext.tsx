
import { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
};

type PerplexityContextType = {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
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
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const searchPrograms = async (query: string): Promise<void> => {
    if (!apiKey) {
      toast.error("Please enter your Perplexity API key first");
      return;
    }

    setIsLoading(true);
    try {
      // In a real integration, this would call the Perplexity API
      // For demo purposes, we'll simulate results after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      toast.success(`Found ${mockResults.length} programs related to "${query}"`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search programs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PerplexityContext.Provider
      value={{
        apiKey,
        setApiKey,
        isLoading,
        searchResults,
        searchPrograms,
      }}
    >
      {children}
    </PerplexityContext.Provider>
  );
};
