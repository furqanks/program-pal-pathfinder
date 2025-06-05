
// Enhanced data validation for fee categories and confidence indicators

export function validateProgramData(result: any, originalQuery: string): boolean {
  // Basic required fields check
  if (!result.programName || !result.university || !result.degreeType) {
    return false
  }

  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  const query = originalQuery.toLowerCase()
  
  // Validate fee category
  const validFeeCategories = ['budget-friendly', 'mid-range', 'premium', 'luxury', 'contact university']
  const feeCategory = (result.feeCategory || '').toLowerCase()
  
  if (!validFeeCategories.includes(feeCategory)) {
    console.log(`Invalid fee category: ${result.feeCategory}`)
    return false
  }
  
  // Check for budget constraints matching
  const isBudgetSearch = ['budget', 'affordable', 'cheap', 'low cost'].some(term => 
    query.includes(term)
  )
  
  // For budget searches, prioritize budget-friendly and mid-range categories
  if (isBudgetSearch) {
    const expensiveCategories = ['premium', 'luxury']
    if (expensiveCategories.includes(feeCategory)) {
      // Only allow if there's specific scholarship mention
      const hasFinancialAid = result.scholarships && 
        (result.scholarships.toLowerCase().includes('full funding') || 
         result.scholarships.toLowerCase().includes('scholarship') ||
         result.scholarships.toLowerCase().includes('financial aid'))
      
      if (!hasFinancialAid) {
        console.log(`Filtered out expensive program for budget search: ${result.programName}`)
        return false
      }
    }
  }
  
  // Validate confidence level
  const validConfidenceLevels = ['high', 'good', 'moderate', 'low']
  const confidence = (result.dataQuality?.confidence || '').toLowerCase()
  
  if (confidence && !validConfidenceLevels.includes(confidence)) {
    console.log(`Invalid confidence level: ${result.dataQuality?.confidence}`)
    return false
  }
  
  // Filter out obviously generic or placeholder data
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
  // Ensure fee category is properly formatted
  const feeCategory = result.feeCategory || 'Contact University'
  
  // Generate confidence score based on data quality
  let confidenceScore = 50 // default
  const confidence = (result.dataQuality?.confidence || '').toLowerCase()
  
  switch (confidence) {
    case 'high': confidenceScore = 85; break
    case 'good': confidenceScore = 70; break
    case 'moderate': confidenceScore = 55; break
    case 'low': confidenceScore = 35; break
    default: confidenceScore = 50
  }

  return {
    programName: result.programName || 'Program name not specified',
    university: result.university || 'University name not specified',
    degreeType: result.degreeType || 'Degree type not specified',
    country: result.country || 'Country not specified',
    description: result.description || 'Program details available on university website.',
    feeCategory: feeCategory,
    feeRange: result.feeRange || 'Contact university for current fees',
    tuition: `${feeCategory} - ${result.feeRange || 'Verify with university'}`,
    deadline: result.deadline || 'Check university website for deadlines',
    duration: result.duration || 'Duration varies',
    requirements: result.requirements || 'Check university for requirements',
    fees: {
      category: feeCategory,
      estimatedRange: result.fees?.estimatedRange || result.feeRange || 'Contact university',
      international: result.fees?.estimatedRange || 'Contact university',
      domestic: result.fees?.estimatedRange || 'Contact university',
      note: 'Always verify current fees with university'
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
      sourceType: result.dataQuality?.sourceType || 'Educational directory'
    },
    confidenceScore: confidenceScore,
    ranking: result.ranking || 'University ranking available on request',
    scholarships: result.scholarships || 'Contact university for funding opportunities',
    careers: result.careers || 'Career guidance available',
    website: result.website || 'Visit university website for details',
    feesPageUrl: result.feesPageUrl || result.website || 'Contact university for fees information'
  }
}
