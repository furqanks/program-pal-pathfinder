
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { getApiKey, setApiKey, API_KEYS } from "@/utils/apiKeys";

export type SearchResult = {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
};

type PerplexityContextType = {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  searchPrograms: (query: string) => Promise<void>;
  searchResults: SearchResult[];
  isLoading: boolean;
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
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load API key on mount
  useEffect(() => {
    const storedKey = getApiKey(API_KEYS.PERPLEXITY);
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  // Save API key to localStorage when set
  const handleSetApiKey = (key: string) => {
    setApiKey(API_KEYS.PERPLEXITY, key);
    setApiKeyState(key);
  };

  // Search programs using Perplexity API
  const searchPrograms = async (query: string) => {
    const currentApiKey = apiKey || getApiKey(API_KEYS.PERPLEXITY);
    
    if (!currentApiKey) {
      toast.error("API key not set. Please add your Perplexity API key in Settings.");
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      const response = await fetch("/api/search-programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, apiKey: currentApiKey }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.results);
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
        setApiKey: handleSetApiKey,
        searchPrograms,
        searchResults,
        isLoading,
      }}
    >
      {children}
    </PerplexityContext.Provider>
  );
};
