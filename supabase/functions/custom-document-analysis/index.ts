import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, documentType, customPrompt, generateDraft = false } = await req.json();

    if (!content || !documentType || !customPrompt) {
      throw new Error('Content, document type, and custom prompt are required');
    }

    console.log('Processing custom document analysis:', { documentType, customPrompt: customPrompt.substring(0, 100), generateDraft });

    // Create appropriate system prompt based on document type
    const documentContext = {
      'SOP': 'Statement of Purpose for university admissions',
      'CV': 'CV/Resume for professional applications',
      'ScholarshipEssay': 'Scholarship essay application',
      'LOR': 'Letter of Recommendation'
    };

    const systemPrompt = `You are an expert writing assistant specializing in ${documentContext[documentType] || 'academic and professional documents'}. 

Your task is to ${generateDraft ? 'create an improved version of the document based on' : 'analyze the document and provide feedback based on'} the user's specific request.

${generateDraft 
  ? 'IMPORTANT: Return ONLY the improved document text. Do not include any explanations, analysis, or additional text - just the revised document content that incorporates the user\'s requested improvements.'
  : 'Provide structured feedback with clear sections: Strengths, Areas for Improvement, and Specific Suggestions with line references where applicable.'
}`;

    const userPrompt = generateDraft 
      ? `User's request: "${customPrompt}"\n\nOriginal document:\n${content}\n\nPlease provide the improved version of this document incorporating the user's request.`
      : `User's request: "${customPrompt}"\n\nDocument to analyze:\n${content}\n\nPlease provide detailed feedback based on the user's specific request.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Custom analysis completed successfully');

    if (generateDraft) {
      return new Response(JSON.stringify({ 
        improvedDraft: aiResponse.trim()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        analysis: aiResponse,
        prompt: customPrompt
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in custom-document-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during analysis',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});