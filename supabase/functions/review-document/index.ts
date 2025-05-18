
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

// Helper function to handle CORS preflight requests
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Helper function to send error responses
function createErrorResponse(message: string, status: number) {
  console.error(`Error: ${message}`);
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper to validate request data
function validateRequestData(content: string) {
  if (!content) {
    return { isValid: false, error: 'Missing document content' };
  }
  return { isValid: true, error: null };
}

// Helper to get user ID from JWT
async function getUserIdFromJwt(jwt: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
  
  if (userError || !userData) {
    console.error('Error getting user data:', userError);
    return { userId: null, error: 'Invalid authorization token' };
  }
  
  return { userId: userData.user.id, error: null };
}

// Function to get the system prompt based on document type
function getSystemPrompt(documentType: string) {
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

  return systemPrompt;
}

// Function to call OpenAI API
async function callOpenAI(content: string, systemPrompt: string, openaiApiKey: string) {
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
    throw new Error('Error getting document feedback');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Function to parse the AI response
function parseAIResponse(aiResponse: string) {
  try {
    return JSON.parse(aiResponse);
  } catch (e) {
    console.error('Error parsing AI response:', e);
    return {
      summary: "There was an error processing the feedback. Please try again later.",
      score: 5,
      improvementPoints: ["Could not generate specific feedback points."],
      quotedImprovements: []
    };
  }
}

// Function to save feedback to database
async function saveFeedbackToDatabase(
  userId: string, 
  documentType: string, 
  programId: string | null, 
  content: string, 
  feedbackData: any
) {
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
    throw new Error('Error saving document feedback');
  }

  return { insertData, versionNumber };
}

// Main function to review document
async function reviewDocument(req: Request) {
  // Get request data
  const { content, documentType, programId, testMode } = await req.json() as ReviewDocumentBody;
  
  // Validate request data
  const validation = validateRequestData(content);
  if (!validation.isValid) {
    return createErrorResponse(validation.error!, 400);
  }

  // Get OpenAI API key
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('Missing OpenAI API key');
    return createErrorResponse('Server configuration error: Missing API key', 500);
  }
  
  // Log request information
  let userId;
  if (!testMode) {
    // Extract JWT token from request
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      return createErrorResponse('Missing authorization token', 401);
    }

    // Get user ID from JWT
    const userIdResult = await getUserIdFromJwt(jwt);
    if (userIdResult.error) {
      return createErrorResponse(userIdResult.error, 401);
    }
    
    userId = userIdResult.userId;
  }
  
  console.log(`Processing ${documentType} review ${testMode ? 'in test mode' : `for user ${userId}`}`);

  try {
    // Get system prompt
    const systemPrompt = getSystemPrompt(documentType);
    
    // Call OpenAI API
    const aiResponse = await callOpenAI(content, systemPrompt, openaiApiKey);
    
    // Parse the AI response
    const feedbackData = parseAIResponse(aiResponse);

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
    
    // Save feedback to database
    const { insertData, versionNumber } = await saveFeedbackToDatabase(
      userId!, 
      documentType, 
      programId, 
      content, 
      feedbackData
    );

    // Return response
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
    return createErrorResponse(error.message, 500);
  }
}

// Main handler function
serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    return await reviewDocument(req);
  } catch (error) {
    console.error('Unhandled error in review-document function:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
