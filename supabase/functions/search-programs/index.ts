
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

    const prompt = `Search for university programs that match: "${query}"

CRITICAL RULES:
- Use ONLY official university domains (e.g., *.edu, *.ac.*, *.edu.au, *.ox.ac.uk, *.unimelb.edu.au, or the institution's primary domain)
- For each program, LINK DIRECTLY to the specific program page (not the university homepage or general faculty page)
- Do NOT use third-party aggregators (mastersportal, topuniversities, edureka, etc.)
- Include a concise Sources section listing all URLs used

Return AT LEAST ${resultCount} distinct programs from different universities where possible.

For each program include:
- Program name and degree level
- University name
- City and country
- Program duration
- Tuition fees with currency (domestic and international if available)
- Application deadlines
- Key entry requirements
- Program page URL (MUST be the direct program page URL on the official site)

Formatting requirements (Markdown only):
- Use an H2 header (##) for each program: "Program — University"
- Use short bullet points for details
- Provide a final section titled "Sources" with a bullet list of the exact URLs consulted
- Ensure all links are valid https URLs and clickable in Markdown

If the query mentions affordability/scholarships, prefer public universities and note relevant scholarships.

Only return the Markdown content.`

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
            content: 'You are a university program search assistant. STRICTLY use only official university domains and link to the exact program pages. Exclude third-party sites. Format clean Markdown with working https links and a Sources section.'
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
    console.log('Perplexity response received, keys:', Object.keys(data || {}))

    const content = (data?.choices && data.choices[0]?.message?.content)
      || data?.output_text
      || ''

    if (!content || typeof content !== 'string') {
      console.error('Invalid response structure from API', data)
      return new Response(
        JSON.stringify({ error: 'Invalid response structure from API', receivedKeys: Object.keys(data || {}), sample: JSON.stringify(data).slice(0, 500) }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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
