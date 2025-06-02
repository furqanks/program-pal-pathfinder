
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
  tuition?: string;
  deadline?: string;
  applicationDeadline?: string;
  duration?: string;
  requirements?: string;
  fees?: {
    domestic?: string;
    international?: string;
    eu?: string;
  };
  website?: string;
  admissionRequirements?: string[];
  programDetails?: {
    credits?: string;
    format?: string;
    startDate?: string;
  };
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
    'specialization', 'concentration', 'field', 'discipline', 'subject', 'affordable',
    'budget', 'cheap', 'low cost', 'scholarship', 'financial aid', 'tuition'
  ];
  
  const queryLower = query.toLowerCase();
  return programKeywords.some(keyword => queryLower.includes(keyword));
}

// Function to clean JSON from markdown formatting
function extractJsonFromMarkdown(content: string): string {
  console.log('Raw content received:', content);
  
  // Remove markdown code blocks if present
  let cleanedContent = content.trim();
  
  // Remove ```json at the beginning
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.substring(7);
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.substring(3);
  }
  
  // Remove ``` at the end
  if (cleanedContent.endsWith('```')) {
    cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
  }
  
  // Trim whitespace
  cleanedContent = cleanedContent.trim();
  
  console.log('Cleaned content:', cleanedContent);
  return cleanedContent;
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

    // Enhanced system prompt with detailed structure requirements
    const systemPrompt = `You are an academic program finder that searches for detailed academic program information from various universities worldwide.
    
    Given a search query about academic programs, provide comprehensive information about 8-10 relevant programs from different universities and countries.
    
    IMPORTANT REQUIREMENTS:
    - Include programs from various universities (not just elite institutions)
    - If the query mentions "affordable", "budget", "cheap", or similar terms, prioritize universities known for reasonable tuition fees
    - Include programs from different countries and regions for diversity
    - Mix of public and private institutions
    - Include both well-known and lesser-known quality institutions
    - Only use information from official university websites and verified educational sources
    - Extract specific details like tuition fees, deadlines, duration, and requirements
    
    Format your response as a JSON array with objects containing these fields:
    - programName (string): Official name of the academic program
    - university (string): Official university or institution name  
    - degreeType (string): Type of degree (PhD, Masters, Bachelor's, etc.)
    - country (string): Country where the institution is located
    - description (string): Brief description (max 150 words)
    - tuition (string, optional): Tuition fee information if available
    - deadline (string, optional): Application deadline if available
    - applicationDeadline (string, optional): Specific application deadline date if available
    - duration (string, optional): Program duration if available
    - requirements (string, optional): Brief admission requirements if available
    - fees (object, optional): Breakdown of fees with domestic, international, eu fields if available
    - website (string, optional): Official program website URL if available
    - admissionRequirements (array, optional): List of specific admission requirements if available
    - programDetails (object, optional): Additional details with credits, format, startDate if available
    
    Return ONLY the JSON array, no additional text, no markdown formatting, no code blocks. Just pure JSON.
    Ensure diversity in universities, countries, and price ranges based on the search query.
    Include as much structured data as possible in the appropriate fields rather than in the description.`;

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Find 8-10 diverse academic programs related to: ${query}. Include detailed information about tuition, deadlines, duration, requirements, and other structured data. Include various universities from different countries and price ranges.`
          }
        ],
        temperature: 0.1,
        max_tokens: 6000,
        return_images: false,
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
      // Extract the content from the message
      const content = data.choices[0].message.content;
      console.log('Original content from Perplexity:', content);
      
      // Clean the content from markdown formatting
      const cleanedContent = extractJsonFromMarkdown(content);
      
      // Parse the cleaned JSON
      const searchResults = JSON.parse(cleanedContent);
      
      if (!Array.isArray(searchResults)) {
        console.error('Response is not an array:', searchResults);
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

      console.log(`Successfully parsed ${searchResults.length} search results from ${new Set(searchResults.map(r => r.university)).size} different universities`);
      return new Response(
        JSON.stringify({ searchResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      console.error('Failed content:', data.choices[0].message.content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse search results. Please try again with a different search query.' }),
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
