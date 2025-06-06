
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

    // Simple, natural prompt that lets Perplexity do its thing
    const prompt = `Find ${resultCount} university programs matching: "${query}"

Use only official university websites and accredited educational institutions as sources. For each program, provide:
- Program name
- University name  
- Country/location
- Degree type (Bachelor's, Master's, PhD, etc.)
- Tuition fees (be specific about currency and whether for domestic/international students)
- Application deadline
- Duration
- Key admission requirements
- Brief program description

Include direct links to official university program pages where possible. Prioritize accuracy and use current information from official sources.`

    console.log('Sending query to Perplexity:', query)

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
            content: 'You are a university program researcher. Provide accurate, current information from official university sources. Always include source links for verification.'
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
    console.log('Raw response length:', content.length)

    // Try to parse as JSON first (in case Perplexity returns structured data)
    let parsedPrograms = []
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.programs && Array.isArray(parsed.programs)) {
          parsedPrograms = parsed.programs
        } else if (Array.isArray(parsed)) {
          parsedPrograms = parsed
        }
      }
    } catch (e) {
      console.log('Not structured JSON, will parse as text')
    }

    // If we got structured data, use it; otherwise parse the text response
    let searchResults = []
    
    if (parsedPrograms.length > 0) {
      console.log('Using structured data:', parsedPrograms.length, 'programs')
      searchResults = parsedPrograms.map((program: any) => ({
        programName: program.programName || program.program || 'Program name not specified',
        university: program.university || program.institution || 'University not specified',
        degreeType: program.degreeType || program.degree || 'Degree type not specified',
        country: program.country || program.location || 'Location not specified',
        description: program.description || 'Program details available on university website',
        tuition: program.tuition || program.fees || program.feeRange || 'Contact university for fees',
        deadline: program.deadline || program.applicationDeadline || 'Check university website',
        duration: program.duration || 'Duration varies',
        requirements: program.requirements || program.admissionRequirements || 'Check university requirements',
        website: program.website || program.link || null,
        fees: {
          range: program.tuition || program.fees || program.feeRange || 'Contact university for fees',
          note: 'Verify current fees with university'
        }
      }))
    } else {
      // Parse text response into a simple format
      console.log('Parsing text response')
      searchResults = [{
        programName: 'University Program Search Results',
        university: 'Multiple Universities',
        degreeType: 'Various',
        country: 'Multiple Countries',
        description: content,
        tuition: 'See detailed information below',
        deadline: 'Varies by program',
        duration: 'Varies by program',
        requirements: 'Varies by program',
        website: null,
        fees: {
          range: 'See program details',
          note: 'Verify all information with universities'
        }
      }]
    }

    return new Response(
      JSON.stringify({ 
        searchResults: searchResults.slice(0, resultCount),
        citations: data.citations || [],
        rawContent: content,
        searchMetadata: {
          query: query,
          resultCount: searchResults.length,
          requestedCount: resultCount,
          model: data.model || 'llama-3.1-sonar-large-128k-online',
          hasStructuredData: parsedPrograms.length > 0,
          disclaimer: 'All information sourced from Perplexity AI. Verify details directly with universities.'
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
