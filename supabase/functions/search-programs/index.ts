
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

    // Dynamic prompt based on user query analysis
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
            content: 'You are a university program researcher with access to official university websites and databases. Search for real, currently available university programs based on user queries. Return only valid JSON with real, verified program data from official sources. Never include markdown formatting or generic placeholder data.'
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
      // Improved JSON parsing with flexible structure handling
      const parsedResults = parseAndValidateResponse(content)

      if (parsedResults.programs && Array.isArray(parsedResults.programs)) {
        // Enhanced validation for data authenticity
        const validatedResults = parsedResults.programs
          .filter(result => validateProgramData(result, query))
          .map((result: any) => sanitizeAndEnhanceProgramData(result))
          .slice(0, resultCount)

        // Check if we have quality results
        if (validatedResults.length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'No valid programs found matching your criteria. Please try a more specific query or different keywords.',
              suggestions: generateSearchSuggestions(query),
              searchMetadata: {
                query: processedQuery,
                resultCount: 0,
                dataQuality: 'no-results'
              }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const dataQuality = assessDataQuality(validatedResults);

        return new Response(
          JSON.stringify({ 
            searchResults: validatedResults,
            citations: data.citations || [],
            searchMetadata: {
              query: processedQuery,
              resultCount: validatedResults.length,
              model: data.model || 'unknown',
              dataQuality: dataQuality,
              searchQuality: calculateSearchQuality(validatedResults, query)
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
      
      // Return constructive error with suggestions
      return new Response(
        JSON.stringify({ 
          error: 'Unable to parse search results. This might be due to a very specific or unusual query.',
          suggestions: generateSearchSuggestions(query),
          searchMetadata: {
            query: processedQuery,
            resultCount: 0,
            fallback: true,
            parseError: parseError.message
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

// Create dynamic prompt based on user query analysis
function createDynamicPrompt(query: string, resultCount: number): string {
  const lowerQuery = query.toLowerCase()
  const queryAnalysis = analyzeQuery(lowerQuery)
  
  // Build dynamic prompt sections
  let programType = queryAnalysis.programType
  let countryGuidance = queryAnalysis.countryGuidance
  let fieldFocus = queryAnalysis.fieldFocus
  let budgetConsiderations = queryAnalysis.budgetConsiderations
  let formatPreferences = queryAnalysis.formatPreferences

  return `
Search for REAL, currently available ${programType} that match: "${query}"

${countryGuidance}
${fieldFocus}
${budgetConsiderations}
${formatPreferences}

TRUSTED SOURCES ONLY:
- Search ONLY official university websites (.edu, .ac.uk, .edu.au, etc.)
- Use official university prospectuses and admissions pages
- Reference official government education databases
- Verify information from recognized university ranking sites

AVOID:
- Third-party education portals or aggregators
- Unofficial reviews or comparison sites
- Outdated or cached information
- Generic program descriptions

CRITICAL REQUIREMENTS:
1. Return ONLY actual programs that exist at real universities with official web presence
2. Verify each program exists on the university's official website
3. Include specific, current tuition fees and application deadlines
4. Focus on programs accepting applications for 2025 intake (September/Fall or January/Spring)
5. Return exactly ${resultCount} real programs with verified information
6. All data must be traceable to official university sources

Return ONLY a valid JSON object (no markdown formatting) with this flexible structure:
{
  "programs": [
    {
      "programName": "Exact program title from official university source",
      "university": "Full official university name",
      "degreeType": "Degree level (e.g., Master's, Bachelor's, PhD)",
      "country": "Country where university is located",
      "description": "Detailed program description with curriculum and focus areas",
      "tuition": "Exact fee amount with currency (e.g., £15,000 per year for international students)",
      "deadline": "Specific application deadline (e.g., March 31, 2025)",
      "duration": "Program length (e.g., 1 year full-time, 2 years part-time)",
      "requirements": "Detailed admission requirements including academic qualifications",
      "fees": {
        "international": "International student fees if available",
        "domestic": "Domestic student fees if available"
      },
      "details": {
        "format": "Full-time/Part-time/Online/Hybrid",
        "startDate": "Start date (e.g., September 2025)",
        "language": "Language of instruction",
        "accreditation": "Relevant accreditation information"
      },
      "ranking": "University ranking information if available",
      "scholarships": "Available funding and scholarship options",
      "careers": "Career prospects and opportunities",
      "website": "Official program webpage URL"
    }
  ]
}

VALIDATION RULES:
- Program names must be specific and real (not generic like "Computer Science Program")
- Universities must be real, accredited institutions with official websites
- Tuition fees must be specific amounts when available from official sources
- Deadlines should be actual dates from official university sources
- All information must be verifiable from official university websites
- Country should match the actual location of the university
- Website URLs should link to official university pages

Return ONLY the JSON object without any markdown formatting, explanations, or additional text.
`;
}

// Enhanced query analysis function
function analyzeQuery(query: string): any {
  const analysis = {
    programType: 'university programs',
    countryGuidance: '',
    fieldFocus: '',
    budgetConsiderations: '',
    formatPreferences: ''
  }

  // Detect program type
  if (query.includes('mres') || query.includes('masters by research')) {
    analysis.programType = 'Masters by Research (MRes) programs'
  } else if (query.includes('phd') || query.includes('doctorate') || query.includes('doctoral')) {
    analysis.programType = 'PhD/Doctorate programs'
  } else if (query.includes('master') || query.includes('msc') || query.includes('ma') || query.includes('meng')) {
    analysis.programType = 'Masters programs'
  } else if (query.includes('bachelor') || query.includes('undergraduate') || query.includes('bsc') || query.includes('ba')) {
    analysis.programType = 'Bachelor\'s/Undergraduate programs'
  } else if (query.includes('mba')) {
    analysis.programType = 'MBA programs'
  } else if (query.includes('postgrad') || query.includes('graduate')) {
    analysis.programType = 'Postgraduate programs'
  }

  // Detect country/region preferences
  if (query.includes('uk') || query.includes('britain') || query.includes('england') || query.includes('scotland') || query.includes('wales')) {
    analysis.countryGuidance = 'FOCUS: United Kingdom universities (.ac.uk domains). Include England, Scotland, Wales, and Northern Ireland institutions.'
  } else if (query.includes('us') || query.includes('usa') || query.includes('america') || query.includes('united states')) {
    analysis.countryGuidance = 'FOCUS: United States universities (.edu domains). Include both public and private institutions.'
  } else if (query.includes('canada') || query.includes('canadian')) {
    analysis.countryGuidance = 'FOCUS: Canadian universities (.ca domains). Include both English and French-speaking institutions.'
  } else if (query.includes('australia') || query.includes('australian')) {
    analysis.countryGuidance = 'FOCUS: Australian universities (.edu.au domains).'
  } else if (query.includes('europe') || query.includes('european')) {
    analysis.countryGuidance = 'FOCUS: European universities. Include EU member countries and major European education hubs.'
  }

  // Detect field focus
  if (query.includes('computer') || query.includes('tech') || query.includes('software') || query.includes('it')) {
    analysis.fieldFocus = 'FIELD FOCUS: Technology, Computing, Software Engineering, and IT programs.'
  } else if (query.includes('business') || query.includes('management') || query.includes('finance')) {
    analysis.fieldFocus = 'FIELD FOCUS: Business, Management, Finance, and related commercial programs.'
  } else if (query.includes('medicine') || query.includes('health') || query.includes('medical')) {
    analysis.fieldFocus = 'FIELD FOCUS: Medical, Health Sciences, and Healthcare programs.'
  } else if (query.includes('engineering') || query.includes('mechanical') || query.includes('civil') || query.includes('electrical')) {
    analysis.fieldFocus = 'FIELD FOCUS: Engineering programs across all specializations.'
  } else if (query.includes('data') || query.includes('analytics') || query.includes('science')) {
    analysis.fieldFocus = 'FIELD FOCUS: Data Science, Analytics, and related quantitative programs.'
  }

  // Detect budget considerations
  if (query.includes('budget') || query.includes('affordable') || query.includes('cheap') || query.includes('low cost')) {
    analysis.budgetConsiderations = 'BUDGET PRIORITY: Emphasize affordable options, scholarships, and funding opportunities. Include public universities and programs with lower tuition fees.'
  } else if (query.includes('funding') || query.includes('scholarship') || query.includes('financial aid')) {
    analysis.budgetConsiderations = 'FUNDING FOCUS: Highlight available scholarships, grants, and financial aid options for each program.'
  }

  // Detect format preferences
  if (query.includes('online') || query.includes('distance') || query.includes('remote')) {
    analysis.formatPreferences = 'FORMAT PREFERENCE: Prioritize online, distance learning, and remote study options.'
  } else if (query.includes('part time') || query.includes('part-time') || query.includes('evening')) {
    analysis.formatPreferences = 'FORMAT PREFERENCE: Focus on part-time and flexible study options.'
  }

  return analysis
}

// Enhanced query processing function
function enhanceQuery(originalQuery: string): string {
  const query = originalQuery.toLowerCase().trim()
  const enhancements = []
  
  // Academic level enhancements
  if (query.includes('master') && !query.includes('mres')) {
    enhancements.push('postgraduate', 'graduate degree')
  }
  
  if (query.includes('bachelor') || query.includes('undergraduate')) {
    enhancements.push('first degree', 'undergraduate study')
  }
  
  if (query.includes('phd') || query.includes('doctorate')) {
    enhancements.push('research degree', 'doctoral study')
  }

  // Field-specific enhancements
  if (query.includes('computer') || query.includes('tech')) {
    enhancements.push('information technology', 'software development')
  }
  
  if (query.includes('business') || query.includes('management')) {
    enhancements.push('commerce', 'administration')
  }
  
  if (query.includes('data') || query.includes('analytics')) {
    enhancements.push('statistics', 'machine learning', 'artificial intelligence')
  }
  
  // Location enhancements
  if (query.includes('uk') || query.includes('britain')) {
    enhancements.push('Russell Group', 'British higher education')
  }
  
  if (query.includes('usa') || query.includes('america')) {
    enhancements.push('Ivy League', 'American universities')
  }
  
  // Quality indicators
  if (query.includes('top') || query.includes('best') || query.includes('ranking')) {
    enhancements.push('highly ranked', 'prestigious', 'accredited')
  }

  // Budget considerations
  if (query.includes('budget') || query.includes('affordable')) {
    enhancements.push('scholarships available', 'financial assistance')
  }

  const enhancedQuery = `${originalQuery} ${enhancements.join(' ')}`
  return enhancedQuery.substring(0, 500)
}

// Robust JSON parsing with multiple strategies
function parseAndValidateResponse(content: string): any {
  // Strategy 1: Clean and parse standard JSON
  let cleanedContent = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^\s*[\w\s]*?(?=\{)/g, '')
    .trim()

  const jsonStart = cleanedContent.indexOf('{')
  const jsonEnd = cleanedContent.lastIndexOf('}')
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1)
    
    try {
      const parsed = JSON.parse(cleanedContent)
      
      // Handle both "programs" and "searchResults" arrays
      if (parsed.programs && Array.isArray(parsed.programs)) {
        return { programs: parsed.programs }
      } else if (parsed.searchResults && Array.isArray(parsed.searchResults)) {
        return { programs: parsed.searchResults }
      } else if (Array.isArray(parsed)) {
        return { programs: parsed }
      }
    } catch (e) {
      console.log('Standard JSON parsing failed:', e.message)
    }
  }

  // Strategy 2: Extract array content
  const arrayMatches = [
    content.match(/"programs"\s*:\s*\[([\s\S]*?)\]/),
    content.match(/"searchResults"\s*:\s*\[([\s\S]*?)\]/)
  ].filter(Boolean)

  for (const match of arrayMatches) {
    try {
      const arrayContent = match[0]
      const fullJson = `{${arrayContent}}`
      const parsed = JSON.parse(fullJson)
      if (parsed.programs || parsed.searchResults) {
        return { programs: parsed.programs || parsed.searchResults }
      }
    } catch (e) {
      console.log('Array extraction failed:', e.message)
    }
  }

  // Strategy 3: Find individual program objects
  const programPattern = /\{[^{}]*?"programName"[^{}]*?\}/g
  const programMatches = content.match(programPattern)
  
  if (programMatches && programMatches.length > 0) {
    try {
      const programs = programMatches.map(match => JSON.parse(match))
      return { programs }
    } catch (e) {
      console.log('Individual program parsing failed:', e.message)
    }
  }

  throw new Error('Could not parse API response as valid JSON')
}

// Improved validation for program data quality
function validateProgramData(result: any, originalQuery: string): boolean {
  if (!result.programName || !result.university || !result.degreeType) {
    return false
  }

  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  
  // Reject obviously generic or placeholder data
  const genericIndicators = [
    'program name', 'degree program', 'university name', 'example university',
    'multiple universities', 'various universities', 'tbd', 'tba', 'contact university',
    'check website', 'varies', 'placeholder'
  ]
  
  for (const indicator of genericIndicators) {
    if (programName.includes(indicator) || university.includes(indicator)) {
      return false
    }
  }

  // Check for overly generic program names
  if (programName.length < 10 && !programName.includes('mba') && !programName.includes('phd')) {
    return false
  }

  // Validate university name format
  if (university.length < 5 || university.split(' ').length < 2) {
    return false
  }

  return true
}

// Enhanced data sanitization and enrichment
function sanitizeAndEnhanceProgramData(result: any): any {
  return {
    programName: result.programName || 'Program name verification needed',
    university: result.university || 'University verification needed',
    degreeType: result.degreeType || 'Degree type not specified',
    country: result.country || 'Location verification needed',
    description: result.description || 'Program details require verification from official university website.',
    tuition: result.tuition || 'Contact university for current tuition information',
    deadline: result.deadline || 'Check university website for application deadlines',
    duration: result.duration || 'Duration varies by program format',
    requirements: result.requirements || 'Check university website for detailed admission requirements',
    fees: {
      international: result.fees?.international || result.tuition || 'Check university for international fees',
      domestic: result.fees?.domestic || 'Check university for domestic fees'
    },
    details: {
      format: result.details?.format || result.programDetails?.format || 'Check program format with university',
      startDate: result.details?.startDate || result.programDetails?.startDate || 'Multiple intake dates available',
      language: result.details?.language || result.programDetails?.language || 'Check language requirements',
      accreditation: result.details?.accreditation || result.programDetails?.accreditation || 'Check accreditation status'
    },
    ranking: result.ranking || 'University ranking information available on request',
    scholarships: result.scholarships || 'Contact university for funding opportunities',
    careers: result.careers || result.careerOutcomes || 'Career guidance available through university',
    website: result.website || 'Visit university website for program details'
  }
}

// Data quality assessment
function assessDataQuality(results: any[]): string {
  const qualityMetrics = {
    hasSpecificTuition: 0,
    hasSpecificDeadlines: 0,
    hasDetailedDescriptions: 0,
    hasOfficialWebsites: 0
  }

  results.forEach(result => {
    if (result.tuition && !result.tuition.toLowerCase().includes('contact') && !result.tuition.toLowerCase().includes('check')) {
      qualityMetrics.hasSpecificTuition++
    }
    if (result.deadline && !result.deadline.toLowerCase().includes('check') && !result.deadline.toLowerCase().includes('varies')) {
      qualityMetrics.hasSpecificDeadlines++
    }
    if (result.description && result.description.length > 50) {
      qualityMetrics.hasDetailedDescriptions++
    }
    if (result.website && (result.website.includes('.edu') || result.website.includes('.ac.'))) {
      qualityMetrics.hasOfficialWebsites++
    }
  })

  const totalResults = results.length
  const qualityScore = (
    qualityMetrics.hasSpecificTuition + 
    qualityMetrics.hasSpecificDeadlines + 
    qualityMetrics.hasDetailedDescriptions + 
    qualityMetrics.hasOfficialWebsites
  ) / (totalResults * 4)

  if (qualityScore >= 0.8) return 'verified'
  if (qualityScore >= 0.6) return 'good'
  if (qualityScore >= 0.4) return 'moderate'
  return 'needs-verification'
}

// Calculate search quality score
function calculateSearchQuality(results: any[], query: string): number {
  const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2)
  let totalRelevance = 0

  results.forEach(result => {
    const programText = `${result.programName} ${result.description} ${result.university}`.toLowerCase()
    const matchingWords = queryWords.filter(word => programText.includes(word))
    const relevance = matchingWords.length / queryWords.length
    totalRelevance += relevance
  })

  return Math.round((totalRelevance / results.length) * 100)
}

// Generate helpful search suggestions
function generateSearchSuggestions(query: string): string[] {
  const suggestions = []
  const lowerQuery = query.toLowerCase()

  if (!lowerQuery.includes('master') && !lowerQuery.includes('bachelor') && !lowerQuery.includes('phd')) {
    suggestions.push('Try specifying the degree level (e.g., "Masters in", "Bachelor of", "PhD in")')
  }

  if (!lowerQuery.includes('uk') && !lowerQuery.includes('us') && !lowerQuery.includes('canada') && !lowerQuery.includes('australia')) {
    suggestions.push('Consider adding a country preference (e.g., "UK", "USA", "Canada")')
  }

  if (lowerQuery.length < 20) {
    suggestions.push('Try using more specific keywords about your field of interest')
  }

  suggestions.push('Include specific requirements like "budget friendly", "online", or "2025 intake"')
  suggestions.push('Try alternative terms for your field of study')

  return suggestions.slice(0, 3)
}
