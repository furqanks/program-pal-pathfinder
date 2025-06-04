
// Simplified prompt generation focused on accuracy

import { analyzeQuery } from "./queryProcessor.ts";

export function createDynamicPrompt(query: string, resultCount: number): string {
  const lowerQuery = query.toLowerCase()
  const queryAnalysis = analyzeQuery(lowerQuery)
  
  // Build focused prompt sections
  let programType = queryAnalysis.programType
  let countryGuidance = queryAnalysis.countryGuidance
  let fieldFocus = queryAnalysis.fieldFocus
  let budgetConsiderations = queryAnalysis.budgetConsiderations

  // Simplified budget handling
  let budgetInstructions = ''
  if (queryAnalysis.isBudgetFocused) {
    budgetInstructions = `
BUDGET-FOCUSED SEARCH:
- Focus on affordable programs and public universities
- Include programs with reasonable tuition fees
- Mention scholarship opportunities when available
- Prioritize value-for-money options
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
2. Include current tuition fees with currency symbols
3. Provide real university names (not generic descriptions)
4. Include accurate application deadlines
5. All information must be verifiable from official sources

Return exactly ${resultCount} programs in this JSON format:
{
  "programs": [
    {
      "programName": "Exact official program title",
      "university": "Full official university name",
      "degreeType": "Bachelor's/Master's/PhD etc.",
      "country": "Country name",
      "description": "Program overview from official source",
      "tuition": "Exact fee with currency (e.g., £15,450 per year)",
      "deadline": "Application deadline",
      "duration": "Program duration",
      "requirements": "Admission requirements",
      "fees": {
        "international": "International student fees",
        "domestic": "Domestic student fees"
      },
      "details": {
        "format": "Full-time/Part-time/Online",
        "startDate": "Program start date",
        "language": "Language of instruction",
        "accreditation": "Accreditation details"
      },
      "ranking": "University ranking information",
      "scholarships": "Available scholarships and funding",
      "careers": "Career prospects",
      "website": "Official program webpage URL"
    }
  ]
}

Focus on accuracy of program names and university names above all else. Return ONLY the JSON object.
`;
}
