
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { enhanceQuery, analyzeQuery } from "./queryProcessor.ts"
import { createDynamicPrompt } from "./promptGenerator.ts"
import { parseAndValidateResponse } from "./responseParser.ts"
import { 
  validateProgramData, 
  sanitizeAndEnhanceProgramData, 
  assessDataQuality, 
  calculateSearchQuality 
} from "./dataValidator.ts"
import { generateSearchSuggestions } from "./searchUtils.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, resultCount = 8 } = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enhanced query processing
    const processedQuery = enhanceQuery(query)
    console.log('Original query:', query)
    console.log('Processed query:', processedQuery)

    // Dynamic prompt based on user query analysis
    const enhancedPrompt = createDynamicPrompt(processedQuery, resultCount)

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a university program researcher with access to official university websites and databases. Search for real, currently available university programs based on user queries. Return only valid JSON with real, verified program data from official sources. Never include markdown formatting or generic placeholder data.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.1,
        top_p: 0.9,
        return_citations: true,
        search_recency_filter: "month"
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', errorText)
      return new Response(
        JSON.stringify({ error: `API request failed: ${errorText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Perplexity response received')

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Invalid response structure from API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const content = data.choices[0].message.content
    console.log('Raw API content:', content.substring(0, 500) + '...')

    try {
      // Improved JSON parsing with flexible structure handling
      const parsedResults = parseAndValidateResponse(content)

      if (parsedResults.programs && Array.isArray(parsedResults.programs)) {
        // Enhanced validation for data authenticity
        const validatedResults = parsedResults.programs
          .filter(result => validateProgramData(result, query))
          .map((result: any) => sanitizeAndEnhanceProgramData(result))
          .slice(0, resultCount)

        // Check if we have quality results
        if (validatedResults.length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'No valid programs found matching your criteria. Please try a more specific query or different keywords.',
              suggestions: generateSearchSuggestions(query),
              searchMetadata: {
                query: processedQuery,
                resultCount: 0,
                dataQuality: 'no-results'
              }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const dataQuality = assessDataQuality(validatedResults);

        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || [],
            searchMetadata: {
              query: processedQuery,
              resultCount: validatedResults.length,
              model: data.model || 'unknown',
              dataQuality: dataQuality,
              searchQuality: calculateSearchQuality(validatedResults, query)
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        throw new Error('No valid results found in API response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      
      // Return constructive error with suggestions
      return new Response(
        JSON.stringify({ 
          error: 'Unable to parse search results. This might be due to a very specific or unusual query.',
          suggestions: generateSearchSuggestions(query),
          searchMetadata: {
            query: processedQuery,
            resultCount: 0,
            fallback: true,
            parseError: parseError.message
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Search programs error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
