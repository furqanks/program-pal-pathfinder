
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
  testMode?: boolean; // Flag to indicate if this is just for testing
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
    const { content, documentType, programId, testMode } = await req.json() as ReviewDocumentBody;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Missing document content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For test mode, we don't need to validate the auth token
    let userId;
    if (!testMode) {
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
      
      userId = userData.user.id;
    }
    
    console.log(`Processing ${documentType} review ${testMode ? 'in test mode' : `for user ${userId}`}`);

    // Set system prompt based on document type
    let systemPrompt = '';
    
    switch(documentType) {
      case 'SOP':
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing Statements of Purpose for university applications.
        Your task is to review the given Statement of Purpose and provide constructive feedback on how to improve it.`;
        break;
      case 'CV':
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing CVs and resumes for university applications.
        Your task is to review the given CV/resume and provide constructive feedback on how to improve it.`;
        break;
      case 'Essay':
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing essays for university applications.
        Your task is to review the given essay and provide constructive feedback on how to improve it.`;
        break;
      case 'LOR':
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing Letters of Recommendation for university applications.
        Your task is to review the given Letter of Recommendation and provide constructive feedback on how to improve it.`;
        break;
      case 'PersonalEssay':
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing Personal Essays for university applications.
        Your task is to review the given Personal Essay and provide constructive feedback on how to improve it.`;
        break;
      case 'ScholarshipEssay':
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing Scholarship Essays for university applications.
        Your task is to review the given Scholarship Essay and provide constructive feedback on how to improve it.`;
        break;
      default:
        systemPrompt = `You are an expert academic application reviewer, specialized in reviewing ${documentType}s for university applications.
        Your task is to review the given ${documentType} and provide constructive feedback.`;
    }
    
    systemPrompt += `
      I want you to identify 3-5 specific sections/sentences from the document that could be improved.
      For each identified section:
      1. Quote the original text exactly as it appears in the document
      2. Provide a specific, improved version of that text
      3. Explain why your version is better
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "One paragraph summarizing the quality of the document and overall assessment",
        "score": A number between 1 and 10 representing the quality of the document,
        "improvementPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
        "quotedImprovements": [
          {
            "originalText": "Exact quote from the document",
            "improvedText": "Your improved version of the text",
            "explanation": "Brief explanation of why this improvement helps"
          }
        ]
      }
      
      The quotedImprovements array should contain 3-5 items.
      Be specific, actionable, and constructive.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content
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
        improvementPoints: ["Could not generate specific feedback points."],
        quotedImprovements: []
      };
    }

    // For test mode, just return the feedback without saving to database
    if (testMode) {
      return new Response(
        JSON.stringify({
          summary: feedbackData.summary,
          score: feedbackData.score,
          improvementPoints: feedbackData.improvementPoints,
          quotedImprovements: feedbackData.quotedImprovements || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If not in test mode, proceed with database operations
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
        quoted_improvements: feedbackData.quotedImprovements || [],
        score: feedbackData.score,
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
        quotedImprovements: feedbackData.quotedImprovements || [],
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
