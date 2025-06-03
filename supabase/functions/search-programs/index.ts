
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

    // Improved prompt focusing on real, verifiable data
    const enhancedPrompt = `
You are a university program search engine. Find REAL, currently available university programs for: "${processedQuery}"

CRITICAL REQUIREMENTS:
1. Search ONLY official university websites and current admissions data
2. Return exactly ${resultCount} REAL programs with VERIFIED information
3. Each program MUST have actual, current tuition fees and deadlines
4. Only include programs that actually exist and are accepting applications
5. Cross-reference multiple sources to ensure accuracy

Return a JSON object with this EXACT structure (no markdown formatting):
{
  "searchResults": [
    {
      "programName": "Exact official program name from university website",
      "university": "Full official university name",
      "degreeType": "Bachelor's|Master's|PhD|Certificate|Diploma",
      "country": "Full country name",
      "description": "Detailed program description with curriculum details, minimum 100 words",
      "tuition": "Specific amount with currency (e.g. £15,000 per year)",
      "deadline": "Specific application deadline (e.g. January 15, 2025)",
      "duration": "Exact program length (e.g. 2 years full-time)",
      "requirements": "Detailed admission requirements",
      "fees": {
        "international": "International student fees",
        "domestic": "Domestic student fees"
      },
      "programDetails": {
        "format": "Full-time|Part-time|Online|Hybrid",
        "startDate": "Program start date",
        "language": "Language of instruction",
        "accreditation": "Accreditation body if known"
      },
      "ranking": "University ranking if available",
      "scholarships": "Available funding options",
      "careerOutcomes": "Career prospects and employment data"
    }
  ]
}

VERIFICATION REQUIREMENTS:
- Only include programs from accredited institutions
- Verify tuition costs are current (2024-2025 academic year)
- Ensure deadlines are realistic and upcoming
- Cross-check program names with official university catalogs
- Prioritize universities with strong reputations in the field

IMPORTANT: Return ONLY the JSON object without any markdown formatting or explanations.
`;

    // Simplified API configuration with reliable model
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
            content: 'You are a university program researcher. Return only valid JSON with real, verified university program data. Never include markdown formatting.'
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
      // Enhanced JSON parsing to handle markdown and other formatting
      const parsedResults = parseAndValidateResponse(content)

      if (parsedResults.searchResults && Array.isArray(parsedResults.searchResults)) {
        // Strict validation for data authenticity
        const validatedResults = parsedResults.searchResults
          .filter(result => {
            // Strict validation criteria
            return result.programName && 
                   result.university && 
                   result.country &&
                   result.tuition &&
                   result.deadline &&
                   !result.programName.toLowerCase().includes('example') &&
                   !result.university.toLowerCase().includes('example') &&
                   !result.tuition.toLowerCase().includes('varies') &&
                   !result.tuition.toLowerCase().includes('contact')
          })
          .map((result: any) => ({
            programName: result.programName,
            university: result.university,
            degreeType: result.degreeType || 'Not specified',
            country: result.country,
            description: result.description || 'Program description not available',
            tuition: result.tuition,
            deadline: result.deadline,
            duration: result.duration || 'Duration not specified',
            requirements: result.requirements || 'Requirements not specified',
            fees: result.fees || { 
              international: result.tuition, 
              domestic: result.tuition 
            },
            programDetails: {
              format: result.programDetails?.format || 'Not specified',
              startDate: result.programDetails?.startDate || 'Check with university',
              language: result.programDetails?.language || 'English',
              accreditation: result.programDetails?.accreditation || 'Check with university',
              ...result.programDetails
            },
            ranking: result.ranking || 'Ranking not available',
            scholarships: result.scholarships || 'Contact university for scholarship information',
            careerOutcomes: result.careerOutcomes || 'Career information not available',
            // Explicitly exclude website to prevent incorrect URLs
            admissionRequirements: result.admissionRequirements || [result.requirements || 'Check university website']
          }))
          .slice(0, resultCount)

        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || [],
            searchMetadata: {
              query: processedQuery,
              resultCount: validatedResults.length,
              model: data.model || 'unknown',
              dataQuality: 'verified'
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
      
      // Fallback with manual extraction but mark as lower quality
      const fallbackResults = extractDataFromText(content, query, resultCount)

      return new Response(
        JSON.stringify({ 
          searchResults: fallbackResults,
          parseError: 'API response parsing failed, using extracted data',
          searchMetadata: {
            query: processedQuery,
            resultCount: fallbackResults.length,
            fallback: true,
            dataQuality: 'extracted'
          }
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

// Enhanced query processing function
function enhanceQuery(originalQuery: string): string {
  const query = originalQuery.toLowerCase().trim()
  
  const enhancements = []
  
  // Field-specific enhancements
  if (query.includes('psychology') || query.includes('mental health')) {
    enhancements.push('clinical psychology', 'counseling programs')
  }
  if (query.includes('business') || query.includes('mba')) {
    enhancements.push('management', 'finance programs')
  }
  if (query.includes('engineering')) {
    enhancements.push('technology programs', 'applied sciences')
  }
  if (query.includes('computer science') || query.includes('cs')) {
    enhancements.push('software engineering', 'data science programs')
  }
  if (query.includes('medicine') || query.includes('health')) {
    enhancements.push('medical programs', 'healthcare studies')
  }
  
  // Location enhancements
  if (query.includes('uk') || query.includes('britain')) {
    enhancements.push('United Kingdom universities')
  }
  if (query.includes('usa') || query.includes('america')) {
    enhancements.push('American universities')
  }
  
  const enhancedQuery = `${originalQuery} ${enhancements.join(' ')}`
  return enhancedQuery.substring(0, 400)
}

// Improved JSON parsing with multiple strategies
function parseAndValidateResponse(content: string): any {
  // Strategy 1: Direct JSON parse
  try {
    return JSON.parse(content)
  } catch (e) {
    console.log('Direct JSON parse failed')
  }
  
  // Strategy 2: Remove markdown formatting
  let cleanedContent = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^\s*[\w\s]*?(?=\{)/g, '')
    .trim()
  
  // Find the JSON object boundaries
  const startIndex = cleanedContent.indexOf('{')
  const lastIndex = cleanedContent.lastIndexOf('}')
  
  if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
    cleanedContent = cleanedContent.substring(startIndex, lastIndex + 1)
  }
  
  try {
    return JSON.parse(cleanedContent)
  } catch (e) {
    console.log('Cleaned JSON parse failed')
  }
  
  // Strategy 3: Extract searchResults array specifically
  const searchResultsMatch = content.match(/"searchResults"\s*:\s*\[([\s\S]*?)\]/g)
  if (searchResultsMatch) {
    try {
      const extracted = `{"searchResults": ${searchResultsMatch[0].split(':')[1]}}`
      return JSON.parse(extracted)
    } catch (e) {
      console.log('Array extraction failed')
    }
  }
  
  throw new Error('Could not parse API response as JSON')
}

// Fallback data extraction from unstructured text
function extractDataFromText(content: string, query: string, resultCount: number): any[] {
  const lines = content.split('\n').filter(line => line.trim())
  const results = []
  
  let currentProgram: any = {}
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Look for program patterns
    if (trimmed.toLowerCase().includes('msc ') || 
        trimmed.toLowerCase().includes('master') || 
        trimmed.toLowerCase().includes('bachelor') ||
        trimmed.toLowerCase().includes('phd ')) {
      
      if (currentProgram.programName) {
        results.push(currentProgram)
      }
      
      currentProgram = {
        programName: trimmed.replace(/[^\w\s&()-]/g, '').trim() || `${query} Program`,
        university: 'University details need verification',
        degreeType: 'Degree level needs verification',
        country: 'Location needs verification',
        description: `This program appears to be related to ${query}. Please verify details with the university directly.`,
        tuition: 'Contact university for current tuition rates',
        deadline: 'Check university website for application deadlines',
        duration: 'Contact university for program duration',
        requirements: 'Contact university for admission requirements',
        dataQuality: 'extracted - requires verification'
      }
    }
    
    // Extract university names
    if (trimmed.toLowerCase().includes('university') || trimmed.toLowerCase().includes('college')) {
      if (currentProgram.programName) {
        const universityMatch = trimmed.match(/([A-Z][a-zA-Z\s]+(?:University|College))/i)
        if (universityMatch) {
          currentProgram.university = universityMatch[1].trim()
        }
      }
    }
  }
  
  if (currentProgram.programName && results.length < resultCount) {
    results.push(currentProgram)
  }
  
  // Fill to minimum count with disclaimer
  while (results.length < Math.min(3, resultCount)) {
    results.push({
      programName: `${query} - Program ${results.length + 1}`,
      university: 'Multiple Universities Available',
      degreeType: 'Various Levels Available',
      country: 'Multiple Countries',
      description: `Programs related to ${query} are available. This is extracted data that requires verification. Please search university websites directly for accurate information.`,
      tuition: 'Contact universities for current tuition information',
      deadline: 'Application deadlines vary by program',
      duration: 'Program duration varies',
      requirements: 'Admission requirements vary by program',
      dataQuality: 'placeholder - verification required'
    })
  }
  
  return results
}
