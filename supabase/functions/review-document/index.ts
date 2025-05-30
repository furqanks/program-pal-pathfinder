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
    summary: "The document is too short for a comprehensive evaluation. A strong academic document should include detailed background information, clear objectives, specific examples, and compelling reasoning. Please expand your content to include: your academic/professional background, specific goals, why you're interested in this particular program, relevant experiences with concrete examples, and how this opportunity aligns with your career trajectory.",
    improvementPoints: [
      "Expand your opening with a compelling hook that immediately captures the reader's attention",
      "Add specific examples and quantifiable achievements from your background",
      "Include detailed reasoning for why you're interested in this particular program/opportunity",
      "Demonstrate knowledge of the institution and how it aligns with your goals",
      "Strengthen your conclusion with concrete next steps and long-term vision",
      "Improve sentence variety and transition between paragraphs",
      "Add more sophisticated vocabulary while maintaining clarity"
    ],
    quotedImprovements: [
      {
        originalText: "Want to do this mba",
        improvedText: "I am passionate about pursuing an MBA at [Institution Name] because it perfectly aligns with my career goals in strategic business leadership and my commitment to driving innovation in the technology sector",
        explanation: "This revision provides specific motivation, shows research about the program, and demonstrates clear career direction with professional language"
      }
    ],
    score: 3
  };
}

