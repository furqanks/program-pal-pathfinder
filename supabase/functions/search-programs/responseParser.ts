
// Enhanced response parsing and validation utilities

export function parseAndValidateResponse(content: string): any {
  console.log('Parsing response content length:', content.length)
  
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
      console.log('Successfully parsed JSON with structure:', Object.keys(parsed))
      
      // Handle both "programs" and "searchResults" arrays
      if (parsed.programs && Array.isArray(parsed.programs)) {
        console.log('Found programs array with length:', parsed.programs.length)
        return { programs: parsed.programs }
      } else if (parsed.searchResults && Array.isArray(parsed.searchResults)) {
        console.log('Found searchResults array with length:', parsed.searchResults.length)
        return { programs: parsed.searchResults }
      } else if (Array.isArray(parsed)) {
        console.log('Found direct array with length:', parsed.length)
        return { programs: parsed }
      } else {
        console.log('Parsed object does not contain expected array structure')
      }
    } catch (e) {
      console.log('Standard JSON parsing failed:', e.message)
    }
  }

  // Strategy 2: Extract array content with better regex
  const arrayPatterns = [
    /"programs"\s*:\s*\[([\s\S]*?)\]/,
    /"searchResults"\s*:\s*\[([\s\S]*?)\]/,
    /\[\s*\{[\s\S]*?"programName"[\s\S]*?\}\s*(?:,\s*\{[\s\S]*?"programName"[\s\S]*?\}\s*)*\]/
  ]

  for (const pattern of arrayPatterns) {
    const match = content.match(pattern)
    if (match) {
      try {
        let arrayContent = match[0]
        if (!arrayContent.startsWith('[')) {
          arrayContent = `{${arrayContent}}`
        }
        const parsed = JSON.parse(arrayContent)
        if (Array.isArray(parsed)) {
          console.log('Extracted array directly with length:', parsed.length)
          return { programs: parsed }
        } else if (parsed.programs || parsed.searchResults) {
          const programs = parsed.programs || parsed.searchResults
          console.log('Extracted programs from object with length:', programs.length)
          return { programs }
        }
      } catch (e) {
        console.log('Array extraction failed for pattern:', e.message)
      }
    }
  }

  // Strategy 3: Find individual program objects with enhanced regex
  const programPattern = /\{[^{}]*?"programName"[^{}]*?(?:"university"[^{}]*?)?(?:"degreeType"[^{}]*?)?\}/g
  const programMatches = content.match(programPattern)
  
  if (programMatches && programMatches.length > 0) {
    try {
      const programs = []
      for (const match of programMatches) {
        try {
          const program = JSON.parse(match)
          if (program.programName && program.university) {
            programs.push(program)
          }
        } catch (e) {
          console.log('Failed to parse individual program:', e.message)
        }
      }
      
      if (programs.length > 0) {
        console.log('Extracted individual programs with length:', programs.length)
        return { programs }
      }
    } catch (e) {
      console.log('Individual program parsing failed:', e.message)
    }
  }

  // Strategy 4: Try to find any JSON-like structures with program data
  const flexiblePattern = /\{[\s\S]*?"programName"[\s\S]*?\}/g
  const flexibleMatches = content.match(flexiblePattern)
  
  if (flexibleMatches && flexibleMatches.length > 0) {
    const validPrograms = []
    
    for (const match of flexibleMatches) {
      try {
        // Try to balance braces properly
        let balanced = match
        const openBraces = (balanced.match(/\{/g) || []).length
        const closeBraces = (balanced.match(/\}/g) || []).length
        
        if (openBraces > closeBraces) {
          balanced += '}'.repeat(openBraces - closeBraces)
        }
        
        const program = JSON.parse(balanced)
        if (program.programName && typeof program.programName === 'string' && program.programName.length > 5) {
          validPrograms.push(program)
        }
      } catch (e) {
        console.log('Failed to parse flexible match:', e.message)
      }
    }
    
    if (validPrograms.length > 0) {
      console.log('Extracted flexible programs with length:', validPrograms.length)
      return { programs: validPrograms }
    }
  }

  console.log('All parsing strategies failed')
  throw new Error('Could not parse API response as valid JSON with program data')
}
