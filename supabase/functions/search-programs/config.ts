
export const SEARCH_CONFIG = {
  DEFAULT_RESULT_COUNT: 8,
  MAX_TOKENS: 8000,
  TEMPERATURE: 0.1,
  TOP_P: 0.9,
  MODEL: 'llama-3.1-sonar-large-128k-online',
  SEARCH_RECENCY_FILTER: 'month'
} as const

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