// Function to get the system prompt based on document type and preferences
function getSystemPrompt(documentType: string, fileName?: string, tone?: string, style?: string) {
  let systemPrompt = '';
  
  // Base prompt by document type
  switch(documentType) {
    case 'SOP':
      systemPrompt = `You are an expert academic application reviewer with 15+ years of experience reviewing Statements of Purpose for top-tier universities worldwide. You understand what admissions committees look for and can identify both strengths and areas for improvement in academic writing.

Your task is to provide comprehensive, actionable feedback on this Statement of Purpose that will help the applicant create a compelling narrative that stands out to admissions committees.`;
      break;
    case 'CV':
      systemPrompt = `You are an expert academic application reviewer specializing in CVs and resumes for university applications, graduate programs, and academic positions. You understand how to present academic achievements, research experience, and professional accomplishments effectively.

Your task is to provide detailed feedback on this CV/resume to help the applicant present their qualifications in the most compelling way possible.`;
      break;
    case 'Essay':
      systemPrompt = `You are an expert academic writing coach with extensive experience in reviewing application essays for universities, scholarships, and competitive programs. You understand how to craft compelling narratives that showcase personality, achievements, and potential.

Your task is to provide comprehensive feedback on this essay to help the writer create a memorable and impactful piece.`;
      break;
    case 'LOR':
      systemPrompt = `You are an expert academic application reviewer specializing in Letters of Recommendation for university applications and academic programs. You understand what makes recommendation letters effective and persuasive to admissions committees.

Your task is to provide detailed feedback on this Letter of Recommendation to help strengthen its impact and credibility.`;
      break;
    case 'PersonalEssay':
      systemPrompt = `You are an expert writing coach specializing in personal essays for academic applications. You understand how to help applicants tell their personal stories in compelling ways that reveal character, growth, and potential.

Your task is to provide comprehensive feedback on this personal essay to help the writer craft a memorable and authentic narrative.`;
      break;
    case 'ScholarshipEssay':
      systemPrompt = `You are an expert scholarship application reviewer with experience in evaluating essays for competitive scholarship programs. You understand what scholarship committees look for in terms of merit, need, and potential impact.

Your task is to provide detailed feedback on this scholarship essay to help the applicant make a compelling case for funding.`;
      break;
    default:
      systemPrompt = `You are an expert academic application reviewer with extensive experience in evaluating ${documentType}s for university applications and academic programs.

Your task is to provide comprehensive, actionable feedback on this ${documentType}.`;
  }
  
  // Add tone preference guidance
  if (tone) {
    switch(tone) {
      case 'formal':
        systemPrompt += `\n\nTONE PREFERENCE: Focus feedback on achieving a formal, professional, and academic tone. Emphasize sophisticated vocabulary, proper academic structure, and professional language conventions.`;
        break;
      case 'conversational':
        systemPrompt += `\n\nTONE PREFERENCE: Focus feedback on achieving a natural, engaging, and conversational tone while maintaining professionalism. Balance authenticity with academic appropriateness.`;
        break;
      case 'confident':
        systemPrompt += `\n\nTONE PREFERENCE: Focus feedback on achieving a confident, assertive, and self-assured tone. Help strengthen statements and eliminate tentative language.`;
        break;
      case 'humble':
        systemPrompt += `\n\nTONE PREFERENCE: Focus feedback on achieving a modest, respectful, and humble tone while still showcasing achievements effectively.`;
        break;
      case 'persuasive':
        systemPrompt += `\n\nTONE PREFERENCE: Focus feedback on achieving a compelling, convincing, and persuasive tone that effectively argues the applicant's case.`;
        break;
    }
  }
  
  // Add style preference guidance
  if (style) {
    switch(style) {
      case 'detailed':
        systemPrompt += `\n\nSTYLE PREFERENCE: Provide comprehensive, detailed analysis with extensive examples and specific guidance for improvement.`;
        break;
      case 'concise':
        systemPrompt += `\n\nSTYLE PREFERENCE: Provide brief, focused feedback with the most essential improvement points. Be direct and to-the-point.`;
        break;
      case 'developmental':
        systemPrompt += `\n\nSTYLE PREFERENCE: Focus on growth-oriented suggestions that help the writer develop their skills and understanding progressively.`;
        break;
      case 'competitive':
        systemPrompt += `\n\nSTYLE PREFERENCE: Focus on strategies that will help the document stand out in competitive application pools. Emphasize differentiation and memorable elements.`;
        break;
    }
  }
  
  // Add information about file if it's an uploaded document
  if (fileName) {
    systemPrompt += `\n\nNote: This content was extracted from the uploaded file "${fileName}". Focus your feedback on the actual content from this file.`;
  }
  
  // Add comprehensive instructions for detailed feedback
  systemPrompt += `

COMPREHENSIVE ANALYSIS FRAMEWORK:

1. CONTENT ANALYSIS:
   - Evaluate the clarity and coherence of the main message
   - Assess the logical flow and structure of arguments
   - Analyze the depth and specificity of examples provided
   - Review the balance between personal narrative and professional achievements

2. TONE AND STYLE ANALYSIS:
   - Assess whether the tone is appropriate for the target audience
   - Evaluate the level of formality and professionalism
   - Analyze sentence variety and writing sophistication
   - Consider the authenticity and personality conveyed

3. PURPOSE-SPECIFIC EVALUATION:
   - For academic applications: focus on intellectual curiosity, research potential, and academic fit
   - For scholarship applications: emphasize merit, need, and potential impact
   - For professional programs: highlight leadership potential, career trajectory, and practical experience
   - For personal essays: evaluate authenticity, growth narrative, and character revelation

4. COMPETITIVE POSITIONING:
   - Consider how this document would stand out among thousands of similar applications
   - Identify unique selling points and areas where the applicant differentiates themselves
   - Assess memorability and lasting impression

FEEDBACK REQUIREMENTS:

You MUST provide detailed feedback that includes:

1. A comprehensive summary (2-3 paragraphs) that covers:
   - Overall impression and main strengths
   - Key areas for improvement
   - Tone and style assessment
   - Competitive positioning analysis

2. 5-7 specific improvement points that include:
   - Structural improvements (organization, flow, transitions)
   - Content enhancements (specificity, examples, depth)
   - Tone and style refinements
   - Purpose-specific optimizations
   - Competitive differentiation strategies

3. 3-5 quoted improvements that demonstrate:
   - How to transform weak passages into strong ones
   - Different tone options (formal vs. conversational, confident vs. humble)
   - Examples of adding specificity and impact
   - Ways to better align with the document's purpose

IMPORTANT ANALYSIS GUIDELINES:

- Analyze ONLY the provided document content - do not create examples or content
- Quote text EXACTLY as it appears in the document
- Provide alternative phrasings that demonstrate different approaches:
  * More formal vs. more personal tone
  * More confident vs. more humble approach  
  * More specific vs. more general language
  * Better alignment with target audience expectations

- For each quoted improvement, explain:
  * Why the original is weak or could be stronger
  * How the improvement addresses specific concerns
  * What tone or style change is being demonstrated
  * How it better serves the document's purpose

RESPONSE FORMAT (JSON only, no markdown):

{
  "summary": "Comprehensive 2-3 paragraph analysis covering overall impression, main strengths, key improvement areas, tone assessment, and competitive positioning. Include specific observations about writing style, content depth, and alignment with purpose.",
  "score": [Number 1-10 with detailed reasoning],
  "improvementPoints": [
    "Structural improvement with specific guidance",
    "Content enhancement with examples of what to add",
    "Tone/style refinement with specific techniques",
    "Purpose-specific optimization advice", 
    "Competitive differentiation strategy",
    "Technical writing improvement",
    "Audience alignment enhancement"
  ],
  "quotedImprovements": [
    {
      "originalText": "Exact quote from document",
      "improvedText": "Improved version demonstrating specific technique or tone",
      "explanation": "Detailed explanation of the improvement strategy, tone change, and why it's more effective for the target audience and purpose"
    }
  ]
}

CRITICAL REQUIREMENTS:
- The originalText MUST be exact quotes from the provided document
- DO NOT invent quotes that don't exist in the document
- Provide multiple improvement approaches when possible (different tones, styles, purposes)
- Focus on actionable, specific guidance rather than general advice
- Consider the competitive landscape and what makes applications memorable
- Return ONLY the JSON object with no additional text or formatting`;

  return systemPrompt;
}

