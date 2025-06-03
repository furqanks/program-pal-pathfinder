
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

    // Enhanced prompt with better structure and comprehensive requirements
    const enhancedPrompt = `
You are a specialized university program search engine. Search for university/college programs related to: "${processedQuery}"

CRITICAL REQUIREMENTS:
1. Find exactly ${resultCount} diverse, relevant programs from different universities
2. Focus on REAL, currently available programs with ACTUAL details
3. Include programs from multiple countries and universities
4. Prioritize programs with complete fee information
5. Search across undergraduate, graduate, and doctoral levels
6. Include both traditional and online/hybrid formats

For each program, provide information in this EXACT JSON structure:
{
  "searchResults": [
    {
      "programName": "EXACT official program title",
      "university": "FULL official university name",
      "degreeType": "Bachelor's|Master's|PhD|Certificate|Diploma|Professional",
      "country": "FULL country name",
      "description": "COMPREHENSIVE 150+ word description including curriculum, specializations, research opportunities, accreditation, and unique features",
      "tuition": "SPECIFIC amount with currency (e.g., '$45,000 per year', '£25,000 annually')",
      "deadline": "SPECIFIC application deadline (e.g., 'January 15, 2025', 'Rolling admission')",
      "duration": "PRECISE program length (e.g., '2 years full-time', '18 months', '4 years')",
      "website": "DIRECT program URL or university admissions page",
      "requirements": "DETAILED admission requirements including GPA, test scores, prerequisites",
      "fees": {
        "international": "International student fees with currency",
        "domestic": "Domestic student fees with currency",
        "eu": "EU student fees if applicable"
      },
      "programDetails": {
        "format": "Full-time|Part-time|Online|Hybrid|Evening|Weekend",
        "startDate": "Program start dates (e.g., 'September 2025', 'Fall/Spring')",
        "language": "Primary language of instruction",
        "credits": "Total credits or ECTS required",
        "accreditation": "Professional accreditation bodies"
      },
      "admissionRequirements": [
        "Specific requirement 1 (e.g., 'Bachelor's degree with 3.0 GPA')",
        "Specific requirement 2 (e.g., 'IELTS 7.0 or TOEFL 100')",
        "Specific requirement 3 (e.g., 'Two letters of recommendation')"
      ],
      "ranking": "University or program ranking if available",
      "scholarships": "Available scholarships and financial aid options",
      "careerOutcomes": "Employment statistics and typical career paths",
      "applicationProcess": "Step-by-step application process",
      "contactInfo": {
        "email": "Admissions email",
        "phone": "Contact number",
        "address": "Physical address"
      }
    }
  ]
}

SEARCH STRATEGY:
- Search current university websites and official sources
- Include prestigious, mid-tier, and accessible institutions
- Cover multiple geographic regions (US, UK, Canada, Australia, EU, Asia)
- Include both research universities and professional schools
- Search for programs with different entry requirements
- Include programs with scholarships and funding opportunities

QUALITY REQUIREMENTS:
- Each program MUST have specific tuition information
- Each program MUST have clear admission requirements
- Each program MUST have accurate contact details
- Descriptions must be detailed and informative
- All information must be current (2024-2025 academic year)
- Avoid generic or placeholder information

IMPORTANT: Return ONLY the JSON object. Do not include explanatory text before or after the JSON.
`;

    // Updated API configurations with valid models and domain filters
    const apiConfigurations = [
      {
        model: 'llama-3.1-sonar-large-128k-online',
        max_tokens: 6000,
        temperature: 0.1,
        search_recency_filter: "month",
        search_domain_filter: ['edu', 'ac.uk', 'university.edu', 'college.edu']
      },
      {
        model: 'llama-3.1-sonar-small-128k-online', 
        max_tokens: 5000,
        temperature: 0.2,
        search_recency_filter: "week"
      },
      {
        model: 'llama-3.1-sonar-large-128k-online',
        max_tokens: 4000,
        temperature: 0.3,
        search_recency_filter: "month"
      }
    ]

    let response, data;
    let lastError = null;

    for (const config of apiConfigurations) {
      try {
        console.log(`Attempting API call with model: ${config.model}`)
        
        const requestBody = {
          model: config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a specialized university program search engine. Always respond with valid JSON containing comprehensive, accurate program information. Focus on real programs with complete details including specific tuition costs, deadlines, and requirements.'
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          max_tokens: config.max_tokens,
          temperature: config.temperature,
          top_p: 0.9,
          return_citations: true,
          search_recency_filter: config.search_recency_filter
        }

        // Only add search_domain_filter if it exists in config
        if (config.search_domain_filter) {
          requestBody.search_domain_filter = config.search_domain_filter
        }
        
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (response.ok) {
          data = await response.json()
          console.log(`Successful API response with model: ${config.model}`)
          break
        } else {
          lastError = await response.text()
          console.log(`API attempt failed with ${config.model}:`, lastError)
        }
      } catch (error) {
        lastError = error.message
        console.log(`API attempt error with ${config.model}:`, error.message)
      }
    }

    if (!response || !response.ok) {
      console.error('All Perplexity API attempts failed:', lastError)
      return new Response(
        JSON.stringify({ error: `All API attempts failed. Last error: ${lastError}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Final successful Perplexity response:', JSON.stringify(data, null, 2))

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Invalid response structure from Perplexity API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const content = data.choices[0].message.content
    console.log('Raw content from Perplexity:', content)

    try {
      // Enhanced JSON parsing with multiple strategies
      let parsedResults = parseApiResponse(content)

      // Validate and enhance the results
      if (parsedResults.searchResults && Array.isArray(parsedResults.searchResults)) {
        // Enhanced validation and cleaning
        const validatedResults = parsedResults.searchResults
          .filter(result => result.programName && result.university && result.country)
          .map((result: any) => ({
            programName: result.programName || 'Program name not specified',
            university: result.university || 'University not specified',
            degreeType: result.degreeType || 'Degree type not specified',
            country: result.country || 'Country not specified',
            description: result.description || 'Description not available',
            tuition: result.tuition || result.fees?.international || result.fees?.domestic || 'Contact university for tuition details',
            deadline: result.deadline || result.applicationDeadline || 'Check university website for deadlines',
            duration: result.duration || 'Duration varies',
            website: result.website || `Search for ${result.university} ${result.programName}`,
            requirements: result.requirements || (result.admissionRequirements ? result.admissionRequirements.join(', ') : 'Check university requirements'),
            fees: result.fees || { international: 'Contact university', domestic: 'Contact university' },
            programDetails: {
              format: result.programDetails?.format || 'Contact university',
              startDate: result.programDetails?.startDate || 'Various start dates',
              language: result.programDetails?.language || 'English',
              credits: result.programDetails?.credits || 'Varies',
              accreditation: result.programDetails?.accreditation || 'Check accreditation status',
              ...result.programDetails
            },
            admissionRequirements: result.admissionRequirements || ['Check university website'],
            ranking: result.ranking || 'Ranking varies',
            scholarships: result.scholarships || 'Various scholarships may be available',
            careerOutcomes: result.careerOutcomes || 'Various career opportunities available',
            applicationProcess: result.applicationProcess || 'Apply through university admissions',
            contactInfo: result.contactInfo || { email: 'Contact admissions office' }
          }))
          .slice(0, resultCount) // Ensure we don't exceed requested count

        // If we don't have enough results, attempt to generate more with a supplementary search
        if (validatedResults.length < Math.min(resultCount, 5)) {
          console.log(`Only found ${validatedResults.length} results, attempting supplementary search`)
          const supplementaryResults = await performSupplementarySearch(query, perplexityApiKey, resultCount - validatedResults.length)
          validatedResults.push(...supplementaryResults)
        }

        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || [],
            searchMetadata: {
              query: processedQuery,
              resultCount: validatedResults.length,
              model: data.model || 'unknown'
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        throw new Error('Invalid results structure in API response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Content that failed to parse:', content)
      
      // Enhanced fallback with intelligent content extraction
      const fallbackResults = await generateFallbackResults(content, query, resultCount)

      return new Response(
        JSON.stringify({ 
          searchResults: fallbackResults,
          parseError: 'Failed to parse structured data, showing intelligently extracted results',
          searchMetadata: {
            query: processedQuery,
            resultCount: fallbackResults.length,
            fallback: true
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
  
  // Add relevant search terms based on query analysis
  const enhancements = []
  
  // Field-specific enhancements
  if (query.includes('psychology') || query.includes('mental health')) {
    enhancements.push('clinical psychology', 'counseling', 'therapy programs')
  }
  if (query.includes('business') || query.includes('mba')) {
    enhancements.push('management', 'entrepreneurship', 'finance')
  }
  if (query.includes('engineering')) {
    enhancements.push('technology', 'applied sciences', 'technical programs')
  }
  if (query.includes('computer science') || query.includes('cs')) {
    enhancements.push('software engineering', 'data science', 'artificial intelligence')
  }
  
  // Location-specific enhancements
  if (query.includes('uk') || query.includes('britain') || query.includes('england')) {
    enhancements.push('United Kingdom universities', 'British higher education')
  }
  if (query.includes('usa') || query.includes('america') || query.includes('us')) {
    enhancements.push('American universities', 'US colleges')
  }
  
  // Degree level enhancements
  if (query.includes('master') || query.includes('msc') || query.includes('ma')) {
    enhancements.push('graduate programs', 'postgraduate degrees')
  }
  if (query.includes('phd') || query.includes('doctorate')) {
    enhancements.push('doctoral programs', 'research degrees')
  }
  
  const enhancedQuery = `${originalQuery} ${enhancements.join(' ')}`
  return enhancedQuery.substring(0, 500) // Limit query length
}

// Enhanced JSON parsing with multiple strategies
function parseApiResponse(content: string): any {
  // Strategy 1: Direct JSON parse
  try {
    return JSON.parse(content)
  } catch (e) {
    console.log('Direct JSON parse failed, trying extraction strategies')
  }
  
  // Strategy 2: Extract JSON from markdown code blocks
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1])
    } catch (e) {
      console.log('JSON block extraction failed')
    }
  }
  
  // Strategy 3: Extract any JSON-like structure
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch (e) {
      console.log('JSON structure extraction failed')
    }
  }
  
  // Strategy 4: Clean and try again
  const cleanedContent = content
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/^\s*[\w\s]*?(?=\{)/g, '')
    .replace(/\}[\s\S]*$/, '}')
    .trim()
  
  try {
    return JSON.parse(cleanedContent)
  } catch (e) {
    console.log('Cleaned JSON parse failed')
  }
  
  throw new Error('Could not parse API response as JSON')
}

// Supplementary search for when initial results are insufficient
async function performSupplementarySearch(originalQuery: string, apiKey: string, neededCount: number): Promise<any[]> {
  try {
    console.log(`Performing supplementary search for ${neededCount} additional results`)
    
    const supplementaryPrompt = `
Find ${neededCount} additional university programs related to: "${originalQuery}"

Focus on finding programs that are:
- From different universities than previous results
- In different countries or regions
- At different academic levels
- With clear tuition and admission information

Return ONLY a JSON array of programs in this format:
[
  {
    "programName": "specific program name",
    "university": "university name",
    "degreeType": "degree level",
    "country": "country name",
    "description": "detailed description",
    "tuition": "specific tuition amount",
    "deadline": "application deadline",
    "duration": "program duration",
    "requirements": "admission requirements"
  }
]
`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a university program specialist. Return only valid JSON arrays of program data.'
          },
          {
            role: 'user',
            content: supplementaryPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.2,
        search_recency_filter: "month"
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices[0].message.content
      
      try {
        const results = parseApiResponse(content)
        if (Array.isArray(results)) {
          return results.slice(0, neededCount)
        } else if (results.searchResults && Array.isArray(results.searchResults)) {
          return results.searchResults.slice(0, neededCount)
        }
      } catch (e) {
        console.log('Supplementary search parsing failed:', e)
      }
    }
  } catch (error) {
    console.log('Supplementary search failed:', error)
  }
  
  return []
}

// Enhanced fallback result generation
async function generateFallbackResults(content: string, query: string, resultCount: number): Promise<any[]> {
  const fallbackResults = []
  
  // Try to extract program information using regex patterns
  const lines = content.split('\n').filter(line => line.trim())
  
  let currentProgram: any = {}
  let programCount = 0
  
  for (const line of lines) {
    const cleanLine = line.trim()
    
    // Look for program names
    if (cleanLine.toLowerCase().includes('program') && cleanLine.includes(':')) {
      if (currentProgram.programName && programCount < resultCount) {
        fallbackResults.push(currentProgram)
        programCount++
      }
      currentProgram = {
        programName: extractAfterColon(cleanLine) || `Program related to: ${query}`,
        university: 'University information not fully parsed',
        degreeType: 'Degree type varies',
        country: 'Multiple countries available',
        description: `This program is related to ${query}. For complete details, please visit the university's official website.`,
        tuition: 'Contact university for tuition details',
        deadline: 'Check university website for application deadlines'
      }
    }
    
    // Look for university names
    if (cleanLine.toLowerCase().includes('university') || cleanLine.toLowerCase().includes('college')) {
      if (currentProgram.programName) {
        currentProgram.university = extractUniversityName(cleanLine) || currentProgram.university
      }
    }
    
    // Look for tuition information
    if (cleanLine.match(/[£$€][\d,]+/) || cleanLine.toLowerCase().includes('tuition')) {
      if (currentProgram.programName) {
        const tuitionMatch = cleanLine.match(/[£$€][\d,]+[^\s]*/g)
        if (tuitionMatch) {
          currentProgram.tuition = tuitionMatch[0]
        }
      }
    }
  }
  
  // Add the last program if it exists
  if (currentProgram.programName && programCount < resultCount) {
    fallbackResults.push(currentProgram)
    programCount++
  }
  
  // If we still don't have enough results, generate generic ones
  while (fallbackResults.length < Math.min(resultCount, 3)) {
    fallbackResults.push({
      programName: `${query} - Program ${fallbackResults.length + 1}`,
      university: 'Multiple Universities Available',
      degreeType: 'Various Degree Levels',
      country: 'Multiple Countries',
      description: `Programs related to ${query} are available at universities worldwide. This search found relevant programs but requires manual verification for complete details.`,
      tuition: 'Varies by institution and location',
      deadline: 'Application deadlines vary by program and university',
      duration: 'Program duration varies',
      website: 'Contact individual universities for program websites',
      requirements: 'Admission requirements vary by program'
    })
  }
  
  return fallbackResults
}

// Helper functions
function extractAfterColon(text: string): string | null {
  const parts = text.split(':')
  return parts.length > 1 ? parts[1].trim() : null
}

function extractUniversityName(text: string): string | null {
  const universityMatch = text.match(/([A-Z][a-zA-Z\s]+(?:University|College|Institute))/i)
  return universityMatch ? universityMatch[1].trim() : null
}
