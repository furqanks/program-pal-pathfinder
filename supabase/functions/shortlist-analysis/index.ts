
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from env variable
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token from request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user ID from JWT
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !userData) {
      console.error('Error getting user data:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = userData.user.id;
    
    // Fetch user's saved programs
    const { data: programs, error: programsError } = await supabase
      .from('programs_saved')
      .select('*')
      .eq('user_id', userId);
    
    if (programsError) {
      console.error('Error fetching programs:', programsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching saved programs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!programs || programs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No saved programs found to analyze' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${programs.length} programs for user ${userId}`);

    // Prepare program data for OpenAI
    const programsData = programs.map(p => ({
      programName: p.program_name,
      university: p.university,
      degreeType: p.degree_type,
      country: p.country,
      tuition: p.tuition || 'Unknown',
      deadline: p.deadline || 'Unknown',
      status: p.status_tag || 'Considering'
    }));

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more affordable model
        messages: [
          {
            role: 'system',
            content: `You are an expert academic advisor, specialized in helping students choose universities and programs.
            Analyze the given list of programs and provide strategic insights to help the user make better decisions.
            
            Format your response as a JSON object with the following structure:
            {
              "summary": "A detailed paragraph summarizing patterns and insights from the shortlist",
              "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"],
              "countryAnalysis": "Analysis of geographical distribution",
              "degreeTypeAnalysis": "Analysis of degree types",
              "timelineInsight": "Insight about application timeline based on deadlines",
              "financialInsight": "Insight about financial aspects based on tuition"
            }
            
            Be specific, actionable, and insightful. Consider balance across countries, program types, deadlines, and finances.`
          },
          {
            role: 'user',
            content: JSON.stringify(programsData)
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      console.error('API response error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Error analyzing shortlist' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response
    let analysisData;
    try {
      analysisData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Error parsing AI response:', e);
      analysisData = {
        summary: "There was an error processing the analysis. Please try again later.",
        suggestions: ["Could not generate specific suggestions."],
        countryAnalysis: "Analysis unavailable",
        degreeTypeAnalysis: "Analysis unavailable",
        timelineInsight: "Analysis unavailable",
        financialInsight: "Analysis unavailable"
      };
    }

    return new Response(
      JSON.stringify(analysisData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in shortlist-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
