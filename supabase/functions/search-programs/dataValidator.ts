
// Data validation and quality assessment utilities

export function validateProgramData(result: any, originalQuery: string): boolean {
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

export function sanitizeAndEnhanceProgramData(result: any): any {
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

export function assessDataQuality(results: any[]): string {
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

export function calculateSearchQuality(results: any[], query: string): number {
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
