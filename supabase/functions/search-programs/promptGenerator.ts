
// Enhanced prompt generation focused on volume and user transparency

import { analyzeQuery } from "./queryProcessor.ts";

export function createDynamicPrompt(query: string, resultCount: number): string {
  const lowerQuery = query.toLowerCase()
  const queryAnalysis = analyzeQuery(lowerQuery)
  
  // Build focused prompt sections
  let programType = queryAnalysis.programType
  let countryGuidance = queryAnalysis.countryGuidance
  let fieldFocus = queryAnalysis.fieldFocus
  let budgetConsiderations = queryAnalysis.budgetConsiderations

  // Enhanced budget handling with transparency
  let budgetInstructions = ''
  if (queryAnalysis.isBudgetFocused) {
    budgetInstructions = `
BUDGET-FOCUSED SEARCH (PRIORITY: Find programs, accuracy secondary):
- Include programs across all fee ranges but prioritize budget-friendly options
- Always include scholarship and funding information when available
- If exact fees unknown, use "Verify with University" category
- Focus on public universities and value-for-money institutions
`
  }

  return `
Find REAL university programs that match: "${query}"

${budgetInstructions}
${countryGuidance}
${fieldFocus}
${budgetConsiderations}

CRITICAL REQUIREMENTS:
1. Prioritize finding ${resultCount} DIFFERENT programs over perfect fee accuracy
2. Use EXACT program names from university sources when possible
3. If you cannot find exact fee information, use estimated ranges with clear disclaimers
4. All programs must be real and currently offered
5. Include working university website URLs when possible

FEE HANDLING STRATEGY (FLEXIBILITY PRIORITIZED):
- "Budget-friendly": Generally under £15,000/year (include estimates)
- "Mid-range": Generally £15,000-£25,000/year (include estimates)
- "Premium": Generally £25,000-£40,000/year (include estimates)
- "Luxury": Generally above £40,000/year (include estimates)
- "Verify with University": When fees cannot be determined (PREFERRED when unsure)

IMPORTANT FEE GUIDELINES:
- If you cannot find specific fees, use "Verify with University" category
- Estimates are acceptable with clear disclaimers
- International vs domestic fees may vary significantly
- Always include disclaimer that fees should be verified
- Focus on program discovery rather than fee precision

CONFIDENCE LEVELS (BE REALISTIC):
- "High": Official university sources with recent data
- "Good": Reliable educational sources, may need verification
- "Moderate": Multiple sources but requires verification (MOST COMMON)
- "Low": Limited sources, significant verification needed

Return exactly ${resultCount} programs in this JSON format:
{
  "programs": [
    {
      "programName": "Exact official program title",
      "university": "Full official university name",
      "degreeType": "Bachelor's/Master's/PhD etc.",
      "country": "Country name",
      "description": "Program overview with disclaimer about verifying details",
      "feeCategory": "Budget-friendly/Mid-range/Premium/Luxury/Verify with University",
      "feeRange": "Estimated range with disclaimer (e.g., £10,000-£15,000 estimated - verify with university)",
      "deadline": "Application deadline or 'Check university website'",
      "duration": "Program duration",
      "requirements": "Admission requirements",
      "fees": {
        "category": "Same as feeCategory",
        "estimatedRange": "Range with verification note",
        "note": "Always verify current fees with university"
      },
      "details": {
        "format": "Full-time/Part-time/Online",
        "startDate": "Program start date",
        "language": "Language of instruction",
        "accreditation": "Accreditation details"
      },
      "dataQuality": {
        "confidence": "High/Good/Moderate/Low",
        "lastUpdated": "When information was verified",
        "sourceType": "Official website/Educational directory/Multiple sources"
      },
      "ranking": "University ranking information",
      "scholarships": "Available scholarships and funding",
      "careers": "Career prospects",
      "website": "Official program or university webpage URL",
      "feesPageUrl": "Direct fees page URL if available"
    }
  ]
}

CRITICAL SUCCESS CRITERIA:
- Must return exactly ${resultCount} different programs
- Each program must be real and currently offered
- Fee information can be estimates with disclaimers
- Prioritize program diversity over fee accuracy
- Include clear verification disclaimers throughout

Return ONLY the JSON object with ${resultCount} programs.
`;
}
