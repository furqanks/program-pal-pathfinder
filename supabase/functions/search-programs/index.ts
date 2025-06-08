
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, SEARCH_CONFIG } from "./config.ts"
import { callPerplexityAPI } from "./perplexityApi.ts"
import { processSearchResponse } from "./responseProcessor.ts"
import { validateRequest, validateApiKey } from "./validation.ts"
import { createErrorResponse, createSuccessResponse } from "./errorHandler.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request and extract parameters
    const body = await req.json()
    const { query, resultCount } = validateRequest(body)
    
    // Validate API key
    const perplexityApiKey = validateApiKey()

    // Call Perplexity API
    const data = await callPerplexityAPI(query, resultCount, perplexityApiKey)
    
    // Process the response
    const processedResponse = processSearchResponse(data, resultCount, query)
    
    // Return success response
    return createSuccessResponse(processedResponse)

  } catch (error) {
    return createErrorResponse(error)
  }
})
