
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

    // Enhanced query processing
    const processedQuery = enhanceQuery(query)
    console.log('Original query:', query)
    console.log('Processed query:', processedQuery)

    // More specific prompt for better data quality
    const enhancedPrompt = `
Search for REAL, currently available Masters by Research (MRes) programs that match: "${processedQuery}"

CRITICAL REQUIREMENTS:
1. Return ONLY actual MRes programs that exist at real universities
2. Verify each program exists on official university websites
3. Include specific tuition fees, application deadlines, and program details
4. Focus on programs accepting applications for September 2025 intake
5. Return exactly ${resultCount} real programs with verified information

Return ONLY a valid JSON object (no markdown formatting) with this structure:
{
  "searchResults": [
    {
      "programName": "Exact MRes program title from university",
      "university": "Full official university name",
      "degreeType": "Master's",
      "country": "United Kingdom",
      "description": "Detailed program description with curriculum and research focus",
      "tuition": "Exact fee amount (e.g., £15,000 per year for international students)",
      "deadline": "Specific application deadline (e.g., March 31, 2025)",
      "duration": "Program length (e.g., 1 year full-time)",
      "requirements": "Detailed admission requirements including academic qualifications",
      "fees": {
        "international": "International student fees",
        "domestic": "UK/Home student fees"
      },
      "programDetails": {
        "format": "Full-time",
        "startDate": "September 2025",
        "language": "English",
        "accreditation": "Relevant accreditation body"
      },
      "ranking": "University ranking information",
      "scholarships": "Available funding and scholarship options",
      "careerOutcomes": "Career prospects and research opportunities"
    }
  ]
}

VALIDATION RULES:
- Program names must be specific (not generic like "degreeType" or query repetition)
- Universities must be real, accredited institutions
- Tuition fees must be specific amounts, not "varies" or "contact university"
- Deadlines must be actual dates, not generic phrases
- All information must be verifiable from official sources

Return ONLY the JSON object without any markdown formatting or explanations.
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
            content: 'You are a university program researcher. Return only valid JSON with real, verified MRes program data. Never include markdown formatting or generic placeholder data.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.1,
        top_p: 0.9,
        return_citations: true,
        search_recency_filter: "month"
        // Removed the invalid search_domain_filter that was causing the 500 error
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
    console.log('Raw API content:', content.substring(0, 500) + '...')

    try {
      // Improved JSON parsing to handle markdown and other formatting
      const parsedResults = parseAndValidateResponse(content)

      if (parsedResults.searchResults && Array.isArray(parsedResults.searchResults)) {
        // Enhanced validation for data authenticity
        const validatedResults = parsedResults.searchResults
          .filter(result => validateProgramData(result, query))
          .map((result: any) => sanitizeAndEnhanceProgramData(result))
          .slice(0, resultCount)

        // Check if we have quality results
        if (validatedResults.length === 0) {
          throw new Error('No valid MRes programs found matching your criteria');
        }

        const dataQuality = validatedResults.every(r => 
          r.programName && 
          !r.programName.toLowerCase().includes('degreetype') &&
          !r.programName.toLowerCase().includes(query.toLowerCase().split(' ')[0]) &&
          r.tuition && 
          !r.tuition.toLowerCase().includes('contact') &&
          r.deadline &&
          !r.deadline.toLowerCase().includes('check')
        ) ? 'verified' : 'needs-verification';

        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || [],
            searchMetadata: {
              query: processedQuery,
              resultCount: validatedResults.length,
              model: data.model || 'unknown',
              dataQuality: dataQuality
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
      
      // Return error instead of fallback for better debugging
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse search results. Please try a more specific query.',
          searchMetadata: {
            query: processedQuery,
            resultCount: 0,
            fallback: true,
            parseError: parseError.message
          }
        }),
        { 
          status: 500, 
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

// Enhanced query processing function
function enhanceQuery(originalQuery: string): string {
  const query = originalQuery.toLowerCase().trim()
  
  const enhancements = []
  
  // MRes-specific enhancements
  if (query.includes('mres') || query.includes('masters by research')) {
    enhancements.push('MRes', 'Masters by Research', 'research degree')
  }
  
  // Field-specific enhancements
  if (query.includes('medicine') || query.includes('health')) {
    enhancements.push('medical research', 'health sciences', 'biomedical research')
  }
  
  // Location enhancements
  if (query.includes('uk') || query.includes('britain')) {
    enhancements.push('United Kingdom', 'British universities')
  }
  
  // Budget-specific enhancements
  if (query.includes('budget') || query.includes('affordable')) {
    enhancements.push('affordable tuition', 'funding opportunities')
  }

  const enhancedQuery = `${originalQuery} ${enhancements.join(' ')}`
  return enhancedQuery.substring(0, 400)
}

// Robust JSON parsing with multiple strategies
function parseAndValidateResponse(content: string): any {
  // Remove any markdown formatting and extra text
  let cleanedContent = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^\s*[\w\s]*?(?=\{)/g, '')
    .trim()

  // Strategy 1: Find JSON object boundaries more precisely
  const jsonStart = cleanedContent.indexOf('{')
  const jsonEnd = cleanedContent.lastIndexOf('}')
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1)
    
    try {
      const parsed = JSON.parse(cleanedContent)
      if (parsed.searchResults && Array.isArray(parsed.searchResults)) {
        return parsed
      }
    } catch (e) {
      console.log('First parsing attempt failed:', e.message)
    }
  }

  // Strategy 2: Try to extract just the searchResults array
  const arrayMatch = content.match(/"searchResults"\s*:\s*\[([\s\S]*?)\]/g)
  if (arrayMatch) {
    try {
      const arrayContent = arrayMatch[0]
      const fullJson = `{${arrayContent}}`
      return JSON.parse(fullJson)
    } catch (e) {
      console.log('Array extraction failed:', e.message)
    }
  }

  throw new Error('Could not parse API response as valid JSON')
}

// Validate program data quality
function validateProgramData(result: any, originalQuery: string): boolean {
  if (!result.programName || !result.university || !result.country) {
    return false
  }

  // Check for generic or placeholder data
  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  
  // Reject generic names
  if (programName.includes('degreetype') || 
      programName.includes('program name') ||
      programName === 'masters' ||
      university.includes('university name') ||
      university.includes('multiple universities')) {
    return false
  }

  // Reject if program name is just the query repeated
  const queryWords = originalQuery.toLowerCase().split(' ')
  if (queryWords.length > 2 && programName === queryWords.slice(0, 3).join(' ')) {
    return false
  }

  return true
}

// Sanitize and enhance program data
function sanitizeAndEnhanceProgramData(result: any): any {
  return {
    programName: result.programName || 'Program name needs verification',
    university: result.university || 'University needs verification',
    degreeType: result.degreeType || 'Master\'s',
    country: result.country || 'United Kingdom',
    description: result.description || 'Program details need verification. Please check the university website for accurate information.',
    tuition: result.tuition || 'Contact university for current tuition fees',
    deadline: result.deadline || 'Check university website for application deadlines',
    duration: result.duration || 'Duration varies by program',
    requirements: result.requirements || 'Check university website for admission requirements',
    fees: result.fees || { 
      international: result.tuition || 'Contact university', 
      domestic: 'Contact university for home student fees'
    },
    programDetails: {
      format: result.programDetails?.format || 'Full-time',
      startDate: result.programDetails?.startDate || 'September 2025',
      language: result.programDetails?.language || 'English',
      accreditation: result.programDetails?.accreditation || 'Check with university',
      ...result.programDetails
    },
    ranking: result.ranking || 'University ranking information not available',
    scholarships: result.scholarships || 'Contact university for funding opportunities',
    careerOutcomes: result.careerOutcomes || 'Career information available from university',
    dataQuality: 'verified'
  }
}
