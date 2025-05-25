
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scoreboardApiKey = Deno.env.get('SCOREBOARD_API_KEY');
    
    if (!scoreboardApiKey) {
      console.error('Scoreboard API key not found');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching US universities with query:', query);
    
    // Make actual API call to Scoreboard API
    const apiUrl = `https://api.scoreboard.com/v1/universities/search?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${scoreboardApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Scoreboard API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Scoreboard API' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiData = await response.json();
    console.log('Scoreboard API response:', apiData);

    // Transform the API response to match our expected format
    const transformedResults = apiData.universities?.map((university: any) => ({
      name: university.name || 'Unknown University',
      location: `${university.city || ''}, ${university.state || ''}`.trim().replace(/^,|,$/, ''),
      ranking: university.ranking,
      tuition: university.tuition_cost,
      acceptanceRate: university.acceptance_rate ? `${university.acceptance_rate}%` : undefined,
      programsOffered: university.programs || [],
      description: university.description || university.about,
    })) || [];

    console.log(`Found ${transformedResults.length} results for query: ${query}`);

    return new Response(
      JSON.stringify({ results: transformedResults }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in us-university-search function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search universities' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
