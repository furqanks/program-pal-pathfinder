
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
    const { query, resultCount = 10 } = await req.json()

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

    const prompt = `Find university programs that match this search: "${query}"

Please provide detailed information about at least 8-10 or more different university programs that match this search criteria. Include a mix of programs from different universities where possible.

Please ensure all information is from official university sources and include verification notes where appropriate.

For each program, please provide:
- Program name and university
- Location (country and city)
- Degree level and duration
- Tuition fees for both domestic and international students (with currency)
- Application deadlines
- Entry requirements
- Program highlights
- Official website links when available

If the search mentions budget-friendly, affordable, or low-cost options, prioritize public universities with lower fees.

Please also provide brief advice based on the search query.

Please format your response using markdown with proper headers, tables, and bullet points to make the information clear and well-organized. Use tables where appropriate to compare programs, and include clear section headers.`

    console.log('Sending search query to Perplexity:', query)

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that finds university programs. Provide accurate, detailed information from official sources using proper markdown formatting with headers, tables, and bullet points for clear organization.'
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
      console.error('Perplexity API error - Status:', response.status, 'Response:', errorText)
      
      // Parse error details if possible
      let errorDetails = 'Unknown API error'
      try {
        const errorData = JSON.parse(errorText)
        errorDetails = errorData.error?.message || errorText
      } catch {
        errorDetails = errorText
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Perplexity API Error (${response.status}): ${errorDetails}`,
          statusCode: response.status,
          details: errorText
        }),
        { 
          status: response.status >= 500 ? 500 : 400,
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
    console.log('Report content length:', content.length)

    // Return the exact Perplexity output with zero modifications
    const searchResults = [{
      programName: 'University Program Search Report',
      university: 'Comprehensive Analysis',
      degreeType: 'Multiple Programs',
      country: 'Global Search Results', 
      description: content,
      tuition: 'Varies by program - see report details',
      deadline: 'Multiple deadlines - see report details',
      duration: 'Varies by program type',
      requirements: 'Varies by program - see report details',
      website: null,
      fees: {
        range: 'See detailed analysis in report',
        note: 'All fees require verification with universities'
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
          model: data.model || 'sonar-pro',
          hasStructuredData: false,
          reportFormat: true,
          disclaimer: 'Search results generated by Perplexity AI. Always verify details directly with universities.'
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
