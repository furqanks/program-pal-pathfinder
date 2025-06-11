
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
    const body = await req.json();
    const { noteId, action, customPrompt, insightsPrompt, notes } = body;
    
    console.log('Received request:', { noteId, action, hasCustomPrompt: !!customPrompt, hasInsightsPrompt: !!insightsPrompt, notesCount: notes?.length });

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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (action === 'analyze_single' && noteId) {
      // Handle single note analysis
      const { data: note, error: noteError } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (noteError || !note) {
        console.error('Note not found:', noteError);
        return new Response(
          JSON.stringify({ error: 'Note not found' }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const analysisPrompt = customPrompt || `Analyze this note and provide insights, key points, and suggestions for improvement or next steps:

Title: ${note.title}
Content: ${note.content}
Context: ${note.context_type}

Provide your analysis in a clear, structured format with actionable insights.`;

      console.log('Calling OpenAI for single note analysis...');

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
              content: 'You are an expert note analyst and academic assistant. Provide clear, actionable insights about notes.' 
            },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      // Update note with AI analysis
      const { error: updateError } = await supabase
        .from('ai_notes')
        .update({
          ai_summary: analysis,
          last_ai_analysis: new Date().toISOString(),
          ai_insights: {
            analyzed_at: new Date().toISOString(),
            analysis_type: 'single_note',
            key_insights: analysis.split('\n').filter(line => line.trim().length > 0).slice(0, 3)
          }
        })
        .eq('id', noteId);

      if (updateError) {
        console.error('Error updating note:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis,
          message: 'Note analyzed successfully'
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'summarize_all') {
      // Handle summarizing all notes
      const { data: allNotes, error: notesError } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        throw new Error('Failed to fetch notes');
      }

      if (!allNotes || allNotes.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No notes found to summarize' 
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const notesContent = allNotes.map(note => 
        `Title: ${note.title}\nContent: ${note.content}\nContext: ${note.context_type}\nCreated: ${note.created_at}`
      ).join('\n\n---\n\n');

      const summaryPrompt = insightsPrompt || `Create a comprehensive summary of all these notes. Focus on:
1. Key themes and patterns
2. Important insights and learnings
3. Action items and next steps
4. Connections between different notes
5. Areas that need attention

Notes:
${notesContent}

Provide a well-structured summary that helps the user understand their overall note collection and identify priorities.`;

      console.log('Calling OpenAI for notes summary...');

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
              content: 'You are an expert note analyst and academic assistant specializing in creating comprehensive summaries and insights from collections of notes. Always respond with clear, well-formatted text that can be directly used as note content.' 
            },
            { role: 'user', content: summaryPrompt }
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
      const summary = data.choices[0].message.content;

      console.log('Notes summary completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          summary,
          message: 'Notes summary created successfully!'
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'daily_summary') {
      // Handle daily summary
      const providedNotes = notes || [];
      
      if (providedNotes.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No notes from today to summarize' 
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const notesContent = providedNotes.map((note: any) => 
        `Title: ${note.title}\nContent: ${note.content}\nContext: ${note.context_type}\nCreated: ${note.created_at}`
      ).join('\n\n---\n\n');

      const dailySummaryPrompt = customPrompt || `Create a summary of today's notes and activities. Focus on:
1. Key activities and accomplishments from today
2. Important insights and learnings
3. Action items for tomorrow
4. Progress made on ongoing projects
5. Any challenges or issues that need attention

Today's notes:
${notesContent}

Provide a clear, actionable summary of today's activities and next steps.`;

      console.log('Calling OpenAI for daily summary...');

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
              content: 'You are an expert productivity assistant specializing in daily summaries and planning. Always respond with clear, well-formatted text that can be directly used as note content. Help users understand their daily progress and plan next steps.' 
            },
            { role: 'user', content: dailySummaryPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices[0].message.content;

      console.log('Daily summary completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          summary,
          message: "Today's summary created successfully!"
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action or missing parameters' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in analyze-notes function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request. Please try again.',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
