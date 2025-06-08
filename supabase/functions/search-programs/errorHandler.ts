
import { corsHeaders } from "./config.ts"

export function createErrorResponse(error: Error | string, status: number = 500) {
  const errorMessage = typeof error === 'string' ? error : error.message
  console.error('Search programs error:', errorMessage)
  
  return new Response(
    JSON.stringify({ error: errorMessage }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}
