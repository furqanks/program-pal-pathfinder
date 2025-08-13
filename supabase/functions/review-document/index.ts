
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

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
  return content.length < 100 || content.split(/\s+/).length < 20;
}

// Generate casual, relatable mock feedback
function generateCasualMockFeedback() {
  return {
    summary: "Hey! I can see you're getting started, which is awesome. Right now though, your draft is pretty brief and could use some more substance to really shine. Think of your SOP like telling a friend about your dreams and goals - you want to share your story, your 'why', and what makes you excited about this path. Add some personal experiences, specific examples of what you've done, and paint a picture of where you want to go. The admissions team wants to get to know the real you!",
    improvementPoints: [
      "Start with a hook that shows your personality - maybe a moment that sparked your interest",
      "Share specific stories and examples that show (don't just tell) your qualities",
      "Explain why this particular program excites you - show you've done your research",
      "Connect your past experiences to your future goals in a natural way",
      "Let your authentic voice shine through - be professional but personable",
      "End with a vision that gets the reader excited about your potential",
      "Use varied sentence structures to keep it engaging and conversational"
    ],
    quotedImprovements: [
      {
        originalText: "Want to do this mba",
        improvedText: "I'm excited to pursue an MBA at [University Name] because I've discovered that my passion for solving complex business challenges aligns perfectly with your program's focus on innovative leadership and social impact",
        explanation: "This version shows genuine enthusiasm, demonstrates research about the specific program, and connects personal interests with the school's strengths. It sounds like a real person talking about their goals, not a robot."
      }
    ],
    score: 4
  };
}

