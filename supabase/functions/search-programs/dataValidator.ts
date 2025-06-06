// Relaxed data validation with fallback options

export function validateProgramData(result: any, originalQuery: string, relaxed: boolean = false, superRelaxed: boolean = false): boolean {
  // Basic required fields check
  if (!result.programName || !result.university || !result.degreeType) {
    return false
  }

  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  const query = originalQuery.toLowerCase()
  
  // Super relaxed mode - minimal validation
  if (superRelaxed) {
    console.log('Using super relaxed validation for:', result.programName)
    
    // Only filter out obviously fake data
    const fakeIndicators = [
      'example', 'placeholder', 'sample', 'insert', 'your program here',
      'program name', 'university name', 'degree type'
    ]
    
    for (const indicator of fakeIndicators) {
      if (programName.includes(indicator) || university.includes(indicator)) {
        console.log(`Filtered obvious fake data: ${result.programName}`)
        return false
      }
    }
    
    // Basic length checks
    if (programName.length < 3 || university.length < 3) {
      return false
    }
    
    return true
  }
  
  // Relaxed validation mode
  if (relaxed) {
    console.log('Using relaxed validation for:', result.programName)
    
    // Remove strict fee category validation
    const validFeeCategories = ['budget-friendly', 'mid-range', 'premium', 'luxury', 'contact university', 'verify with university', 'see university website']
    const feeCategory = (result.feeCategory || '').toLowerCase()
    
    // Allow more flexible fee categories
    if (feeCategory && !validFeeCategories.some(cat => feeCategory.includes(cat))) {
      // Don't filter out, just log
      console.log(`Unusual fee category (keeping): ${result.feeCategory}`)
    }
    
    // Remove fee range validation entirely in relaxed mode
    console.log('Skipping fee range validation in relaxed mode')
    
    // Keep budget constraint matching but make it less strict
    const isBudgetSearch = ['budget', 'affordable', 'cheap', 'low cost'].some(term => 
      query.includes(term)
    )
    
    if (isBudgetSearch) {
      // Only filter out obviously luxury programs
      const luxuryIndicators = ['luxury', 'premium', 'exclusive', 'elite']
      const hasLuxuryIndicator = result.description && luxuryIndicators.some(indicator => 
        result.description.toLowerCase().includes(indicator)
      )
      
      if (hasLuxuryIndicator && !result.scholarships) {
        console.log(`Filtered luxury program for budget search: ${result.programName}`)
        return false
      }
    }
    
    // More flexible generic data filtering
    const genericIndicators = [
      'program name', 'degree program', 'university name', 'example university',
      'placeholder', 'sample program', 'insert program name'
    ]
    
    for (const indicator of genericIndicators) {
      if (programName.includes(indicator) || university.includes(indicator)) {
        console.log(`Filtered generic data: ${result.programName}`)
        return false
      }
    }

    // Basic length checks
    if (programName.length < 5 || university.length < 3) {
      console.log(`Program name or university too short: ${result.programName}`)
      return false
    }

    return true
  }
  
  // Standard validation (original logic but less strict)
  const validFeeCategories = ['budget-friendly', 'mid-range', 'premium', 'luxury', 'contact university']
  const feeCategory = (result.feeCategory || '').toLowerCase()
  
  if (feeCategory && !validFeeCategories.includes(feeCategory)) {
    console.log(`Invalid fee category (standard): ${result.feeCategory}`)
    return false
  }
  
  // Relaxed fee range validation - only check for obviously wrong data
  if (result.feeRange) {
    const feeRange = result.feeRange.toLowerCase()
    
    // Only filter out completely unrealistic ranges
    if (feeRange.includes('£100,000') || feeRange.includes('$500,000') || feeRange.includes('€200,000')) {
      console.log(`Unrealistic fee range filtered: ${result.feeRange}`)
      return false
    }
  }
  
  // Relaxed budget matching
  const isBudgetSearch = ['budget', 'affordable', 'cheap', 'low cost'].some(term => 
    query.includes(term)
  )
  
  if (isBudgetSearch) {
    const expensiveCategories = ['luxury']
    if (expensiveCategories.includes(feeCategory)) {
      const hasFinancialAid = result.scholarships && 
        (result.scholarships.toLowerCase().includes('full funding') || 
         result.scholarships.toLowerCase().includes('scholarship') ||
         result.scholarships.toLowerCase().includes('financial aid'))
      
      if (!hasFinancialAid) {
        console.log(`Filtered expensive program for budget search: ${result.programName}`)
        return false
      }
    }
  }
  
  // Relaxed confidence validation
  const validConfidenceLevels = ['high', 'good', 'moderate', 'low', 'estimated', 'approximate']
  const confidence = (result.dataQuality?.confidence || '').toLowerCase()
  
  if (confidence && !validConfidenceLevels.some(level => confidence.includes(level))) {
    console.log(`Unusual confidence level (keeping): ${result.dataQuality?.confidence}`)
  }
  
  // Filter out obviously generic data
  const genericIndicators = [
    'program name', 'degree program', 'university name', 'example university',
    'placeholder', 'sample program', 'tbd', 'tba', 'insert program name'
  ]
  
  for (const indicator of genericIndicators) {
    if (programName.includes(indicator) || university.includes(indicator)) {
      console.log(`Filtered generic data: ${result.programName}`)
      return false
    }
  }

  // Basic length checks
  if (programName.length < 5 || university.length < 3) {
    console.log(`Program name or university too short: ${result.programName}`)
    return false
  }

  return true
}

