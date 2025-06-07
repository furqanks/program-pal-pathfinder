
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

    // Simplified prompt that emphasizes accuracy over categorization
    const prompt = `Find ${resultCount} real university programs matching: "${query}"

Use only official university websites and accredited educational institutions as sources. For each program, provide:
- Exact program name from university website
- Full university name  
- Country/location
- Degree type (Bachelor's, Master's, PhD, etc.)
- EXACT tuition fees with currency (be specific about domestic vs international rates)
- Application deadline
- Duration
- Key admission requirements
- Brief program description
- Direct university program page URL if available

CRITICAL: Report fees EXACTLY as found on university websites. Do not categorize or estimate fees - provide the actual amounts stated by universities. If fees vary by student status, specify this clearly.

Focus on accuracy over neat categorization. Provide real, verifiable information from official sources.`

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
            content: 'You are a university program researcher. Provide accurate, current information from official university sources with exact fees and requirements. Do not categorize or estimate - report exactly what universities state.'
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

    // Try to parse structured data first
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

    let searchResults = []
    
    if (parsedPrograms.length > 0) {
      console.log('Using structured data:', parsedPrograms.length, 'programs')
      // Minimal processing - preserve original data accuracy
      searchResults = parsedPrograms.map((program: any) => ({
        programName: program.programName || program.program || 'Program name not specified',
        university: program.university || program.institution || 'University not specified',
        degreeType: program.degreeType || program.degree || 'Degree type not specified',
        country: program.country || program.location || 'Location not specified',
        description: program.description || 'Program details available on university website',
        tuition: program.tuition || program.fees || program.feeRange || 'Contact university for current fees',
        deadline: program.deadline || program.applicationDeadline || 'Check university website for deadlines',
        duration: program.duration || 'Duration varies - check with university',
        requirements: program.requirements || program.admissionRequirements || 'Check university for specific requirements',
        website: program.website || program.link || null,
        fees: {
          range: program.tuition || program.fees || program.feeRange || 'Contact university for current fees',
          note: 'Always verify current fees directly with the university'
        }
      })).slice(0, resultCount)
    } else {
      // Text response - no filtering or processing
      console.log('Using text response without processing')
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
        searchResults: searchResults,
        citations: data.citations || [],
        rawContent: content,
        searchMetadata: {
          query: query,
          resultCount: searchResults.length,
          requestedCount: resultCount,
          model: data.model || 'llama-3.1-sonar-large-128k-online',
          hasStructuredData: parsedPrograms.length > 0,
          disclaimer: 'All information sourced from Perplexity AI. Always verify details directly with universities.'
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
