
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { enhanceQuery } from "./queryProcessor.ts"
import { createDynamicPrompt } from "./promptGenerator.ts"
import { parseAndValidateResponse } from "./responseParser.ts"
import { validateProgramData, sanitizeAndEnhanceProgramData } from "./dataValidator.ts"

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

    // Simplified prompt focused on accuracy
    const enhancedPrompt = createDynamicPrompt(processedQuery, resultCount)
    console.log('Using enhanced prompt for accurate data retrieval')

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
            content: 'You are a university program researcher. Find real, current university programs with accurate program names, universities, and tuition information. Focus on providing exact program titles as they appear on official university websites.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 6000,
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
    console.log('Raw API content length:', content.length)

    try {
      // Parse and validate response
      const parsedResults = parseAndValidateResponse(content)

      if (parsedResults.programs && Array.isArray(parsedResults.programs)) {
        console.log('Initial programs found:', parsedResults.programs.length)
        
        // Simplified validation - only filter out obviously invalid data
        const validatedResults = parsedResults.programs
          .filter((result, index) => {
            const isValid = validateProgramData(result, query)
            if (!isValid) {
              console.log(`Program ${index + 1} failed validation:`, result.programName)
            }
            return isValid
          })
          .map((result: any) => sanitizeAndEnhanceProgramData(result))
          .slice(0, resultCount)

        console.log('Programs after validation:', validatedResults.length)

        // Return results even if count is low
        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || [],
            searchMetadata: {
              query: processedQuery,
              resultCount: validatedResults.length,
              model: data.model || 'llama-3.1-sonar-large-128k-online',
              simplified: true
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
      
      return new Response(
        JSON.stringify({ 
          error: 'Unable to parse search results. Please try a different search query.',
          searchMetadata: {
            query: processedQuery,
            resultCount: 0,
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
