
// Simplified data validation focused on basic accuracy

export function validateProgramData(result: any, originalQuery: string): boolean {
  // Basic required fields check
  if (!result.programName || !result.university || !result.degreeType) {
    return false
  }

  const programName = result.programName.toLowerCase()
  const university = result.university.toLowerCase()
  const query = originalQuery.toLowerCase()
  
  // Check for budget constraints
  const isBudgetSearch = ['budget', 'affordable', 'cheap', 'low cost'].some(term => 
    query.includes(term)
  )
  
  // For budget searches, filter out obviously expensive universities
  if (isBudgetSearch && result.tuition) {
    const expensiveUniversities = [
      'harvard', 'stanford', 'mit', 'oxford', 'cambridge', 'yale', 'princeton'
    ]
    
    const isExpensiveUniversity = expensiveUniversities.some(expensive => 
      university.includes(expensive)
    )
    
    if (isExpensiveUniversity) {
      // Only allow if there's specific financial aid mention
      const hasFinancialAid = result.scholarships && 
        (result.scholarships.includes('full funding') || 
         result.scholarships.includes('need-based aid'))
      
      if (!hasFinancialAid) {
        return false
      }
    }
  }
  
  // Filter out obviously generic or placeholder data
  const genericIndicators = [
    'program name', 'degree program', 'university name', 'example university',
    'placeholder', 'sample program', 'tbd', 'tba'
  ]
  
  for (const indicator of genericIndicators) {
    if (programName.includes(indicator) || university.includes(indicator)) {
      return false
    }
  }

  // Basic length checks
  if (programName.length < 5 || university.length < 3) {
    return false
  }

  return true
}

export function sanitizeAndEnhanceProgramData(result: any): any {
  return {
    programName: result.programName || 'Program name not specified',
    university: result.university || 'University name not specified',
    degreeType: result.degreeType || 'Degree type not specified',
    country: result.country || 'Country not specified',
    description: result.description || 'Program details available on university website.',
    tuition: result.tuition || 'Contact university for tuition information',
    deadline: result.deadline || 'Check university website for deadlines',
    duration: result.duration || 'Duration varies',
    requirements: result.requirements || 'Check university for requirements',
    fees: {
      international: result.fees?.international || result.tuition || 'Check with university',
      domestic: result.fees?.domestic || 'Check with university'
    },
    details: {
      format: result.details?.format || 'Check with university',
      startDate: result.details?.startDate || 'Multiple intake dates',
      language: result.details?.language || 'Check language requirements',
      accreditation: result.details?.accreditation || 'Check accreditation status'
    },
    ranking: result.ranking || 'University ranking available on request',
    scholarships: result.scholarships || 'Contact university for funding opportunities',
    careers: result.careers || 'Career guidance available',
    website: result.website || 'Visit university website for details'
  }
}
