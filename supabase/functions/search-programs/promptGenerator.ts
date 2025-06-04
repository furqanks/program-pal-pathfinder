
// Dynamic prompt generation utilities

import { analyzeQuery } from "./queryProcessor.ts";

export function createDynamicPrompt(query: string, resultCount: number): string {
  const lowerQuery = query.toLowerCase()
  const queryAnalysis = analyzeQuery(lowerQuery)
  
  // Build dynamic prompt sections
  let programType = queryAnalysis.programType
  let countryGuidance = queryAnalysis.countryGuidance
  let fieldFocus = queryAnalysis.fieldFocus
  let budgetConsiderations = queryAnalysis.budgetConsiderations
  let formatPreferences = queryAnalysis.formatPreferences

  // Special handling for budget-focused searches
  let budgetInstructions = ''
  if (queryAnalysis.isBudgetFocused) {
    budgetInstructions = `
BUDGET-FOCUSED SEARCH - CRITICAL REQUIREMENTS:
- EXCLUDE programs with tuition fees above £25,000/$35,000/€30,000 per year
- PRIORITIZE public universities and state institutions
- FOCUS ON programs with strong scholarship/financial aid programs
- AVOID prestigious private universities unless they offer significant financial aid
- Include community colleges, regional universities, and affordable alternatives
- Mention specific cost-saving opportunities (in-state tuition, work-study programs, etc.)
`
  }

  return `
You are a university program researcher with access to current university websites. Search for REAL, currently available ${programType} that match: "${query}"

${budgetInstructions}
${countryGuidance}
${fieldFocus}
${budgetConsiderations}
${formatPreferences}

CRITICAL DATA ACCURACY REQUIREMENTS:
1. ONLY use information directly from official university websites (.edu, .ac.uk, .edu.au, university.ca, etc.)
2. All tuition fees MUST be the EXACT amounts from the official 2024-2025 or 2025-2026 fee schedules
3. Program names MUST be the EXACT titles as listed on university websites
4. Application deadlines MUST be the actual dates from official admissions pages
5. Verify each data point against the official source before including it
6. If exact information is not available, mark as "Contact university for current information"

${queryAnalysis.isBudgetFocused ? `
BUDGET FILTERING REQUIREMENTS:
- Only include programs that are genuinely affordable
- Prioritize programs under £20,000/$30,000/€25,000 per year
- For expensive programs, only include if they have exceptional financial aid
- Always mention cost-saving opportunities and funding options
- Rank results by value-for-money, not prestige
` : ''}

FORBIDDEN SOURCES:
- Third-party education portals or course aggregators
- Outdated cached information
- Estimated or approximate data
- Information from unofficial websites
- Generic program descriptions

VERIFICATION PROCESS:
1. Find the program on the official university website
2. Locate the exact tuition fee from the current academic year fee schedule
3. Confirm the exact program title from the official program page
4. Check the official admissions calendar for deadlines
5. Only include programs you can verify exist with current, accurate data

Return exactly ${resultCount} programs in this JSON format (no markdown):
{
  "programs": [
    {
      "programName": "EXACT program title from official university source",
      "university": "Full official university name",
      "degreeType": "Degree level (e.g., Master's, Bachelor's, PhD)",
      "country": "Country where university is located",
      "description": "Detailed program description from official source with curriculum focus",
      "tuition": "EXACT fee amount with currency from official fee schedule (e.g., £15,450 per year for international students)",
      "deadline": "Specific application deadline from official admissions calendar",
      "duration": "Program length from official program page",
      "requirements": "Detailed admission requirements from official admissions page",
      "fees": {
        "international": "Exact international student fees from official source",
        "domestic": "Exact domestic student fees from official source"
      },
      "details": {
        "format": "Full-time/Part-time/Online from official program page",
        "startDate": "Start date from official academic calendar",
        "language": "Language of instruction from official program page",
        "accreditation": "Accreditation information from official source"
      },
      "ranking": "University ranking from official sources or recognized ranking bodies",
      "scholarships": "Available funding from official financial aid pages - BE SPECIFIC about amounts and eligibility",
      "careers": "Career prospects from official program outcomes data",
      "website": "Direct URL to official program page"
    }
  ]
}

DATA QUALITY STANDARDS:
- Tuition fees must match official university fee schedules exactly
- Program names must be identical to official university listings
- All information must be traceable to official university pages
- Mark uncertain information as "Contact university to confirm"
- Prioritize accuracy over completeness

${queryAnalysis.isBudgetFocused ? `
BUDGET SEARCH FINAL CHECK:
Before returning results, verify each program:
1. Is the tuition genuinely affordable for the target demographic?
2. Are there meaningful scholarship opportunities mentioned?
3. Does the cost-to-career-outcome ratio make sense?
4. Have you excluded obviously expensive elite institutions?
` : `
FINAL VERIFICATION:
Before returning results, double-check each program:
1. Does the tuition fee match the official university website?
2. Is the program name exactly as listed on the university site?
3. Are the deadlines from the current admissions cycle?
4. Can all information be verified on official pages?
`}

Return ONLY the JSON object without any markdown formatting or explanations.
`;
}
