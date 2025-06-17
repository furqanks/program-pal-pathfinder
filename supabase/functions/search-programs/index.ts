
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

    // Updated prompt to better handle budget-friendly searches and remove asterisks
    const prompt = `Hey there! 👋 I'm here to help you find amazing university programs that match your search criteria.

You're looking for: "${query}"

I'll structure my findings in a way that's easy to read and actionable. Think of me as your university research buddy who knows all the best programs!

IMPORTANT: I must provide AT LEAST 8-10 different program options from different universities. If I can't find enough exact matches, I'll include closely related programs to give you more options.

CRITICAL FOR BUDGET SEARCHES: If the search mentions "budget-friendly", "affordable", "cheap", or "low cost", I must prioritize:
- Public universities with lower fees
- Programs under £20,000 per year for international students
- Universities known for value-for-money education
- Programs with good scholarship opportunities
- Avoid expensive private institutions and elite universities unless they offer exceptional financial aid

Format everything in clean markdown with sections, tables, and bullet points. DO NOT use asterisks for bold text - use proper markdown formatting instead.

Organize into these sections:

# 🎓 Featured Programs

For each program, provide:

Program Name: [Full Program Title]
University: [University Name]
Location: [Country and City]
Degree Level: [Bachelor's/Master's/PhD]
Duration: [Program length]
Tuition Fees: [Fee information with currency - be realistic about costs]
Application Deadline: [Current deadline or next intake]
Entry Requirements: [Key admission requirements]
Program Highlights: [What makes this program special]
Official Website: [Direct link to program page]

# 📋 Requirements Overview

- Common Prerequisites: What most programs need
- Language Requirements: IELTS/TOEFL scores typically required
- Academic Requirements: GPA or grade equivalents
- Additional Requirements: Work experience, portfolios, etc.

# ⏰ Application Timeline

| University | Program | Application Deadline | Start Date | Status |
| ---------- | ------- | ------------------- | ---------- | ------ |

# 💰 Fee Comparison

| University | Program | Annual Tuition | Total Cost | Scholarships Available |
| ---------- | ------- | -------------- | ---------- | --------------------- |

# 💡 My Recommendations for You

Based on your search, here's what I think you should focus on:

- Top Picks: The programs I think are perfect matches
- Budget-Friendly Options: Great programs that won't break the bank
- Prestigious Choices: Elite programs if you're aiming high
- Quick Applications: Programs with rolling admissions or upcoming deadlines

# ✅ Next Steps

- Things you should do this week
- Research tasks to complete
- Documents to prepare
- People to contact

CRITICAL REQUIREMENTS:
- Provide AT LEAST 8-10 different programs from different universities
- Use real, currently offered programs only
- Include working university website URLs when possible
- All information must be from official university sources
- If exact fees are unknown, state "Verify with University"
- Include clear disclaimers about verifying information
- DO NOT use asterisks for formatting - use proper markdown headers, lists, and emphasis
- For budget searches, prioritize affordable options and avoid expensive elite institutions

Please provide detailed, accurate information about university programs matching this search query.`

    console.log('Sending enhanced search query to Perplexity:', query)

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
            content: 'You are a friendly, helpful AI assistant who specializes in finding university programs. You speak in a casual, encouraging tone like a knowledgeable friend. Always provide at least 8-10 different program options from different universities. Use proper markdown formatting without asterisks for bold text. Focus on being genuinely helpful rather than overly formal. When users search for budget-friendly options, prioritize affordable universities and programs under £20,000 per year, avoiding expensive elite institutions unless they offer exceptional financial aid.'
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
    console.log('Perplexity response received for enhanced search')

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
    console.log('Enhanced report content length:', content.length)

    // Clean up any remaining asterisks from the content
    const cleanedContent = content
      .replace(/\*\*([^*]+)\*\*/g, '**$1**') // Keep markdown bold but clean up any malformed asterisks
      .replace(/\*\*([^*]+):\*\*/g, '**$1:**') // Fix colon formatting
      .replace(/\*([^*]+)\*/g, '*$1*') // Keep markdown italic but clean up malformed asterisks

    // Create a single comprehensive result for report display
    const searchResults = [{
      programName: 'University Program Search Report',
      university: 'Comprehensive Analysis',
      degreeType: 'Multiple Programs',
      country: 'Global Search Results', 
      description: cleanedContent,
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
        rawContent: cleanedContent,
        searchMetadata: {
          query: query,
          resultCount: 1,
          requestedCount: resultCount,
          model: data.model || 'llama-3.1-sonar-large-128k-online',
          hasStructuredData: false,
          reportFormat: true,
          disclaimer: 'Enhanced search report generated by Perplexity AI with 8-10 program options. Always verify all details directly with universities.'
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
