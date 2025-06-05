
// Enhanced prompt generation focused on fee ranges and accuracy confidence

import { analyzeQuery } from "./queryProcessor.ts";

export function createDynamicPrompt(query: string, resultCount: number): string {
  const lowerQuery = query.toLowerCase()
  const queryAnalysis = analyzeQuery(lowerQuery)
  
  // Build focused prompt sections
  let programType = queryAnalysis.programType
  let countryGuidance = queryAnalysis.countryGuidance
  let fieldFocus = queryAnalysis.fieldFocus
  let budgetConsiderations = queryAnalysis.budgetConsiderations

  // Enhanced budget handling with fee categories
  let budgetInstructions = ''
  if (queryAnalysis.isBudgetFocused) {
    budgetInstructions = `
BUDGET-FOCUSED SEARCH:
- Prioritize budget-friendly and mid-range fee categories
- Focus on public universities and institutions with reasonable costs
- Include scholarship and funding information when available
- Mention value-for-money options
`
  }

  return `
Find REAL university programs that match: "${query}"

${budgetInstructions}
${countryGuidance}
${fieldFocus}
${budgetConsiderations}

ACCURACY REQUIREMENTS:
1. Use EXACT program names from official university websites
2. Provide fee RANGES/CATEGORIES instead of exact amounts
3. Include confidence indicators for data quality
4. Provide official university fees page URLs as sources
5. All program information must be verifiable

FEE CATEGORIES (assign ONE per program):
- "Budget-friendly": Under £15,000/year or equivalent
- "Mid-range": £15,000-£30,000/year or equivalent  
- "Premium": £30,000-£50,000/year or equivalent
- "Luxury": Above £50,000/year or equivalent
- "Contact University": When fees are not publicly available

CONFIDENCE LEVELS:
- "High": Information directly from official university sources
- "Good": Information from reliable educational websites
- "Moderate": Information requires verification
- "Low": Limited information available

Return exactly ${resultCount} programs in this JSON format:
{
  "programs": [
    {
      "programName": "Exact official program title",
      "university": "Full official university name",
      "degreeType": "Bachelor's/Master's/PhD etc.",
      "country": "Country name",
      "description": "Program overview from official source",
      "feeCategory": "Budget-friendly/Mid-range/Premium/Luxury/Contact University",
      "feeRange": "Estimated range in local currency",
      "deadline": "Application deadline",
      "duration": "Program duration",
      "requirements": "Admission requirements",
      "fees": {
        "category": "Same as feeCategory",
        "estimatedRange": "Estimated range with currency",
        "note": "Always verify with university"
      },
      "details": {
        "format": "Full-time/Part-time/Online",
        "startDate": "Program start date",
        "language": "Language of instruction",
        "accreditation": "Accreditation details"
      },
      "dataQuality": {
        "confidence": "High/Good/Moderate/Low",
        "lastUpdated": "When information was last verified",
        "sourceType": "Official website/Educational directory/Third party"
      },
      "ranking": "University ranking information",
      "scholarships": "Available scholarships and funding",
      "careers": "Career prospects",
      "website": "Official program webpage URL",
      "feesPageUrl": "Direct link to university fees page"
    }
  ]
}

CRITICAL: Always include the feesPageUrl field with direct links to official university fees pages. Return ONLY the JSON object.
`;
}