export function sanitizeAndEnhanceProgramData(result: any): any {
  // Enhanced fee category handling with more flexibility
  let feeCategory = result.feeCategory || 'Verify with University'
  
  // Normalize fee category
  const lowerFeeCategory = feeCategory.toLowerCase()
  if (lowerFeeCategory.includes('budget') || lowerFeeCategory.includes('affordable')) {
    feeCategory = 'Budget-friendly'
  } else if (lowerFeeCategory.includes('mid') || lowerFeeCategory.includes('moderate')) {
    feeCategory = 'Mid-range'
  } else if (lowerFeeCategory.includes('premium') || lowerFeeCategory.includes('high')) {
    feeCategory = 'Premium'
  } else if (lowerFeeCategory.includes('luxury') || lowerFeeCategory.includes('exclusive')) {
    feeCategory = 'Luxury'
  } else {
    feeCategory = 'Verify with University'
  }
  
  // Enhanced confidence scoring
  let confidenceScore = 40 // Lower default to reflect mixed accuracy approach
  const confidence = (result.dataQuality?.confidence || '').toLowerCase()
  
  switch (confidence) {
    case 'high': confidenceScore = 75; break // Reduced from 85
    case 'good': confidenceScore = 60; break // Reduced from 70
    case 'moderate': confidenceScore = 45; break // Reduced from 55
    case 'low': confidenceScore = 30; break // Reduced from 35
    default: confidenceScore = 40 // Reduced from 50
  }

  // Enhanced URL validation with more flexibility
  let cleanFeesPageUrl = null
  if (result.feesPageUrl && typeof result.feesPageUrl === 'string') {
    if (result.feesPageUrl.startsWith('http') && result.feesPageUrl.includes('.')) {
      cleanFeesPageUrl = result.feesPageUrl
    }
  }

  if (!cleanFeesPageUrl && result.website && typeof result.website === 'string') {
    if (result.website.startsWith('http') && result.website.includes('.')) {
      cleanFeesPageUrl = result.website
    }
  }

  // Enhanced fee range with disclaimers
  let feeRangeWithDisclaimer = result.feeRange || 'Contact university for current fees'
  if (result.feeRange) {
    feeRangeWithDisclaimer = `${result.feeRange} (verify with university)`
  }

  return {
    programName: result.programName || 'Program name not specified',
    university: result.university || 'University name not specified',
    degreeType: result.degreeType || 'Degree type not specified',
    country: result.country || 'Country not specified',
    description: result.description || 'Program details available on university website.',
    feeCategory: feeCategory,
    feeRange: feeRangeWithDisclaimer,
    tuition: `${feeCategory} - ${feeRangeWithDisclaimer}`,
    deadline: result.deadline || 'Check university website for deadlines',
    duration: result.duration || 'Duration varies',
    requirements: result.requirements || 'Check university for requirements',
    fees: {
      category: feeCategory,
      estimatedRange: feeRangeWithDisclaimer,
      international: result.fees?.estimatedRange || 'Contact university',
      domestic: result.fees?.estimatedRange || 'Contact university',
      note: 'IMPORTANT: All fee information is estimated. Always verify current fees directly with the university before applying.'
    },
    details: {
      format: result.details?.format || 'Check with university',
      startDate: result.details?.startDate || 'Multiple intake dates',
      language: result.details?.language || 'Check language requirements',
      accreditation: result.details?.accreditation || 'Check accreditation status'
    },
    dataQuality: {
      confidence: result.dataQuality?.confidence || 'Moderate',
      lastUpdated: result.dataQuality?.lastUpdated || 'Unknown',
      sourceType: result.dataQuality?.sourceType || 'Educational directory',
      accuracyNote: 'Fee estimates may vary significantly from actual costs'
    },
    confidenceScore: confidenceScore,
    ranking: result.ranking || 'University ranking available on request',
    scholarships: result.scholarships || 'Contact university for funding opportunities',
    careers: result.careers || 'Career guidance available',
    website: result.website || 'Visit university website for details',
    feesPageUrl: cleanFeesPageUrl,
    accuracyDisclaimer: 'This information is for initial research only. Always verify all details directly with the university.'
  }
}
