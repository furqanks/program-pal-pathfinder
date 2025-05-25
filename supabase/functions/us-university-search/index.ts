
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
    
    // TODO: Replace with actual Scoreboard API endpoint when available
    // For now, returning mock data that matches the expected format
    const mockResults = [
      {
        name: "Stanford University",
        location: "Stanford, CA",
        ranking: 6,
        tuition: "$56,169",
        acceptanceRate: "4.3%",
        programsOffered: ["Computer Science", "Engineering", "Business"],
        description: "Private research university known for innovation and entrepreneurship."
      },
      {
        name: "University of California, Berkeley",
        location: "Berkeley, CA",
        ranking: 22,
        tuition: "$14,226 (in-state), $44,066 (out-of-state)",
        acceptanceRate: "17.5%",
        programsOffered: ["Engineering", "Computer Science", "Business", "Liberal Arts"],
        description: "Public research university with strong programs across multiple disciplines."
      },
      {
        name: "Massachusetts Institute of Technology",
        location: "Cambridge, MA",
        ranking: 2,
        tuition: "$53,790",
        acceptanceRate: "7.3%",
        programsOffered: ["Engineering", "Computer Science", "Physics", "Mathematics"],
        description: "Premier technical institute focusing on science and engineering."
      },
      {
        name: "University of Texas at Austin",
        location: "Austin, TX",
        ranking: 38,
        tuition: "$11,448 (in-state), $39,322 (out-of-state)",
        acceptanceRate: "31.8%",
        programsOffered: ["Engineering", "Business", "Liberal Arts", "Natural Sciences"],
        description: "Large public research university with diverse academic programs."
      },
      {
        name: "Georgia Institute of Technology",
        location: "Atlanta, GA",
        ranking: 44,
        tuition: "$12,682 (in-state), $33,794 (out-of-state)",
        acceptanceRate: "23.2%",
        programsOffered: ["Engineering", "Computer Science", "Business"],
        description: "Public technical university with strong engineering programs."
      }
    ];

    // Filter results based on query keywords
    const filteredResults = mockResults.filter(result => {
      const searchTerms = query.toLowerCase();
      return (
        result.name.toLowerCase().includes(searchTerms) ||
        result.location.toLowerCase().includes(searchTerms) ||
        result.programsOffered.some(program => program.toLowerCase().includes(searchTerms)) ||
        result.description.toLowerCase().includes(searchTerms)
      );
    });

    console.log(`Found ${filteredResults.length} results for query: ${query}`);

    return new Response(
      JSON.stringify({ results: filteredResults.length > 0 ? filteredResults : mockResults }),
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
