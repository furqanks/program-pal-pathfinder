
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

    // Enhanced prompt for better structured data extraction
    const enhancedPrompt = `
Search for university/college programs related to: "${query}"

For each program found, provide detailed information in this EXACT JSON format:
{
  "searchResults": [
    {
      "programName": "exact program name",
      "university": "university name",
      "degreeType": "Bachelor's/Master's/PhD/Certificate/Diploma",
      "country": "country name",
      "description": "comprehensive description including all details",
      "tuition": "specific tuition amount with currency",
      "deadline": "application deadline date",
      "duration": "program duration (e.g., '2 years', '18 months')",
      "website": "official program website URL",
      "requirements": "admission requirements summary",
      "fees": {
        "international": "international student fees",
        "domestic": "domestic student fees"
      },
      "programDetails": {
        "format": "Full-time/Part-time/Online/Hybrid",
        "startDate": "program start date",
        "language": "language of instruction",
        "credits": "total credits required"
      },
      "admissionRequirements": ["requirement 1", "requirement 2"],
      "ranking": "university or program ranking if available",
      "scholarships": "available scholarships information",
      "careerOutcomes": "typical career outcomes"
    }
  ]
}

Please find 5-8 relevant programs and include as much specific detail as possible, especially tuition costs, deadlines, and admission requirements. If specific information is not available, use "Not specified" rather than leaving fields empty.
`;

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
            content: 'You are a university program search specialist. Always respond with valid JSON in the exact format requested. Include as much specific detail as possible about tuition, deadlines, requirements, and program details.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.2,
        top_p: 0.9,
        return_citations: true,
        search_recency_filter: "month"
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Perplexity API error:', errorData)
      return new Response(
        JSON.stringify({ error: `Perplexity API error: ${response.status}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Perplexity response:', JSON.stringify(data, null, 2))

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from Perplexity API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const content = data.choices[0].message.content
    console.log('Raw content from Perplexity:', content)

    try {
      // Try to parse the JSON response
      let parsedResults;
      
      // First, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResults = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, try parsing the entire content
        parsedResults = JSON.parse(content);
      }

      // Validate and enhance the results
      if (parsedResults.searchResults && Array.isArray(parsedResults.searchResults)) {
        // Clean and validate each result
        const validatedResults = parsedResults.searchResults.map((result: any) => ({
          programName: result.programName || 'Program name not specified',
          university: result.university || 'University not specified',
          degreeType: result.degreeType || 'Degree type not specified',
          country: result.country || 'Country not specified',
          description: result.description || 'Description not available',
          tuition: result.tuition || result.fees?.international || result.fees?.domestic || undefined,
          deadline: result.deadline || result.applicationDeadline || undefined,
          duration: result.duration || undefined,
          website: result.website || undefined,
          requirements: result.requirements || (result.admissionRequirements ? result.admissionRequirements.join(', ') : undefined),
          fees: result.fees || undefined,
          programDetails: result.programDetails || undefined,
          admissionRequirements: result.admissionRequirements || undefined,
          ranking: result.ranking || undefined,
          scholarships: result.scholarships || undefined,
          careerOutcomes: result.careerOutcomes || undefined
        }));

        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || []
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        throw new Error('Invalid results structure');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Content that failed to parse:', content)
      
      // Fallback: try to extract program information using regex
      const fallbackResults = [];
      const lines = content.split('\n').filter(line => line.trim());
      
      let currentProgram: any = {};
      for (const line of lines) {
        if (line.toLowerCase().includes('program') && line.toLowerCase().includes(':')) {
          if (currentProgram.programName) {
            fallbackResults.push(currentProgram);
          }
          currentProgram = {
            programName: line.split(':')[1]?.trim() || 'Program name not specified',
            university: 'University not specified',
            degreeType: 'Degree type not specified',
            country: 'Country not specified',
            description: content.substring(0, 200) + '...'
          };
        }
      }
      
      if (currentProgram.programName) {
        fallbackResults.push(currentProgram);
      }

      return new Response(
        JSON.stringify({ 
          searchResults: fallbackResults.length > 0 ? fallbackResults : [
            {
              programName: `Programs related to: ${query}`,
              university: 'Multiple Universities',
              degreeType: 'Various',
              country: 'Various',
              description: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
              tuition: 'Contact university for details',
              deadline: 'Varies by program'
            }
          ],
          parseError: 'Failed to parse structured data, showing fallback results'
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
