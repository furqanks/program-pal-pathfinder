
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

  return `
Search for REAL, currently available ${programType} that match: "${query}"

${countryGuidance}
${fieldFocus}
${budgetConsiderations}
${formatPreferences}

TRUSTED SOURCES ONLY:
- Search ONLY official university websites (.edu, .ac.uk, .edu.au, etc.)
- Use official university prospectuses and admissions pages
- Reference official government education databases
- Verify information from recognized university ranking sites

AVOID:
- Third-party education portals or aggregators
- Unofficial reviews or comparison sites
- Outdated or cached information
- Generic program descriptions

CRITICAL REQUIREMENTS:
1. Return ONLY actual programs that exist at real universities with official web presence
2. Verify each program exists on the university's official website
3. Include specific, current tuition fees and application deadlines
4. Focus on programs accepting applications for 2025 intake (September/Fall or January/Spring)
5. Return exactly ${resultCount} real programs with verified information
6. All data must be traceable to official university sources

Return ONLY a valid JSON object (no markdown formatting) with this flexible structure:
{
  "programs": [
    {
      "programName": "Exact program title from official university source",
      "university": "Full official university name",
      "degreeType": "Degree level (e.g., Master's, Bachelor's, PhD)",
      "country": "Country where university is located",
      "description": "Detailed program description with curriculum and focus areas",
      "tuition": "Exact fee amount with currency (e.g., £15,000 per year for international students)",
      "deadline": "Specific application deadline (e.g., March 31, 2025)",
      "duration": "Program length (e.g., 1 year full-time, 2 years part-time)",
      "requirements": "Detailed admission requirements including academic qualifications",
      "fees": {
        "international": "International student fees if available",
        "domestic": "Domestic student fees if available"
      },
      "details": {
        "format": "Full-time/Part-time/Online/Hybrid",
        "startDate": "Start date (e.g., September 2025)",
        "language": "Language of instruction",
        "accreditation": "Relevant accreditation information"
      },
      "ranking": "University ranking information if available",
      "scholarships": "Available funding and scholarship options",
      "careers": "Career prospects and opportunities",
      "website": "Official program webpage URL"
    }
  ]
}

VALIDATION RULES:
- Program names must be specific and real (not generic like "Computer Science Program")
- Universities must be real, accredited institutions with official websites
- Tuition fees must be specific amounts when available from official sources
- Deadlines should be actual dates from official university sources
- All information must be verifiable from official university websites
- Country should match the actual location of the university
- Website URLs should link to official university pages

Return ONLY the JSON object without any markdown formatting, explanations, or additional text.
`;
}
