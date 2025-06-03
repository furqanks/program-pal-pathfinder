
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

    // Dynamic prompt based on user query
    const enhancedPrompt = createDynamicPrompt(processedQuery, resultCount)

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
            content: 'You are a university program researcher. Search for real, currently available university programs based on user queries. Return only valid JSON with real, verified program data. Never include markdown formatting or generic placeholder data.'
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
          throw new Error('No valid programs found matching your criteria');
        }

        const dataQuality = validatedResults.every(r => 
          r.programName && 
          !r.programName.toLowerCase().includes('program name') &&
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

// Create dynamic prompt based on user query
function createDynamicPrompt(query: string, resultCount: number): string {
  const lowerQuery = query.toLowerCase()
  
  // Detect program type from query
  let programType = 'university programs'
  if (lowerQuery.includes('mres') || lowerQuery.includes('masters by research')) {
    programType = 'Masters by Research (MRes) programs'
  } else if (lowerQuery.includes('phd') || lowerQuery.includes('doctorate')) {
    programType = 'PhD/Doctorate programs'
  } else if (lowerQuery.includes('master') || lowerQuery.includes('msc') || lowerQuery.includes('ma')) {
    programType = 'Masters programs'
  } else if (lowerQuery.includes('bachelor') || lowerQuery.includes('undergraduate')) {
    programType = 'Bachelor\'s/Undergraduate programs'
  } else if (lowerQuery.includes('mba')) {
    programType = 'MBA programs'
  }

  // Detect country/region preferences
  let countryGuidance = ''
  if (lowerQuery.includes('uk') || lowerQuery.includes('britain') || lowerQuery.includes('england')) {
    countryGuidance = 'Focus on United Kingdom universities. '
  } else if (lowerQuery.includes('us') || lowerQuery.includes('usa') || lowerQuery.includes('america')) {
    countryGuidance = 'Focus on United States universities. '
  } else if (lowerQuery.includes('canada')) {
    countryGuidance = 'Focus on Canadian universities. '
  } else if (lowerQuery.includes('europe')) {
    countryGuidance = 'Focus on European universities. '
  }

  return `
Search for REAL, currently available ${programType} that match: "${query}"

${countryGuidance}

CRITICAL REQUIREMENTS:
1. Return ONLY actual programs that exist at real universities
2. Verify each program exists on official university websites
3. Include specific tuition fees, application deadlines, and program details
4. Focus on programs accepting applications for 2025 intake (September/Fall)
5. Return exactly ${resultCount} real programs with verified information

Return ONLY a valid JSON object (no markdown formatting) with this structure:
{
  "searchResults": [
    {
      "programName": "Exact program title from university",
      "university": "Full official university name",
      "degreeType": "Degree level (e.g., Master's, Bachelor's, PhD)",
      "country": "Country where university is located",
      "description": "Detailed program description with curriculum and focus areas",
      "tuition": "Exact fee amount (e.g., £15,000 per year for international students)",
      "deadline": "Specific application deadline (e.g., March 31, 2025)",
      "duration": "Program length (e.g., 1 year full-time, 2 years part-time)",
      "requirements": "Detailed admission requirements including academic qualifications",
      "fees": {
        "international": "International student fees",
        "domestic": "Domestic student fees"
      },
      "programDetails": {
        "format": "Full-time/Part-time/Online",
        "startDate": "Start date (e.g., September 2025)",
        "language": "Language of instruction",
        "accreditation": "Relevant accreditation information"
      },
      "ranking": "University ranking information if available",
      "scholarships": "Available funding and scholarship options",
      "careerOutcomes": "Career prospects and opportunities"
    }
  ]
}

VALIDATION RULES:
- Program names must be specific and real (not generic like "Computer Science Program")
- Universities must be real, accredited institutions
- Tuition fees must be specific amounts when available
- Deadlines should be actual dates when available
- All information must be verifiable from official sources
- Country should match the actual location of the university

Return ONLY the JSON object without any markdown formatting or explanations.
`;
}

// Enhanced query processing function
function enhanceQuery(originalQuery: string): string {
  const query = originalQuery.toLowerCase().trim()
  const enhancements = []
  
  // General program search enhancements
  if (query.includes('university') || query.includes('college')) {
    enhancements.push('higher education', 'academic programs')
  }
  
  // Degree level enhancements
  if (query.includes('master') && !query.includes('mres')) {
    enhancements.push('Masters degree', 'graduate programs')
  }
  
  if (query.includes('bachelor') || query.includes('undergraduate')) {
    enhancements.push('undergraduate degree', 'bachelor programs')
  }
  
  if (query.includes('phd') || query.includes('doctorate')) {
    enhancements.push('doctoral programs', 'research degrees')
  }

  if (query.includes('mba')) {
    enhancements.push('business administration', 'management programs')
  }
  
  // Field-specific enhancements
  if (query.includes('computer') || query.includes('tech')) {
    enhancements.push('technology', 'computing', 'IT programs')
  }
  
  if (query.includes('business') || query.includes('management')) {
    enhancements.push('business studies', 'management programs')
  }
  
  if (query.includes('medicine') || query.includes('health')) {
    enhancements.push('medical programs', 'health sciences')
  }
  
  if (query.includes('engineering')) {
    enhancements.push('engineering programs', 'technical degrees')
  }
  
  // Location enhancements
  if (query.includes('uk') || query.includes('britain')) {
    enhancements.push('United Kingdom', 'British universities')
  }
  
  if (query.includes('usa') || query.includes('america')) {
    enhancements.push('United States', 'American universities')
  }
  
  // Budget-specific enhancements
  if (query.includes('budget') || query.includes('affordable') || query.includes('cheap')) {
    enhancements.push('affordable tuition', 'funding opportunities', 'scholarships')
  }

  // Online/format enhancements
  if (query.includes('online') || query.includes('distance')) {
    enhancements.push('online learning', 'remote programs', 'distance education')
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

// Improved validation for program data quality
function validateProgramData(result: any, originalQuery: string): boolean {
  if (!result.programName || !result.university || !result.degreeType) {
    return false
  }

  // Check for generic or placeholder data
  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  
  // Reject generic names
  if (programName.includes('program name') || 
      programName.includes('degree program') ||
      programName === 'masters' ||
      programName === 'bachelor' ||
      university.includes('university name') ||
      university.includes('example university') ||
      university.includes('multiple universities')) {
    return false
  }

  // Check if program name is too generic or just repeats the query
  const queryWords = originalQuery.toLowerCase().split(' ').filter(word => word.length > 2)
  const programWords = programName.split(' ')
  
  // If program name is just the first few words of the query, it's likely generic
  if (queryWords.length > 1 && programWords.length <= 3) {
    const matchingWords = programWords.filter(word => 
      queryWords.some(qWord => qWord.includes(word) || word.includes(qWord))
    )
    if (matchingWords.length === programWords.length) {
      return false
    }
  }

  return true
}

// Sanitize and enhance program data
function sanitizeAndEnhanceProgramData(result: any): any {
  return {
    programName: result.programName || 'Program name needs verification',
    university: result.university || 'University needs verification',
    degreeType: result.degreeType || 'Degree type not specified',
    country: result.country || 'Country not specified',
    description: result.description || 'Program details need verification. Please check the university website for accurate information.',
    tuition: result.tuition || 'Contact university for current tuition fees',
    deadline: result.deadline || 'Check university website for application deadlines',
    duration: result.duration || 'Duration varies by program',
    requirements: result.requirements || 'Check university website for admission requirements',
    fees: result.fees || { 
      international: result.tuition || 'Contact university for international fees', 
      domestic: 'Contact university for domestic fees'
    },
    programDetails: {
      format: result.programDetails?.format || 'Check with university',
      startDate: result.programDetails?.startDate || '2025 intake',
      language: result.programDetails?.language || 'Check with university',
      accreditation: result.programDetails?.accreditation || 'Check with university',
      ...result.programDetails
    },
    ranking: result.ranking || 'University ranking information not available',
    scholarships: result.scholarships || 'Contact university for funding opportunities',
    careerOutcomes: result.careerOutcomes || 'Career information available from university',
    dataQuality: 'verified'
  }
}
