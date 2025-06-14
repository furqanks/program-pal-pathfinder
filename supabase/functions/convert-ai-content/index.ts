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
    console.log('Starting AI content conversion...');

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

    // Get all notes with AI content for this user
    const { data: notes, error: notesError } = await supabase
      .from('ai_notes')
      .select('id, title, content, ai_summary, ai_insights')
      .eq('user_id', user.id)
      .or('ai_summary.not.is.null,ai_insights.not.is.null');

    if (notesError) {
      console.error('Error fetching notes:', notesError);
      throw new Error('Failed to fetch notes');
    }

    if (!notes || notes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No notes with AI content found',
          processedCount: 0
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${notes.length} notes with AI content to process`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each note
    for (const note of notes) {
      try {
        let needsUpdate = false;
        let newAiSummary = note.ai_summary;
        let newAiInsights = note.ai_insights;

        // Check if ai_summary looks like JSON and convert it
        if (note.ai_summary) {
          const summaryTrimmed = note.ai_summary.trim();
          const looksLikeJson = (summaryTrimmed.startsWith('{') && summaryTrimmed.endsWith('}')) ||
                               (summaryTrimmed.startsWith('[') && summaryTrimmed.endsWith(']'));
          
          if (looksLikeJson) {
            console.log(`Converting JSON summary for note: ${note.title}`);
            
            const conversionPrompt = `Convert this JSON-formatted AI analysis into clear, readable text format:

Title: ${note.title}
Content: ${note.content}
JSON Analysis: ${note.ai_summary}

Please rewrite this as natural, well-formatted text with:
- A brief summary of key points
- Main insights and observations  
- Recommended next steps or actions
- Any important connections or patterns

Format your response as readable text with clear headings and bullet points where appropriate. Do not use JSON format.`;

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
                    content: 'You are an expert note analyst. Convert JSON-formatted analysis into clear, readable text that users can easily understand. Always respond with natural language, never JSON.' 
                  },
                  { role: 'user', content: conversionPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
              }),
            });

            if (response.ok) {
              const data = await response.json();
              newAiSummary = data.choices[0].message.content;
              needsUpdate = true;
              console.log(`Successfully converted summary for note: ${note.title}`);
            } else {
              console.error(`Failed to convert summary for note ${note.title}:`, response.status);
              errorCount++;
              continue;
            }
          }
        }

        // Extract and enhance ai_insights if they exist
        if (note.ai_insights && Object.keys(note.ai_insights).length > 0) {
          // Parse insights to extract readable content
          const insights = note.ai_insights;
          const lines = newAiSummary ? newAiSummary.split('\n').filter((line: string) => line.trim().length > 0) : [];
          
          const keyInsights = lines.filter((line: string) => 
            line.includes('•') || line.includes('-') || line.includes('*') || 
            line.toLowerCase().includes('insight') || line.toLowerCase().includes('recommend')
          ).slice(0, 5);
          
          const nextSteps = lines.filter((line: string) => 
            line.toLowerCase().includes('next') || line.toLowerCase().includes('action') || 
            line.toLowerCase().includes('should') || line.toLowerCase().includes('consider')
          ).slice(0, 3);

          newAiInsights = {
            ...insights,
            analyzed_at: new Date().toISOString(),
            analysis_type: 'converted_from_json',
            key_insights: keyInsights,
            next_steps: nextSteps,
            confidence_score: 0.8
          };
          needsUpdate = true;
        }

        // Update the note if changes were made
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('ai_notes')
            .update({
              ai_summary: newAiSummary,
              ai_insights: newAiInsights,
              last_ai_analysis: new Date().toISOString()
            })
            .eq('id', note.id);

          if (updateError) {
            console.error(`Error updating note ${note.title}:`, updateError);
            errorCount++;
          } else {
            processedCount++;
            console.log(`Successfully updated note: ${note.title}`);
          }
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing note ${note.title}:`, error);
        errorCount++;
      }
    }

    console.log(`Conversion complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully converted ${processedCount} notes. ${errorCount} errors occurred.`,
        processedCount,
        errorCount,
        totalNotes: notes.length
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in convert-ai-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to convert AI content. Please try again.',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});