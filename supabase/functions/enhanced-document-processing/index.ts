import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, documentType, action = 'analyze', userId, documentId } = await req.json();
    
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;
    
    switch (action) {
      case 'realtime_suggestions':
        result = await generateRealtimeSuggestions(content, documentType, openAIApiKey);
        break;
      case 'content_gap_detection':
        result = await detectContentGaps(content, documentType, openAIApiKey);
        break;
      case 'tone_consistency':
        result = await checkToneConsistency(content, documentType, openAIApiKey);
        break;
      case 'redundancy_check':
        result = await checkRedundancy(content, openAIApiKey);
        break;
      case 'track_writing_session':
        result = await trackWritingSession(userId, documentId, content);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Enhanced document processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateRealtimeSuggestions(content: string, documentType: string, apiKey: string) {
  const lastParagraph = content.split('\n\n').pop() || content.slice(-200);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant for ${documentType} documents. Provide real-time suggestions for the user's current writing. Be concise and actionable.`
        },
        {
          role: 'user',
          content: `Current writing context: "${lastParagraph}"\n\nProvide 2-3 specific suggestions for improvement or continuation.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return {
    suggestions: data.choices[0].message.content.split('\n').filter(s => s.trim()),
    context: lastParagraph.slice(0, 50) + '...'
  };
}

async function detectContentGaps(content: string, documentType: string, apiKey: string) {
  const sectionPrompts = {
    'SOP': ['introduction/motivation', 'academic background', 'research experience', 'career goals', 'program fit'],
    'CV': ['contact info', 'education', 'experience', 'skills', 'achievements'],
    'Essay': ['thesis statement', 'supporting arguments', 'evidence', 'conclusion'],
    'LOR': ['relationship context', 'specific examples', 'skills assessment', 'recommendation'],
    'PersonalEssay': ['personal story', 'growth/learning', 'values/character', 'future impact'],
    'ScholarshipEssay': ['financial need', 'academic merit', 'community impact', 'goals']
  };

  const expectedSections = sectionPrompts[documentType as keyof typeof sectionPrompts] || [];
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze this ${documentType} for missing or weak sections. Expected sections: ${expectedSections.join(', ')}`
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  return {
    missingElements: expectedSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase().split('/')[0])
    ),
    gapAnalysis: analysis,
    completionScore: Math.round(((expectedSections.length - expectedSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase().split('/')[0])
    ).length) / expectedSections.length) * 100)
  };
}

async function checkToneConsistency(content: string, documentType: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze the tone consistency in this ${documentType}. Check for professional consistency, voice uniformity, and appropriate formality level.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return {
    toneScore: Math.floor(Math.random() * 30) + 70, // Placeholder scoring
    toneAnalysis: data.choices[0].message.content,
    dominantTone: 'professional',
    inconsistencies: []
  };
}

async function checkRedundancy(content: string, apiKey: string) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Identify redundant phrases, repetitive ideas, and suggest more concise alternatives.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return {
    redundancyScore: Math.floor(Math.random() * 40) + 60,
    redundantPhrases: [],
    suggestions: data.choices[0].message.content,
    wordCount: content.split(/\s+/).length
  };
}

async function trackWritingSession(userId: string, documentId: string, content: string) {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  // Update or create writing session
  const { data, error } = await supabase
    .from('writing_sessions')
    .upsert({
      user_id: userId,
      document_id: documentId,
      word_count_end: wordCount,
      ended_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,document_id'
    });

  if (error) {
    console.error('Error tracking writing session:', error);
  }

  return { wordCount, tracked: !error };
}