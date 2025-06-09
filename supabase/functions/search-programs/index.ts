
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

    // Enhanced prompt for comprehensive report-style results
    const prompt = `Create a comprehensive university program search report for: "${query}"

Structure your response as a detailed research report covering:

## Program Overview
Provide a summary of the search criteria and what types of programs match this query.

## Available Programs
List specific programs found, organized by country/region. For each program include:
- **Program Name**: Full official program title
- **University**: Complete university name  
- **Location**: Country and city
- **Degree Level**: Bachelor's, Master's, PhD, etc.
- **Duration**: Program length
- **Tuition Fees**: Exact fees as stated by universities (specify currency and student status)
- **Application Deadline**: Current deadline information
- **Entry Requirements**: Key admission requirements
- **Program Highlights**: Brief description of unique features

## Key Insights
- Common fee ranges across programs
- Popular locations for this field
- Typical admission requirements
- Notable program features or specializations

## Application Considerations
- Important deadlines to note
- Documentation typically required
- Tips for international students (if relevant)

CRITICAL INSTRUCTIONS:
- Only include real, currently offered programs from accredited universities
- Report fees exactly as found on official university websites
- Include direct links to program pages when possible: [Program Name](URL)
- If exact information is unavailable, clearly state "Contact university for current details"
- Focus on official university sources only
- Prioritize accuracy over quantity

Format links as: [Program Title](university-program-url) for easy access to official pages.`

    console.log('Sending comprehensive search query to Perplexity:', query)

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
            content: 'You are a university program research specialist. Create comprehensive, accurate reports from official university sources. Always verify information from university websites and provide direct links when possible. Format responses as structured reports with clear sections and actionable information.'
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
    console.log('Perplexity response received for comprehensive search')

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

    // Create a single comprehensive result for report display
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
          model: data.model || 'llama-3.1-sonar-large-128k-online',
          hasStructuredData: false,
          reportFormat: true,
          disclaimer: 'Comprehensive search report generated by Perplexity AI. Always verify all details directly with universities.'
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
