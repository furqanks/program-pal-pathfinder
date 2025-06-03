
// Search utility functions

export function generateSearchSuggestions(query: string): string[] {
  const suggestions = []
  const lowerQuery = query.toLowerCase()

  if (!lowerQuery.includes('master') && !lowerQuery.includes('bachelor') && !lowerQuery.includes('phd')) {
    suggestions.push('Try specifying the degree level (e.g., "Masters in", "Bachelor of", "PhD in")')
  }

  if (!lowerQuery.includes('uk') && !lowerQuery.includes('us') && !lowerQuery.includes('canada') && !lowerQuery.includes('australia')) {
    suggestions.push('Consider adding a country preference (e.g., "UK", "USA", "Canada")')
  }

  if (lowerQuery.length < 20) {
    suggestions.push('Try using more specific keywords about your field of interest')
  }

  suggestions.push('Include specific requirements like "budget friendly", "online", or "2025 intake"')
  suggestions.push('Try alternative terms for your field of study')

  return suggestions.slice(0, 3)
}
