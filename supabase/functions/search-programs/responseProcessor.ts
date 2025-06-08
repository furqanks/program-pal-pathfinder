
export function processSearchResponse(data: any, resultCount: number, query: string) {
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response structure from API')
  }

  const content = data.choices[0].message.content
  console.log('Raw response length:', content.length)

  // Parse response for structured data
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
    console.log('No structured JSON found, using text response')
  }

  let searchResults = []
  
  if (parsedPrograms.length > 0) {
    console.log('Using structured data:', parsedPrograms.length, 'programs')
    searchResults = parsedPrograms.map((program: any) => ({
      programName: program.programName || program.program || 'Program name not specified',
      university: program.university || program.institution || 'University not specified', 
      degreeType: program.degreeType || program.degree || 'Degree type not specified',
      country: program.country || program.location || 'Location not specified',
      description: program.description || 'Program details available on university website',
      tuition: program.tuition || program.fees || program.feeRange || 'Contact university for current fees',
      deadline: program.deadline || program.applicationDeadline || 'Check university website for deadlines',
      duration: program.duration || 'Duration varies',
      requirements: program.requirements || program.admissionRequirements || 'Check university for requirements',
      website: program.website || program.link || null,
      fees: {
        range: program.tuition || program.fees || program.feeRange || 'Contact university for current fees',
        note: 'Verify current fees directly with the university'
      }
    })).slice(0, resultCount)
  } else {
    console.log('Using text response')
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

  return {
    searchResults,
    citations: data.citations || [],
    rawContent: content,
    searchMetadata: {
      query: query,
      resultCount: searchResults.length,
      requestedCount: resultCount,
      model: data.model || 'llama-3.1-sonar-large-128k-online',
      hasStructuredData: parsedPrograms.length > 0,
      disclaimer: 'All information sourced from official university websites via Perplexity AI.'
    }
  }
}
