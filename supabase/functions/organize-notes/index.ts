
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const { notes } = await req.json();
    
    console.log('Organizing notes:', notes.length, 'notes received');

    if (!notes || notes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No notes provided for organization' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the organization prompt
    const notesContent = notes.map((note: any) => 
      `Title: ${note.title}\nContent: ${note.content}\nContext: ${note.context_type || 'general'}\nCreated: ${note.created_at}`
    ).join('\n\n---\n\n');

    const organizationPrompt = `You are an expert note organizer and academic assistant. Please analyze and organize the following notes from today.

Your task:
1. Group related notes together by theme/topic
2. Add helpful context and clarity to each note
3. Suggest connections between notes
4. Identify action items or follow-ups needed
5. Provide an organized summary with clear categorization

Notes to organize:
${notesContent}

Please provide a well-structured organization with:
- Clear categories/themes
- Enhanced context for each note
- Suggested next steps
- Important connections between notes
- Priority items that need attention

Format your response as a clear, actionable summary that helps the user understand their notes better and take appropriate action.`;

    console.log('Calling OpenAI API for note organization...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert note organizer and academic assistant specializing in helping students and researchers organize their thoughts and academic work effectively.' 
          },
          { role: 'user', content: organizationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const organizationResult = data.choices[0].message.content;

    console.log('Organization completed successfully');

    // Create an insight record for the organization
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from the authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Store the organization as an insight
        await supabase.from('ai_insights').insert({
          user_id: user.id,
          insight_type: 'organization',
          title: `Today's Notes Organization - ${new Date().toLocaleDateString()}`,
          content: organizationResult,
          related_notes: notes.map((note: any) => note.id),
          confidence_score: 0.9,
          is_active: true
        });

        console.log('Organization insight saved to database');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        organization: organizationResult,
        message: 'Notes organized successfully! Check your insights for the detailed organization.'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in organize-notes function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to organize notes. Please try again.',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