// Function to get the system prompt with casual, conversational tone
function getSystemPrompt(documentType: string, fileName?: string) {
  let systemPrompt = '';
  
  // Base prompt by document type with casual approach
  switch(documentType) {
    case 'SOP':
      systemPrompt = `You are a friendly, experienced admissions consultant who gives helpful, honest feedback on Statements of Purpose. You understand that writing about yourself can be tough, so you provide encouraging but constructive advice that helps students tell their authentic stories in compelling ways.

Your feedback should feel like advice from a knowledgeable friend - supportive, specific, and actionable. Use a conversational tone that puts the writer at ease while still providing professional guidance.`;
      break;
    case 'CV':
      systemPrompt = `You are a supportive career advisor who helps students and professionals present their experiences effectively. You provide friendly, practical feedback that helps people showcase their achievements without sounding boastful.

Your advice should be encouraging and specific, helping the writer understand how to present their story in the most compelling way.`;
      break;
    case 'Essay':
      systemPrompt = `You are an encouraging writing coach who specializes in helping students craft compelling application essays. You understand that finding your voice can be challenging, so you provide warm, constructive feedback that builds confidence.

Your tone should be supportive and conversational, like a mentor who genuinely wants to see the writer succeed.`;
      break;
    default:
      systemPrompt = `You are a supportive writing coach who provides friendly, constructive feedback on ${documentType}s. Your goal is to help writers improve while maintaining their authentic voice.

Use an encouraging, conversational tone that feels like helpful advice from a knowledgeable friend.`;
  }
  
  // Add information about file if it's an uploaded document
  if (fileName) {
    systemPrompt += `\n\nNote: This content was extracted from the uploaded file "${fileName}". Focus your feedback on the actual content from this file.`;
  }
  
  // Add comprehensive instructions for casual, helpful feedback
  systemPrompt += `

FEEDBACK APPROACH:

1. BE ENCOURAGING: Start with what's working well, then provide constructive suggestions
2. BE CONVERSATIONAL: Write like you're talking to a friend who asked for help
3. BE SPECIFIC: Give concrete examples and actionable advice
4. BE AUTHENTIC: Help the writer find and express their genuine voice
5. BE PRACTICAL: Focus on changes that will make a real difference

ANALYSIS FRAMEWORK:

1. STORY & AUTHENTICITY:
   - Does the writer's personality come through?
   - Are they telling their unique story?
   - Do they sound genuine and passionate?

2. CLARITY & FLOW:
   - Is the main message clear?
   - Does it flow naturally from point to point?
   - Are the examples specific and relevant?

3. CONNECTION & PURPOSE:
   - Do they show why they're excited about this opportunity?
   - Have they connected their past to their future goals?
   - Will the reader remember them after reading?

FEEDBACK STYLE:
- Use "you" to speak directly to the writer
- Include encouraging phrases like "I can see that..." or "You're on the right track with..."
- Avoid overly formal academic language
- Make suggestions feel doable, not overwhelming
- Include specific examples of how to improve

MULTI-DIMENSIONAL SCORING:
Provide detailed scores for different aspects:

RESPONSE FORMAT (JSON only):

{
  "summary": "Write 2-3 paragraphs of friendly, encouraging feedback that feels like advice from a mentor. Start with strengths, then address areas for improvement. Use a warm, conversational tone that builds confidence while being honest about what needs work.",
  "overallScore": [Number 1-10 with encouraging context],
  "detailedScores": {
    "clarity": [Number 1-10],
    "authenticity": [Number 1-10], 
    "structure": [Number 1-10],
    "impact": [Number 1-10],
    "grammar": [Number 1-10],
    "programFit": [Number 1-10]
  },
  "strengthsIdentified": [
    "Key strengths in the document that should be highlighted",
    "Areas where the writer's personality shines through",
    "Well-executed sections or compelling stories"
  ],
  "improvementPoints": [
    "Specific, actionable advice written in friendly tone",
    "Suggestions that help the writer's authentic voice shine", 
    "Concrete examples of what to add or change",
    "Encouraging guidance on structure and flow",
    "Tips for making the writing more engaging",
    "Advice on connecting experiences to goals",
    "Suggestions for memorable, authentic touches"
  ],
  "quotedImprovements": [
    {
      "originalText": "Exact quote from document",
      "improvedText": "Improved version that sounds more natural and engaging", 
      "explanation": "Friendly explanation of why this version works better, focusing on authenticity and impact"
    }
  ],
  "industrySpecificAdvice": [
    "Advice specific to their field/program type",
    "Industry standards and expectations to consider",
    "Common pitfalls in this type of application"
  ]
}

CRITICAL REQUIREMENTS:
- Use only exact quotes from the provided document
- Keep the tone conversational and encouraging throughout
- Focus on helping the writer express their authentic self
- Make suggestions feel achievable and specific
- Return ONLY the JSON object with no additional formatting`;

  return systemPrompt;
}

// Function to get the system prompt for generating an improved draft with casual tone
function getImprovedDraftPrompt(documentType: string) {
  return `You are a skilled writing coach who helps students improve their application documents while keeping their authentic voice. You excel at making writing more engaging, specific, and compelling without losing the writer's personality.

IMPROVEMENT STRATEGY:

1. PRESERVE AUTHENTICITY:
   - Keep the writer's unique voice and personal experiences
   - Maintain all factual information unchanged
   - Preserve the writer's natural personality and enthusiasm

2. ENHANCE ENGAGEMENT:
   - Make the opening more compelling and personal
   - Improve flow between ideas and paragraphs
   - Add specific details and concrete examples where appropriate
   - Strengthen the connection between experiences and goals

3. IMPROVE CLARITY:
   - Ensure the main message is clear and memorable
   - Smooth transitions between different topics
   - Make the language more natural and conversational
   - Eliminate awkward phrasing while maintaining professionalism

4. APPLY FEEDBACK:
   - Address all improvement points from the feedback
   - Implement suggested text improvements naturally
   - Enhance areas identified as needing work
   - Maintain appropriate length and structure

TONE GUIDELINES:
- Keep it conversational but professional
- Let personality shine through
- Use natural, engaging language
- Avoid overly formal or stilted phrasing
- Make it sound like the writer talking about their passion

Return ONLY the improved document text, ready for immediate use.`;
}

