
// Query processing and enhancement utilities

export function enhanceQuery(originalQuery: string): string {
  const query = originalQuery.toLowerCase().trim()
  const enhancements = []
  
  // Budget-related enhancements - prioritize these
  if (query.includes('budget') || query.includes('affordable') || 
      query.includes('cheap') || query.includes('low cost') ||
      query.includes('inexpensive') || query.includes('economical')) {
    enhancements.push('affordable tuition', 'low cost programs', 'budget-friendly options', 'scholarships available', 'public universities', 'lower fees')
  }
  
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

  const enhancedQuery = `${originalQuery} ${enhancements.join(' ')}`
  return enhancedQuery.substring(0, 500)
}

export function analyzeQuery(query: string): any {
  const analysis = {
    programType: 'university programs',
    countryGuidance: '',
    fieldFocus: '',
    budgetConsiderations: '',
    formatPreferences: '',
    isBudgetFocused: false
  }

  // Detect budget focus - this is crucial for filtering
  const budgetTerms = ['budget', 'affordable', 'cheap', 'low cost', 'inexpensive', 'economical', 'budget-friendly']
  analysis.isBudgetFocused = budgetTerms.some(term => query.includes(term))

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

  // Enhanced budget considerations
  if (analysis.isBudgetFocused) {
    analysis.budgetConsiderations = 'CRITICAL BUDGET PRIORITY: Prioritize affordable options, public universities, and programs with lower tuition fees. EXCLUDE expensive private universities and premium programs. Focus on value-for-money options with good career outcomes relative to cost. Include detailed scholarship and financial aid information.'
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
