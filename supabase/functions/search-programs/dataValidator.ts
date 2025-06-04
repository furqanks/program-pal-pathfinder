
// Enhanced data validation and quality assessment utilities with budget awareness

export function validateProgramData(result: any, originalQuery: string): boolean {
  if (!result.programName || !result.university || !result.degreeType) {
    console.log('Missing required fields:', { programName: result.programName, university: result.university, degreeType: result.degreeType });
    return false
  }

  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  const tuition = result.tuition ? result.tuition.toLowerCase() : ''
  const query = originalQuery.toLowerCase()
  
  // Check if this is a budget-focused search
  const isBudgetSearch = ['budget', 'affordable', 'cheap', 'low cost', 'inexpensive', 'economical'].some(term => 
    query.includes(term)
  )
  
  // Budget-focused validation
  if (isBudgetSearch && result.tuition) {
    // Extract numeric value from tuition string
    const tuitionMatch = result.tuition.match(/[\d,]+/)
    if (tuitionMatch) {
      const tuitionAmount = parseInt(tuitionMatch[0].replace(/,/g, ''))
      
      // Define budget thresholds (adjust based on currency detection)
      let threshold = 35000 // USD default
      if (result.tuition.includes('£')) threshold = 25000 // GBP
      if (result.tuition.includes('€')) threshold = 30000 // EUR
      if (result.tuition.includes('₹')) threshold = 2000000 // INR
      if (result.tuition.includes('C$')) threshold = 45000 // CAD
      if (result.tuition.includes('A$')) threshold = 45000 // AUD
      
      if (tuitionAmount > threshold) {
        // Only allow expensive programs if they have exceptional financial aid
        const hasGoodFinancialAid = result.scholarships && 
          (result.scholarships.includes('full tuition') || 
           result.scholarships.includes('substantial aid') ||
           result.scholarships.includes('merit scholarship'))
        
        if (!hasGoodFinancialAid) {
          console.log('Budget search: Rejecting expensive program without good financial aid:', result.programName, result.tuition);
          return false
        }
      }
    }
    
    // Reject obviously elite/expensive universities for budget searches
    const expensiveUniversityIndicators = [
      'harvard', 'stanford', 'mit', 'oxford', 'cambridge', 'yale', 'princeton',
      'imperial college', 'london school of economics', 'columbia university',
      'university of pennsylvania', 'dartmouth', 'brown university'
    ]
    
    for (const indicator of expensiveUniversityIndicators) {
      if (university.includes(indicator)) {
        // Only allow if there's specific mention of financial aid
        const hasFinancialAidMention = result.scholarships && 
          (result.scholarships.includes('need-based aid') || 
           result.scholarships.includes('full funding') ||
           result.scholarships.includes('fellowship'))
        
        if (!hasFinancialAidMention) {
          console.log('Budget search: Rejecting elite university without financial aid mention:', result.university);
          return false
        }
      }
    }
  }
  
  // Only reject obviously generic or placeholder data
  const genericIndicators = [
    'program name', 'degree program', 'university name', 'example university',
    'multiple universities', 'various universities', 'tbd', 'tba',
    'placeholder', 'sample program', 'example program'
  ]
  
  for (const indicator of genericIndicators) {
    if (programName.includes(indicator) || university.includes(indicator)) {
      console.log('Generic indicator found:', indicator, 'in program:', result.programName);
      return false
    }
  }

  // Relaxed tuition validation - accept any specific amounts with currency symbols
  if (result.tuition) {
    // Only reject if it's clearly vague or missing
    const vagueTuitionIndicators = [
      'tbc', 'tbd', 'varies significantly', 'contact for pricing', 'price varies',
      'depends on many factors', 'see individual programs'
    ]
    
    const hasVagueTuition = vagueTuitionIndicators.some(indicator => 
      tuition.includes(indicator)
    )
    
    if (hasVagueTuition) {
      console.log('Vague tuition information found:', result.tuition);
      return false
    }

    // Accept any tuition that has currency and numbers (including citations)
    const hasCurrencyAndAmount = /[£$€¥₹]/.test(tuition) && /\d/.test(tuition)
    if (!hasCurrencyAndAmount && !tuition.includes('contact university')) {
      console.log('Missing currency format but allowing through:', result.tuition);
      // Don't reject, just log for awareness
    }
  }

  // More lenient program name validation
  if (programName.length < 5) {
    console.log('Program name very short:', result.programName);
    return false
  }

  // More lenient university name validation
  if (university.length < 3 || university === 'university' || university === 'college') {
    console.log('Invalid university name:', result.university);
    return false
  }

  return true
}

export function sanitizeAndEnhanceProgramData(result: any): any {
  // More permissive data cleaning
  const cleanTuition = (tuition: string) => {
    if (!tuition) return 'Contact university for current tuition fees'
    
    // Keep most tuition data as-is, just clean up obvious issues
    if (tuition.toLowerCase().includes('contact university') || 
        tuition.toLowerCase().includes('check university')) {
      return tuition
    }
    
    // Accept any tuition with currency symbols and numbers
    if (/[£$€¥₹]/.test(tuition) && /\d/.test(tuition)) {
      return tuition
    }
    
    return tuition // Keep original if it doesn't match patterns
  }

  const cleanDeadline = (deadline: string) => {
    if (!deadline) return 'Check university website for application deadlines'
    
    // More permissive deadline handling
    if (deadline.toLowerCase().includes('rolling')) {
      return 'Rolling admissions'
    }
    
    return deadline // Keep most deadlines as-is
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
    dataQuality: assessSingleResultQuality(result),
    confidenceScore: calculateConfidenceScore(result)
  }
}

function calculateConfidenceScore(result: any): number {
  let score = 0
  let maxScore = 6

  // Check tuition specificity (more lenient)
  if (result.tuition && /[£$€¥₹]/.test(result.tuition) && /\d{3,}/.test(result.tuition)) {
    score += 2 // Higher weight for having tuition
  } else if (result.tuition && result.tuition.length > 10) {
    score += 1 // Some points for any detailed tuition info
  }

  // Check deadline specificity
  if (result.deadline && result.deadline.length > 5 && !result.deadline.toLowerCase().includes('check')) {
    score += 1
  }

  // Check description quality
  if (result.description && result.description.length > 100) {
    score += 1
  }

  // Check if has specific requirements
  if (result.requirements && result.requirements.length > 20) {
    score += 1
  }

  // Check for additional details
  if (result.duration || result.website || result.scholarships) {
    score += 1
  }

  return Math.round((score / maxScore) * 100)
}

function assessSingleResultQuality(result: any): string {
  const confidence = calculateConfidenceScore(result)
  
  if (confidence >= 80) return 'high-confidence'
  if (confidence >= 60) return 'good'
  if (confidence >= 40) return 'moderate'
  return 'needs-verification'
}

export function assessDataQuality(results: any[]): string {
  if (results.length === 0) return 'no-results'
  
  const avgConfidence = results.reduce((sum, result) => {
    return sum + (result.confidenceScore || 50)
  }, 0) / results.length

  if (avgConfidence >= 75) return 'high-quality'
  if (avgConfidence >= 60) return 'good-quality'
  if (avgConfidence >= 40) return 'moderate-quality'
  return 'mixed-quality'
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
