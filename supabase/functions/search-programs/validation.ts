
export function validateRequest(body: any) {
  const { query, resultCount = 8 } = body

  if (!query) {
    throw new Error('Query parameter is required')
  }

  return { query, resultCount }
}

export function validateApiKey() {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
  if (!perplexityApiKey) {
    throw new Error('Perplexity API key not configured')
  }
  return perplexityApiKey
}
