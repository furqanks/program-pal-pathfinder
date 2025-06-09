
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Simplified prompt requesting only official university sources
    const prompt = `Find university programs that match: "${query}"

CRITICAL REQUIREMENTS:
- Use ONLY official university websites (.edu domains, .ac.uk domains, and official university sites)
- Do not use third-party educational portals, ranking sites, or aggregators
- All information must come directly from official university sources
- Include direct links to official program pages when possible

Provide comprehensive information about relevant programs including program names, universities, fees, deadlines, requirements, and other important details exactly as found on official university websites.`

    console.log('Sending search query to Perplexity with official sources only:', query)

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
            content: 'You are a university program research specialist. Use ONLY official university websites for information. Do not use third-party educational sites, ranking portals, or aggregators. All data must come from official university sources (.edu, .ac.uk, official university domains).'
          },
          {
            role: 'user',
            content: prompt
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
    console.log('Content length:', content.length)

    // Return raw content exactly as received from Perplexity
    const searchResults = [{
      programName: 'University Program Search Results',
      university: 'Multiple Universities',
      degreeType: 'Various Programs',
      country: 'Search Results', 
      description: content,
      tuition: 'See results below',
      deadline: 'See results below',
      duration: 'See results below',
      requirements: 'See results below',
      website: null,
      fees: {
        range: 'See detailed results below',
        note: 'Information from official university sources'
      }
    }]

    return new Response(
      JSON.stringify({ 
        searchResults: searchResults,
        citations: data.citations || [],
        rawContent: content,
        searchMetadata: {
          query: query,
          resultCount: 1,
          requestedCount: resultCount,
          model: data.model || 'llama-3.1-sonar-large-128k-online',
          hasStructuredData: false,
          reportFormat: true,
          disclaimer: 'Results from official university sources only via Perplexity AI'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

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
