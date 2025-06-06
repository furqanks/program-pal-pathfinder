
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
2. Provide REALISTIC fee ranges based on actual university data
3. Include confidence indicators for data quality
4. Only provide working university website URLs as sources
5. All program information must be verifiable and current

FEE CATEGORIES (assign ONE per program based on ACTUAL fees):
- "Budget-friendly": Under £12,000/year or equivalent
- "Mid-range": £12,000-£20,000/year or equivalent  
- "Premium": £20,000-£35,000/year or equivalent
- "Luxury": Above £35,000/year or equivalent
- "Contact University": When fees are not publicly available

IMPORTANT FEE GUIDELINES:
- Base fee categories on ACTUAL published university fees
- UK domestic fees are typically lower than international fees
- Research actual university fee pages before categorizing
- If unsure about exact fees, use "Contact University" category
- Fee ranges should reflect realistic current prices (2024-2026)

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
      "feeRange": "Realistic range based on actual fees (e.g., £10,000-£15,000)",
      "deadline": "Application deadline",
      "duration": "Program duration",
      "requirements": "Admission requirements",
      "fees": {
        "category": "Same as feeCategory",
        "estimatedRange": "Realistic range with currency",
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
      "website": "Official program webpage URL - ONLY if working",
      "feesPageUrl": "ONLY include if you can verify the URL works"
    }
  ]
}

CRITICAL: 
- Only include feesPageUrl if you can verify it leads to a working fees page
- Base fee ranges on actual published university fees, not estimates
- If you cannot find reliable fee information, use "Contact University" category
Return ONLY the JSON object.
`;
}
