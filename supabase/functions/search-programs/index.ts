
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchProgramsBody {
  query: string;
}

interface SearchResult {
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  description: string;
}

// Function to validate if query is program-related
function isProgramRelatedQuery(query: string): boolean {
  const programKeywords = [
    'program', 'course', 'degree', 'masters', 'phd', 'bachelor', 'doctorate', 'mba', 'md', 'jd',
    'computer science', 'engineering', 'business', 'medicine', 'law', 'psychology', 'biology',
    'chemistry', 'physics', 'mathematics', 'economics', 'finance', 'marketing', 'accounting',
    'data science', 'artificial intelligence', 'machine learning', 'nursing', 'education',
    'architecture', 'art', 'design', 'music', 'literature', 'history', 'philosophy',
    'political science', 'sociology', 'anthropology', 'linguistics', 'geography',
    'environmental science', 'biotechnology', 'cybersecurity', 'software engineering',
    'mechanical engineering', 'electrical engineering', 'civil engineering', 'aerospace',
    'biomedical engineering', 'chemical engineering', 'industrial engineering',
    'information technology', 'information systems', 'digital media', 'journalism',
    'communications', 'public relations', 'international relations', 'public health',
    'veterinary', 'pharmacy', 'dentistry', 'physical therapy', 'occupational therapy',
    'social work', 'criminal justice', 'public administration', 'urban planning',
    'agriculture', 'forestry', 'marine science', 'geology', 'meteorology',
    'study', 'university', 'college', 'academic', 'curriculum', 'major', 'minor',
    'specialization', 'concentration', 'field', 'discipline', 'subject'
  ];
  
  const queryLower = query.toLowerCase();
  return programKeywords.some(keyword => queryLower.includes(keyword));
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get Perplexity API key from env variable
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!perplexityApiKey) {
      console.error('Missing Perplexity API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get search query from request body
    const { query } = await req.json() as SearchProgramsBody;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing search query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate if query is program-related
    if (!isProgramRelatedQuery(query)) {
      return new Response(
        JSON.stringify({ 
          error: 'Please search only for academic programs, degrees, or study fields. For example: "Computer Science Masters", "PhD in Biology", or "Business Administration".' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching for programs with query: ${query}`);

    // Call Perplexity API with specific university domains only (no wildcards)
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an academic program finder that ONLY searches official university and educational institution websites. 
            Given a search query about academic programs, provide information about 4 relevant programs from official university sources only.
            
            IMPORTANT: Only use information from official university websites (.edu domains, official university websites, and accredited educational institutions).
            Do NOT use information from ranking sites, review sites, or unofficial sources.
            
            Format your response in valid JSON with an array of objects with these fields:
            - programName (string): Official name of the academic program
            - university (string): Official university or institution name
            - degreeType (string): Type of degree (PhD, Masters, Bachelor's, etc.)
            - country (string): Country where the institution is located
            - description (string): Brief paragraph describing the program from official sources (max 200 words)
            
            Do not include any additional text outside the JSON object. The response should be parseable as JSON.
            If you cannot find 4 programs from official sources, return fewer programs but ensure all information is from official university websites.`
          },
          {
            role: 'user',
            content: `Find academic programs related to: ${query}. Only use official university websites and educational institution sources.`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        return_images: false,
        search_domain_filter: [
          'harvard.edu',
          'stanford.edu',
          'mit.edu',
          'cambridge.ac.uk',
          'oxford.ac.uk',
          'columbia.edu',
          'yale.edu',
          'princeton.edu',
          'caltech.edu',
          'ucl.ac.uk'
        ],
        search_recency_filter: 'year'
      }),
    });

    if (!response.ok) {
      console.error('API response error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Error fetching search results from Perplexity API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Parse the response content which should be JSON
    try {
      // Extract the content from the message and parse it
      const content = data.choices[0].message.content;
      // The content should be valid JSON
      const searchResults = JSON.parse(content);
      
      if (!Array.isArray(searchResults)) {
        throw new Error('Response is not an array');
      }

      // Additional validation to ensure we got program-related results
      if (searchResults.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'No academic programs found for your search. Please try searching for specific degree programs or fields of study.' 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ searchResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse search results from official sources' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in search-programs function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