// Function to get the system prompt for generating an improved draft
function getImprovedDraftPrompt(documentType: string, tone?: string) {
  let systemPrompt = '';
  
  // Base prompt by document type
  switch(documentType) {
    case 'SOP':
      systemPrompt = `You are an expert academic application writer with extensive experience crafting compelling Statements of Purpose for top-tier universities. You understand how to transform good content into exceptional narratives that capture admissions committees' attention.`;
      break;
    case 'CV':
      systemPrompt = `You are an expert academic application writer specializing in creating impactful CVs and resumes for university applications. You know how to present qualifications in the most compelling and professional manner.`;
      break;
    case 'Essay':
      systemPrompt = `You are an expert academic application writer with a talent for crafting memorable and impactful essays. You understand how to enhance narrative structure, improve flow, and strengthen the overall impact.`;
      break;
    case 'LOR':
      systemPrompt = `You are an expert academic application writer specializing in Letters of Recommendation. You know how to enhance credibility, strengthen endorsements, and improve the overall persuasiveness of recommendations.`;
      break;
    case 'PersonalEssay':
      systemPrompt = `You are an expert writing coach specializing in personal narratives for academic applications. You excel at helping applicants tell their stories in authentic yet compelling ways.`;
      break;
    case 'ScholarshipEssay':
      systemPrompt = `You are an expert scholarship application writer with experience creating compelling cases for funding. You understand how to effectively communicate merit, need, and potential impact.`;
      break;
    default:
      systemPrompt = `You are an expert academic application writer specializing in ${documentType}s for university applications and academic programs.`;
  }
  
  // Add tone-specific guidance for draft generation
  if (tone) {
    switch(tone) {
      case 'formal':
        systemPrompt += `\n\nTONE GUIDANCE: Ensure the improved draft maintains a formal, professional, and academic tone throughout. Use sophisticated vocabulary and proper academic structure.`;
        break;
      case 'conversational':
        systemPrompt += `\n\nTONE GUIDANCE: Create an improved draft with a natural, engaging, and conversational tone while maintaining professionalism and appropriateness.`;
        break;
      case 'confident':
        systemPrompt += `\n\nTONE GUIDANCE: Strengthen the draft with confident, assertive language that showcases achievements without hesitation or tentative phrasing.`;
        break;
      case 'humble':
        systemPrompt += `\n\nTONE GUIDANCE: Maintain a modest, respectful tone while still effectively highlighting accomplishments and potential.`;
        break;
      case 'persuasive':
        systemPrompt += `\n\nTONE GUIDANCE: Enhance the draft with compelling, convincing language that persuasively argues the applicant's case for admission or selection.`;
        break;
    }
  }
  
  // Add instructions for applying feedback
  systemPrompt += `

IMPROVEMENT STRATEGY:

1. MAINTAIN AUTHENTICITY:
   - Preserve the author's unique voice and personal experiences
   - Keep all factual information and achievements unchanged
   - Maintain the same overall structure and key message points

2. ENHANCE IMPACT:
   - Strengthen opening and closing statements for maximum impact
   - Improve transitions between paragraphs and ideas
   - Add sophistication to language while maintaining clarity
   - Increase specificity and concrete examples where appropriate

3. OPTIMIZE FOR PURPOSE:
   - Ensure alignment with the target audience and institution
   - Strengthen the connection between experiences and goals
   - Improve the logical flow of arguments and narratives
   - Enhance competitive positioning

4. APPLY FEEDBACK:
   - Address all specific improvement points mentioned in the feedback
   - Implement the suggested text improvements
   - Incorporate tone and style enhancements
   - Strengthen areas identified as weak

INSTRUCTIONS:
- Apply ALL the feedback provided while maintaining the author's authentic voice
- Make the document more compelling, specific, and impactful
- Ensure the improved version flows naturally and reads seamlessly
- Maintain the same general length and structure
- Do not add fictional details or experiences not mentioned in the original

Return ONLY the improved document text, ready for immediate use.`;

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
async function generateImprovedDraft(originalContent: string, feedbackData: any, documentType: string, openaiApiKey: string, tone?: string) {
  console.log(`Generating improved draft for ${documentType} (length: ${originalContent.length}) with tone: ${tone || 'default'}`);
  
  // Prepare the feedback in a readable format for the AI
  const feedbackForAI = `
  The original document received the following comprehensive feedback:
  
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
  
  COMPREHENSIVE FEEDBACK:
  ${feedbackForAI}
  
  Please generate an improved version of this document that addresses all the feedback points while maintaining the author's authentic voice and the document's core purpose.
  `;
  
  try {
    const systemPrompt = getImprovedDraftPrompt(documentType, tone);
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
    const { content, documentType, programId, testMode, fileName, action, originalContent, feedback, tone, style } = requestData;
    
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
        console.log(`Generating improved draft for ${documentType} with tone: ${tone || 'default'}`);
        const improvedDraft = await generateImprovedDraft(originalContent, feedback, documentType, openaiApiKey, tone);
        
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
        console.log('Content is too short, returning enhanced mock feedback');
        
        // Return enhanced mock feedback for content that is too short to analyze properly
        const mockFeedback = generateMockFeedback();
        
        return new Response(
          JSON.stringify(mockFeedback),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log request information
      console.log(`Processing comprehensive ${documentType} review ${testMode ? 'in test mode' : 'for saving to DB'}${fileName ? ` (file: ${fileName})` : ''} with tone: ${tone || 'default'}, style: ${style || 'default'}`);
      console.log(`Content length: ${content.length} characters`);
      console.log(`Content sample: ${content.substring(0, 100)}...`);

      try {
        // Get enhanced system prompt with tone and style preferences
        const systemPrompt = getSystemPrompt(documentType, fileName, tone, style);
        
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
            console.log('Parsing failed in test mode, returning enhanced mock feedback');
            return new Response(
              JSON.stringify(generateMockFeedback()),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          return createErrorResponse('Failed to parse AI response', 500);
        }

        // Return comprehensive response
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
          console.log('API call failed in test mode, returning enhanced mock feedback');
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
