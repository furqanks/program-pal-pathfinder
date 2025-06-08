
import { SEARCH_CONFIG } from "./config.ts"

export async function callPerplexityAPI(query: string, resultCount: number, apiKey: string) {
  const prompt = `Find ${resultCount} university programs matching: "${query}"

Use only official university websites as sources.

For each program, provide:
- Program name
- University name  
- Country/location
- Degree type
- Tuition fees (as stated by university)
- Application deadline
- Duration
- Admission requirements
- Program description
- University program page URL

Report all information exactly as found on official university websites.`

  console.log('Sending query to Perplexity:', query)

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: SEARCH_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a university program researcher. Use only official university websites as sources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: SEARCH_CONFIG.MAX_TOKENS,
      temperature: SEARCH_CONFIG.TEMPERATURE,
      top_p: SEARCH_CONFIG.TOP_P,
      return_citations: true,
      search_recency_filter: SEARCH_CONFIG.SEARCH_RECENCY_FILTER
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Perplexity API error:', errorText)
    throw new Error(`API request failed: ${errorText}`)
  }

  return response.json()
}
