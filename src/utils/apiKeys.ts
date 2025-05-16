
// Utility for managing API keys

/**
 * Safely gets an API key - first checks environment variables,
 * then looks in localStorage as a fallback
 */
export const getApiKey = (keyName: string): string | null => {
  // First try environment variable (server-side)
  if (typeof process !== 'undefined' && process.env) {
    const envKey = process.env[keyName];
    if (envKey) return envKey;
  }
  
  // Then try localStorage (client-side)
  try {
    return localStorage.getItem(keyName);
  } catch (e) {
    return null;
  }
};

/**
 * Saves an API key to localStorage
 */
export const setApiKey = (keyName: string, value: string): void => {
  try {
    localStorage.setItem(keyName, value);
  } catch (e) {
    console.error(`Failed to save ${keyName} to localStorage`, e);
  }
};

/**
 * Removes an API key from localStorage
 */
export const removeApiKey = (keyName: string): void => {
  try {
    localStorage.removeItem(keyName);
  } catch (e) {
    console.error(`Failed to remove ${keyName} from localStorage`, e);
  }
};

// Constants for API key names
export const API_KEYS = {
  OPENAI: 'openai_api_key',
  PERPLEXITY: 'perplexity_api_key'
};
