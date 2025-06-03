
// Response parsing and validation utilities

export function parseAndValidateResponse(content: string): any {
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
