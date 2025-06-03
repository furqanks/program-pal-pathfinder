// Enhanced data validation and quality assessment utilities

export function validateProgramData(result: any, originalQuery: string): boolean {
  if (!result.programName || !result.university || !result.degreeType) {
    console.log('Missing required fields:', { programName: result.programName, university: result.university, degreeType: result.degreeType });
    return false
  }

  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  const tuition = result.tuition ? result.tuition.toLowerCase() : ''
  
  // Reject obviously generic or placeholder data
  const genericIndicators = [
    'program name', 'degree program', 'university name', 'example university',
    'multiple universities', 'various universities', 'tbd', 'tba', 'contact university',
    'check website', 'varies by', 'placeholder', 'sample program', 'example program',
    'approximate', 'estimated', 'around', 'roughly', 'about'
  ]
  
  for (const indicator of genericIndicators) {
    if (programName.includes(indicator) || university.includes(indicator) || tuition.includes(indicator)) {
      console.log('Generic indicator found:', indicator, 'in program:', result.programName);
      return false
    }
  }

  // Enhanced validation for tuition fees
  if (result.tuition) {
    // Check for vague tuition indicators
    const vagueTuitionIndicators = [
      'varies', 'contact', 'tbc', 'tbd', 'check', 'see website', 'depends on',
      'range from', 'between', 'starting from', 'up to', 'approximately'
    ]
    
    const hasvagueTuition = vagueTuitionIndicators.some(indicator => 
      tuition.includes(indicator)
    )
    
    if (hasvagueTuition) {
      console.log('Vague tuition information found:', result.tuition);
      return false
    }

    // Ensure tuition has specific currency and amount
    const hasCurrencyAndAmount = /[£$€¥₹]\s*\d{3,}/.test(result.tuition) || /\d{3,}\s*[£$€¥₹]/.test(result.tuition)
    if (!hasCurrencyAndAmount) {
      console.log('Missing specific currency and amount in tuition:', result.tuition);
      return false
    }
  }

  // Check for overly generic program names
  if (programName.length < 10 && !programName.includes('mba') && !programName.includes('phd') && !programName.includes('llm')) {
    console.log('Program name too short:', result.programName);
    return false
  }

  // Validate university name format (should be more than just "University")
  if (university.length < 5 || university === 'university' || university === 'college') {
    console.log('Invalid university name:', result.university);
    return false
  }

  // Check for proper program name structure
  const hasProperStructure = /\b(msc|master|ma|mba|phd|doctorate|bachelor|ba|bsc|llm|pgdip|pgcert)\b/i.test(programName) ||
                            /\b(degree|diploma|certificate|program|programme)\b/i.test(programName)
  
  if (!hasProperStructure) {
    console.log('Program name lacks proper academic structure:', result.programName);
    return false
  }

  return true
}

export function sanitizeAndEnhanceProgramData(result: any): any {
  // Enhanced data cleaning with better fallbacks
  const cleanTuition = (tuition: string) => {
    if (!tuition) return 'Contact university for current tuition fees'
    
    // If it contains verification language, keep as is
    if (tuition.toLowerCase().includes('contact university') || 
        tuition.toLowerCase().includes('check university')) {
      return tuition
    }
    
    // If it has specific amounts, keep as is
    if (/[£$€¥₹]\s*\d{3,}/.test(tuition) || /\d{3,}\s*[£$€¥₹]/.test(tuition)) {
      return tuition
    }
    
    return 'Contact university for current tuition fees'
  }

  const cleanDeadline = (deadline: string) => {
    if (!deadline) return 'Check university website for application deadlines'
    
    // If it's a specific date format, keep as is
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(deadline) ||
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i.test(deadline)) {
      return deadline
    }
    
    // If it contains verification language, keep as is
    if (deadline.toLowerCase().includes('check') || deadline.toLowerCase().includes('contact')) {
      return deadline
    }
    
    return deadline.includes('rolling') ? 'Rolling admissions' : 'Check university website for application deadlines'
  }

  return {
    programName: result.programName || 'Program name requires verification',
    university: result.university || 'University name requires verification',
    degreeType: result.degreeType || 'Degree type not specified',
    country: result.country || 'Location requires verification',
    description: result.description || 'Program details require verification from official university website.',
    tuition: cleanTuition(result.tuition),
    deadline: cleanDeadline(result.deadline),
    duration: result.duration || 'Duration varies - check with university',
    requirements: result.requirements || 'Check university website for detailed admission requirements',
    fees: {
      international: result.fees?.international || cleanTuition(result.tuition) || 'Check university for international fees',
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
    website: result.website || 'Visit university website for program details',
    dataQuality: assessSingleResultQuality(result)
  }
}

function assessSingleResultQuality(result: any): string {
  let score = 0
  let maxScore = 4

  // Check tuition specificity
  if (result.tuition && /[£$€¥₹]\s*\d{3,}/.test(result.tuition) && 
      !result.tuition.toLowerCase().includes('contact') && 
      !result.tuition.toLowerCase().includes('check')) {
    score++
  }

  // Check deadline specificity
  if (result.deadline && 
      (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(result.deadline) ||
       /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i.test(result.deadline)) &&
      !result.deadline.toLowerCase().includes('check') && 
      !result.deadline.toLowerCase().includes('varies')) {
    score++
  }

  // Check description quality
  if (result.description && result.description.length > 100 && 
      !result.description.toLowerCase().includes('requires verification')) {
    score++
  }

  // Check website authenticity
  if (result.website && (result.website.includes('.edu') || result.website.includes('.ac.'))) {
    score++
  }

  const percentage = score / maxScore
  if (percentage >= 0.75) return 'verified'
  if (percentage >= 0.5) return 'good'
  if (percentage >= 0.25) return 'moderate'
  return 'needs-verification'
}

export function assessDataQuality(results: any[]): string {
  const qualityMetrics = {
    hasSpecificTuition: 0,
    hasSpecificDeadlines: 0,
    hasDetailedDescriptions: 0,
    hasOfficialWebsites: 0
  }

  results.forEach(result => {
    if (result.tuition && /[£$€¥₹]\s*\d{3,}/.test(result.tuition) && 
        !result.tuition.toLowerCase().includes('contact') && 
        !result.tuition.toLowerCase().includes('check')) {
      qualityMetrics.hasSpecificTuition++
    }
    if (result.deadline && 
        (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(result.deadline) ||
         /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i.test(result.deadline)) &&
        !result.deadline.toLowerCase().includes('check') && 
        !result.deadline.toLowerCase().includes('varies')) {
      qualityMetrics.hasSpecificDeadlines++
    }
    if (result.description && result.description.length > 100) {
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

  console.log('Data quality assessment:', {
    qualityMetrics,
    totalResults,
    qualityScore
  })

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
