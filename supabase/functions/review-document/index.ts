
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Function to check if content is too short for proper analysis
function isContentTooShort(content: string): boolean {
  // Check if content is less than 100 characters or 20 words
  return content.length < 100 || content.split(/\s+/).length < 20;
}

// Generate mock feedback for development or when content is too short
function generateMockFeedback() {
  return {
    summary: "The document is too short for a proper evaluation. Please expand your content to include a complete statement of purpose with your background, goals, and why you're a good fit for the program.",
    improvementPoints: [
      "Add more details about your academic background",
      "Include your specific career goals",
      "Explain why you're interested in this particular program",
      "Provide examples of relevant experiences",
      "Expand on how this program will help you achieve your goals"
    ],
    quotedImprovements: [
      {
        originalText: "Want to do this mba",
        improvedText: "I am passionate about pursuing an MBA at your esteemed institution because it aligns perfectly with my career goals in business leadership",
        explanation: "This provides a clear motivation and shows enthusiasm for the specific program"
      }
    ],
    score: 3
  };
}

// Function to get the system prompt based on document type
function getSystemPrompt(documentType: string, fileName?: string) {
  let systemPrompt = '';
  
  // Base prompt by document type
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
  
  // Add information about file if it's an uploaded document
  if (fileName) {
    systemPrompt += `\nNote: This content was extracted from the uploaded file "${fileName}". Focus your feedback on the actual content from this file.`;
  }
  
  // Add instructions for response format
  systemPrompt += `
    IMPORTANT: Analyze ONLY the provided document content. Do NOT create your own examples or content.
    Review EXACTLY what was provided, without modifications or additions.
    
    You MUST identify 3-5 specific sections/sentences from the ACTUAL document that could be improved.
    For each identified section:
    1. Quote the original text EXACTLY as it appears in the document (do not make up text)
    2. Provide a specific, improved version of that text
    3. Explain why your version is better
    
    Format your response as a JSON object with the following structure (DO NOT include markdown formatting or code blocks in your response):
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
    
    CRITICAL: The originalText MUST be exact quotes that exist verbatim in the provided document.
    DO NOT INVENT OR MAKE UP quotes that don't exist in the document!
    Return ONLY the JSON object with no additional text or markdown.`;

  return systemPrompt;
}

// Function to get the system prompt for generating an improved draft
function getImprovedDraftPrompt(documentType: string) {
  let systemPrompt = '';
  
  // Base prompt by document type
  switch(documentType) {
    case 'SOP':
      systemPrompt = `You are an expert academic application writer, specialized in improving Statements of Purpose for university applications.`;
      break;
    case 'CV':
      systemPrompt = `You are an expert academic application writer, specialized in improving CVs and resumes for university applications.`;
      break;
    case 'Essay':
      systemPrompt = `You are an expert academic application writer, specialized in improving essays for university applications.`;
      break;
    case 'LOR':
      systemPrompt = `You are an expert academic application writer, specialized in improving Letters of Recommendation for university applications.`;
      break;
    case 'PersonalEssay':
      systemPrompt = `You are an expert academic application writer, specialized in improving Personal Essays for university applications.`;
      break;
    case 'ScholarshipEssay':
      systemPrompt = `You are an expert academic application writer, specialized in improving Scholarship Essays for university applications.`;
      break;
    default:
      systemPrompt = `You are an expert academic application writer, specialized in improving ${documentType}s for university applications.`;
  }
  
  systemPrompt += `
    Your task is to improve the provided document based on the feedback given.
    
    IMPORTANT:
    1. Maintain the SAME OVERALL STRUCTURE and FORMAT as the original document
    2. Keep the same topics, themes, and personal experiences
    3. Preserve the author's voice and personal style
    4. Apply the specific improvements suggested in the feedback
    5. Make additional improvements to the document's clarity, flow, and impact
    6. Do not add fictional details or experiences that weren't in the original
    
    Return ONLY the improved document text, with no additional comments or explanations.
    The improved version should be ready to use as-is.`;

  return systemPrompt;
}

// Function to call OpenAI API
async function callOpenAI(content: string, systemPrompt: string, openaiApiKey: string) {
  console.log(`Analyzing document content (length: ${content.length})`);
  console.log("Sample content:", content.substring(0, 100) + "...");
  
  try {
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
  } catch (error) {
    console.error('OpenAI API call error:', error);
    throw error;
  }
}

