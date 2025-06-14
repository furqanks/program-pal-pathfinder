
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

      const analysisPrompt = customPrompt || `Analyze this note and provide insights in a clear, readable format:

Title: ${note.title}
Content: ${note.content}
Context: ${note.context_type}

Please provide your analysis as natural, well-formatted text with clear headings and bullet points. Structure your response like this:

## Summary
Brief overview of the main points and themes

## Key Insights
• First key insight or observation
• Second key insight or observation
• Third key insight or observation

## Recommended Actions
• Specific actionable step you can take
• Another concrete next step
• Third recommended action

## Connections & Patterns
Brief note about how this relates to your goals or other areas

Keep your response conversational but well-organized. Do NOT use JSON format. Write in natural, readable text that's easy to scan and understand.`;

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
              content: 'You are an expert note analyst and academic assistant. Always provide your analysis in clear, readable text format with proper headings and bullet points. Never respond with JSON or structured data - always use natural, well-formatted text that users can easily read and understand.' 
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

      // Parse analysis to extract structured insights
      const lines = analysis.split('\n').filter(line => line.trim().length > 0);
      const keyInsights = lines.filter(line => 
        line.includes('•') || line.includes('-') || line.includes('*') || 
        line.toLowerCase().includes('insight') || line.toLowerCase().includes('recommend')
      ).slice(0, 5);
      
      const nextSteps = lines.filter(line => 
        line.toLowerCase().includes('next') || line.toLowerCase().includes('action') || 
        line.toLowerCase().includes('should') || line.toLowerCase().includes('consider')
      ).slice(0, 3);

      // Update note with AI analysis
      const { error: updateError } = await supabase
        .from('ai_notes')
        .update({
          ai_summary: analysis,
          last_ai_analysis: new Date().toISOString(),
          ai_insights: {
            analyzed_at: new Date().toISOString(),
            analysis_type: 'single_note',
            key_insights: keyInsights,
            next_steps: nextSteps,
            confidence_score: 0.85
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

      const summaryPrompt = insightsPrompt || `Create a comprehensive summary of all these notes in a clear, readable format:

${notesContent}

Structure your response like this:

## Overall Summary
Brief overview of the main themes and patterns across all notes

## Key Themes & Patterns
• Major theme 1 with brief explanation
• Major theme 2 with brief explanation
• Major theme 3 with brief explanation

## Important Insights & Learning
• Key insight 1
• Key insight 2
• Key insight 3

## Priority Action Items
• Most important next step
• Second priority action
• Third priority action

## Areas Needing Attention
• Area 1 that needs focus
• Area 2 that needs focus

## Connections & Recommendations
Brief summary of how different notes connect and specific recommendations for moving forward.

Keep your response well-formatted and easy to scan. Use clear headings and bullet points throughout.`;

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

      const dailySummaryPrompt = customPrompt || `Create a summary of today's notes and activities in a clear, readable format:

${notesContent}

Structure your response like this:

## Today's Highlights
Brief overview of key activities and accomplishments

## Key Insights & Learnings
• Most important insight from today
• Second key learning
• Third valuable observation

## Tomorrow's Action Items
• Priority task 1
• Priority task 2
• Priority task 3

## Progress on Ongoing Projects
Brief update on any progress made on existing projects or goals

## Challenges & Issues
• Challenge 1 that needs attention
• Challenge 2 to address

Keep your response well-formatted, actionable, and motivating. Use clear headings and bullet points throughout.`;

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
