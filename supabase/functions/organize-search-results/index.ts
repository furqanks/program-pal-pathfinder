
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { rawContent, query } = await req.json();

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: 'Raw content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompt = `You are an expert content organizer specializing in university program information. Your task is to reorganize the provided content into a clear, well-structured format while preserving ALL original information exactly as provided.

CRITICAL REQUIREMENTS:
1. DO NOT change, modify, or paraphrase any factual content
2. DO NOT add new information that wasn't in the original
3. DO NOT remove any information from the original
4. Preserve all specific details like fees, deadlines, requirements, etc.
5. Keep all university names, program names, and locations exactly as stated
6. Maintain all numerical data (costs, deadlines, durations) precisely

ORGANIZATION GUIDELINES:
- Create clear sections with descriptive headings
- Group related programs together logically
- Use consistent formatting throughout
- Make the information easy to scan and read
- Improve the structure and flow while keeping content identical

OUTPUT FORMAT:
- Use clear headings and subheadings
- Organize information in a logical hierarchy
- Use bullet points or numbered lists where appropriate
- Ensure consistent formatting
- Make it easy to compare different programs

Remember: Your role is to be a content organizer, not a content creator or editor. Reorganize the structure and presentation, but keep every piece of information exactly as provided in the original.`;

    const userPrompt = `Please reorganize the following university program search results for the query: "${query}"

Original content to reorganize:
${rawContent}

Please reorganize this content into a clear, well-structured format while preserving every piece of information exactly as provided.`;

    console.log('Sending content to OpenAI for organization');
    console.log(`Content length: ${rawContent.length} characters`);
    console.log(`Query: ${query}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.1, // Low temperature for consistent, factual reorganization
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API request failed: ${errorText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Invalid response structure from OpenAI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const organizedContent = data.choices[0].message.content;
    console.log('Content organization complete');
    console.log(`Organized content length: ${organizedContent.length} characters`);

    return new Response(
      JSON.stringify({ 
        organizedContent,
        originalLength: rawContent.length,
        organizedLength: organizedContent.length,
        model: data.model || 'gpt-4o',
        query: query
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Organize search results error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
