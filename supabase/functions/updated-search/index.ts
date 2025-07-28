
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
    const { query } = await req.json()

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

    const prompt = `Search for university programs that match: "${query}"

IMPORTANT REQUIREMENTS:
- Use ONLY official university websites (.edu domains, official university pages)
- Provide information for at least 10 different university programs
- Include programs from different universities/countries when possible
- Verify all information is from official sources

For each program, provide:
- University name and official website
- Program title and degree level
- Location (city, country)
- Tuition fees (if available on official sites)
- Application deadlines
- Entry requirements
- Program duration

Format the response clearly with proper headings and structure.`

    console.log('Sending Updated Search query to Perplexity:', query)

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a university program search assistant. Only use official university websites for information. Present results clearly with proper formatting.'
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
      console.error('Updated Perplexity API error - Status:', response.status, 'Response:', errorText)
      
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
    console.log('Updated Perplexity response received')

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
    console.log('Updated search content length:', content.length)

    return new Response(
      JSON.stringify({ 
        results: content,
        citations: data.citations || [],
        query: query,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Updated search error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
