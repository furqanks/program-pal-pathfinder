
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewDocumentBody {
  content: string;
  documentType: string;
  programId: string | null;
}

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

    // Get request data
    const { content, documentType, programId } = await req.json() as ReviewDocumentBody;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Missing document content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    console.log(`Processing ${documentType} review for user ${userId}`);

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
            content: `You are an expert academic application reviewer, specialized in reviewing ${documentType}s for university applications. 
            Your task is to review the given ${documentType} and provide constructive feedback.
            
            Format your response as a JSON object with the following structure:
            {
              "summary": "One paragraph summarizing the quality of the document and overall assessment",
              "score": A number between 1 and 10 representing the quality of the document,
              "improvementPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
            }
            
            Provide 3-6 clear improvement points. Be specific, actionable, and constructive.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      console.error('API response error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Error getting document feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response
    let feedbackData;
    try {
      feedbackData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Error parsing AI response:', e);
      feedbackData = {
        summary: "There was an error processing the feedback. Please try again later.",
        score: 5,
        improvementPoints: ["Could not generate specific feedback points."]
      };
    }
    
    // Get next version number
    const { data: versionData } = await supabase.rpc('get_next_version_number', {
      p_user_id: userId,
      p_document_type: documentType,
      p_program_id: programId
    });
    
    const versionNumber = versionData || 1;
    
    // Insert document and feedback into database
    const { data: insertData, error: insertError } = await supabase
      .from('user_documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        program_id: programId,
        original_text: content,
        feedback_summary: feedbackData.summary,
        improvement_points: feedbackData.improvementPoints,
        version_number: versionNumber
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Error inserting document data:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error saving document feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: insertData.id,
        summary: feedbackData.summary,
        score: feedbackData.score,
        improvementPoints: feedbackData.improvementPoints,
        versionNumber
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in review-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