// Function to generate an improved draft based on original content and feedback
async function generateImprovedDraft(originalContent: string, feedbackData: any, documentType: string, openaiApiKey: string) {
  console.log(`Generating improved draft for ${documentType} (length: ${originalContent.length})`);
  
  // Prepare the feedback in a readable format for the AI
  const feedbackForAI = `
  The original document received the following feedback:
  
  Overall assessment: ${feedbackData.summary}
  
  Key improvement points:
  ${feedbackData.improvementPoints.map((point: string) => `- ${point}`).join('\n')}
  
  Specific text improvements suggested:
  ${feedbackData.quotedImprovements.map((improvement: any) => 
    `Original: "${improvement.originalText}"
    Suggested improvement: "${improvement.improvedText}"
    Reason: ${improvement.explanation}`
  ).join('\n\n')}
  `;
  
  // Combine original content with feedback for context
  const promptContent = `
  ORIGINAL DOCUMENT:
  ${originalContent}
  
  FEEDBACK:
  ${feedbackForAI}
  
  Please generate an improved version of this document that addresses all the feedback points while maintaining the author's voice and the document's purpose.
  `;
  
  try {
    const systemPrompt = getImprovedDraftPrompt(documentType);
    const improvedContent = await callOpenAI(promptContent, systemPrompt, openaiApiKey);
    return improvedContent;
  } catch (error) {
    console.error('Error generating improved draft:', error);
    throw new Error('Failed to generate improved document draft');
  }
}

// Helper function to parse OpenAI response that might be wrapped in markdown code blocks
function parseJsonResponse(response: string) {
  try {
    // First try to parse it directly (if it's already valid JSON)
    return JSON.parse(response);
  } catch (e) {
    // If direct parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerError) {
        console.error('Failed to parse JSON from markdown block:', innerError);
        console.error('Extracted content:', jsonMatch[1]);
        throw new Error('Failed to parse JSON from OpenAI response');
      }
    }
    
    // If we couldn't find a code block, try to find anything that looks like JSON
    const possibleJson = response.match(/(\{[\s\S]*\})/);
    if (possibleJson && possibleJson[1]) {
      try {
        return JSON.parse(possibleJson[1]);
      } catch (innerError) {
        console.error('Failed to parse JSON from possible JSON match:', innerError);
        console.error('Extracted content:', possibleJson[1]);
        throw new Error('Failed to parse JSON from OpenAI response');
      }
    }
    
    // If all else fails, throw the original error
    console.error('Original parsing error:', e);
    console.error('Raw response:', response);
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

// Main handler function
serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // Get request data
    const requestData = await req.json();
    const { content, documentType, programId, testMode, fileName, action, originalContent, feedback } = requestData;
    
    // Validate request data
    if (!content && !originalContent) {
      return createErrorResponse('Missing document content', 400);
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('Missing OpenAI API key');
      return createErrorResponse('Server configuration error: Missing API key', 500);
    }
    
    // Handle different actions
    if (action === 'generate-improved-draft') {
      if (!originalContent || !feedback) {
        return createErrorResponse('Missing original content or feedback for draft generation', 400);
      }
      
      try {
        console.log(`Generating improved draft for ${documentType}`);
        const improvedDraft = await generateImprovedDraft(originalContent, feedback, documentType, openaiApiKey);
        
        return new Response(
          JSON.stringify({ improvedDraft }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error generating improved draft:', error);
        return createErrorResponse(error.message, 500);
      }
    } else {
      // Default action: review document
      
      // Check if content is too short for proper analysis and we're in test mode
      if (testMode && isContentTooShort(content)) {
        console.log('Content is too short, returning mock feedback');
        
        // Return mock feedback for content that is too short to analyze properly
        const mockFeedback = generateMockFeedback();
        
        return new Response(
          JSON.stringify(mockFeedback),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log request information
      console.log(`Processing ${documentType} review ${testMode ? 'in test mode' : 'for saving to DB'}${fileName ? ` (file: ${fileName})` : ''}`);
      console.log(`Content length: ${content.length} characters`);
      console.log(`Content sample: ${content.substring(0, 100)}...`);

      try {
        // Get system prompt
        const systemPrompt = getSystemPrompt(documentType, fileName);
        
        // Call OpenAI API
        const aiResponse = await callOpenAI(content, systemPrompt, openaiApiKey);
        
        // Parse the AI response using our enhanced parsing function
        let feedbackData;
        try {
          feedbackData = parseJsonResponse(aiResponse);
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.error('Raw AI response:', aiResponse);
          
          // If in test mode, return mock data when parsing fails
          if (testMode) {
            console.log('Parsing failed in test mode, returning mock feedback');
            return new Response(
              JSON.stringify(generateMockFeedback()),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          return createErrorResponse('Failed to parse AI response', 500);
        }

        // Return response
        return new Response(
          JSON.stringify({
            summary: feedbackData.summary,
            score: feedbackData.score,
            improvementPoints: feedbackData.improvementPoints,
            quotedImprovements: feedbackData.quotedImprovements || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in review-document function:', error);
        
        // If in test mode, return mock data when API call fails
        if (testMode) {
          console.log('API call failed in test mode, returning mock feedback');
          return new Response(
            JSON.stringify(generateMockFeedback()),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return createErrorResponse(error.message, 500);
      }
    }
  } catch (error) {
    console.error('Unhandled error in review-document function:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