// Function to call OpenAI API
async function callOpenAI(content: string, systemPrompt: string, openaiApiKey: string) {
  console.log(`Analyzing document content (length: ${content.length})`);
  console.log("Sample content:", content.substring(0, 100) + "...");
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': openaiApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', 
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
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error('API response error:', response.status, await response.text());
      throw new Error('Error getting document feedback');
    }

    const data = await response.json();
    return data.content[0].text;
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
  
  Key improvement areas:
  ${feedbackData.improvementPoints.map((point: string) => `- ${point}`).join('\n')}
  
  Specific text improvements suggested:
  ${feedbackData.quotedImprovements.map((improvement: any) => 
    `Original: "${improvement.originalText}"
    Suggested improvement: "${improvement.improvedText}"
    Why it's better: ${improvement.explanation}`
  ).join('\n\n')}
  `;
  
  // Combine original content with feedback for context
  const promptContent = `
  ORIGINAL DOCUMENT:
  ${originalContent}
  
  FEEDBACK TO ADDRESS:
  ${feedbackForAI}
  
  Please generate an improved version that addresses all the feedback while maintaining the writer's authentic voice and making it more engaging and compelling.
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

// Helper function to parse OpenAI response
function parseJsonResponse(response: string) {
  try {
    return JSON.parse(response);
  } catch (e) {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerError) {
        console.error('Failed to parse JSON from markdown block:', innerError);
        throw new Error('Failed to parse JSON from OpenAI response');
      }
    }
    
    const possibleJson = response.match(/(\{[\s\S]*\})/);
    if (possibleJson && possibleJson[1]) {
      try {
        return JSON.parse(possibleJson[1]);
      } catch (innerError) {
        console.error('Failed to parse JSON from possible JSON match:', innerError);
        throw new Error('Failed to parse JSON from OpenAI response');
      }
    }
    
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

    // Get Claude API key
    const openaiApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!openaiApiKey) {
      console.error('Missing Anthropic API key');
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
        console.log('Content is too short, returning casual mock feedback');
        
        const mockFeedback = generateCasualMockFeedback();
        
        return new Response(
          JSON.stringify(mockFeedback),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log request information
      console.log(`Processing casual ${documentType} review ${testMode ? 'in test mode' : 'for saving to DB'}${fileName ? ` (file: ${fileName})` : ''}`);
      console.log(`Content length: ${content.length} characters`);

      try {
        // Get casual, friendly system prompt
        const systemPrompt = getSystemPrompt(documentType, fileName);
        
        // Call OpenAI API
        const aiResponse = await callOpenAI(content, systemPrompt, openaiApiKey);
        
        // Parse the AI response
        let feedbackData;
        try {
          feedbackData = parseJsonResponse(aiResponse);
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          
          // If in test mode, return mock data when parsing fails
          if (testMode) {
            console.log('Parsing failed in test mode, returning casual mock feedback');
            return new Response(
              JSON.stringify(generateCasualMockFeedback()),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          return createErrorResponse('Failed to parse AI response', 500);
        }

        // Return comprehensive response with enhanced feedback
        return new Response(
          JSON.stringify({
            summary: feedbackData.summary,
            score: feedbackData.overallScore || feedbackData.score,
            detailedScores: feedbackData.detailedScores || {},
            strengthsIdentified: feedbackData.strengthsIdentified || [],
            improvementPoints: feedbackData.improvementPoints,
            quotedImprovements: feedbackData.quotedImprovements || [],
            industrySpecificAdvice: feedbackData.industrySpecificAdvice || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in review-document function:', error);
        
        // If in test mode, return mock data when API call fails
        if (testMode) {
          console.log('API call failed in test mode, returning casual mock feedback');
          return new Response(
            JSON.stringify(generateCasualMockFeedback()),
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
