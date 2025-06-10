
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeNotesRequest {
  noteId?: string;
  action: 'analyze_single' | 'analyze_all' | 'generate_insights';
  customPrompt?: string;
  insightsPrompt?: string;
  timelinePrompt?: string;
}

// Helper function to extract JSON from OpenAI response that might contain markdown
function extractJSONFromResponse(content: string): any {
  try {
    // First try to parse as regular JSON
    return JSON.parse(content);
  } catch (error) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find JSON without markdown
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(content.substring(jsonStart, jsonEnd + 1));
    }
    
    // If all else fails, throw the original error
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { noteId, action, customPrompt, insightsPrompt, timelinePrompt }: AnalyzeNotesRequest = await req.json()
    console.log('Received request:', { noteId, action })

    if (action === 'analyze_single' && noteId) {
      // Analyze a single note
      const { data: note } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single()

      if (!note) {
        console.error('Note not found:', noteId)
        return new Response(JSON.stringify({ error: 'Note not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Found note:', note.title)

      // Call OpenAI to analyze the note
      const systemPrompt = customPrompt || `You are an AI assistant specialized in analyzing university application notes. 
      Analyze the given note and provide:
      1. A concise summary (max 100 words)
      2. Categorize into relevant tags (academic, financial, application, research, personal)
      3. Extract key insights and action items
      4. Assign a priority score (1-10) based on urgency and importance
      5. Determine context type (general, academic, financial, application, research)
      
      Return ONLY a JSON object with these keys: summary, categories, insights, priority_score, context_type, action_items`

      console.log('Calling OpenAI...')
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Title: ${note.title}\nContent: ${note.content}`
            }
          ],
          temperature: 0.3,
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error('OpenAI API error:', openaiResponse.status, errorText)
        return new Response(JSON.stringify({ 
          error: 'OpenAI API error',
          details: `${openaiResponse.status}: ${errorText}`
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const openaiData = await openaiResponse.json()
      console.log('OpenAI response:', openaiData)

      // Validate OpenAI response structure
      if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
        console.error('Invalid OpenAI response structure:', openaiData)
        return new Response(JSON.stringify({ 
          error: 'Invalid OpenAI response structure',
          details: openaiData
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const messageContent = openaiData.choices[0].message.content
      if (!messageContent) {
        console.error('Empty message content from OpenAI')
        return new Response(JSON.stringify({ 
          error: 'Empty response from OpenAI'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('OpenAI message content:', messageContent)

      let analysis
      try {
        analysis = extractJSONFromResponse(messageContent)
        console.log('Parsed analysis:', analysis)
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError, 'Content:', messageContent)
        return new Response(JSON.stringify({ 
          error: 'Failed to parse AI response',
          details: parseError.message,
          rawContent: messageContent
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update the note with AI analysis
      console.log('Updating note with analysis...')
      const { error: updateError } = await supabase
        .from('ai_notes')
        .update({
          ai_summary: analysis.summary,
          ai_categories: analysis.categories || [],
          ai_insights: analysis.insights || {},
          priority_score: analysis.priority_score || 0,
          context_type: analysis.context_type || 'general',
          last_ai_analysis: new Date().toISOString()
        })
        .eq('id', noteId)

      if (updateError) {
        console.error('Database update error:', updateError)
        return new Response(JSON.stringify({ 
          error: 'Failed to update note',
          details: updateError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Note updated successfully')
      return new Response(JSON.stringify({ 
        success: true, 
        analysis,
        message: 'Note analyzed successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'analyze_all') {
      // Get all user's notes and programs for comprehensive analysis
      const { data: notes } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('user_id', user.id)

      const { data: programs } = await supabase
        .from('programs_saved')
        .select('*')
        .eq('user_id', user.id)

      if (!notes || notes.length === 0) {
        return new Response(JSON.stringify({ 
          error: 'No notes found for analysis' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Prepare data for OpenAI analysis
      const notesContent = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        program_id: note.program_id
      }))

      const programsContent = programs?.map(program => ({
        id: program.id,
        name: program.program_name,
        university: program.university,
        country: program.country,
        deadline: program.deadline
      })) || []

      // Use custom prompts if provided, otherwise use default
      const systemPrompt = insightsPrompt || `You are an AI assistant specialized in university application planning. 
      Analyze all the user's notes and programs to provide comprehensive insights.
      
      Generate:
      1. Overall summary of their application journey
      2. Key patterns and themes across notes
      3. Specific recommendations for each program
      4. Action items with priority and deadlines
      5. Potential gaps or missing information
      6. Strategic advice for strengthening applications
      
      Return ONLY a JSON object with these keys: overall_summary, patterns, program_recommendations, action_items, gaps, strategic_advice`

      // Call OpenAI for comprehensive analysis
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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
              content: `Notes: ${JSON.stringify(notesContent)}\nPrograms: ${JSON.stringify(programsContent)}`
            }
          ],
          temperature: 0.3,
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error('OpenAI API error:', openaiResponse.status, errorText)
        return new Response(JSON.stringify({ 
          error: 'OpenAI API error',
          details: `${openaiResponse.status}: ${errorText}`
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const openaiData = await openaiResponse.json()

      // Validate OpenAI response structure
      if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
        console.error('Invalid OpenAI response structure:', openaiData)
        return new Response(JSON.stringify({ 
          error: 'Invalid OpenAI response structure',
          details: openaiData
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const messageContent = openaiData.choices[0].message.content
      if (!messageContent) {
        console.error('Empty message content from OpenAI')
        return new Response(JSON.stringify({ 
          error: 'Empty response from OpenAI'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      let insights
      try {
        insights = extractJSONFromResponse(messageContent)
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError, 'Content:', messageContent)
        return new Response(JSON.stringify({ 
          error: 'Failed to parse AI response',
          details: parseError.message,
          rawContent: messageContent
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Store insights in the database
      await supabase
        .from('ai_insights')
        .insert({
          user_id: user.id,
          insight_type: 'summary',
          title: 'Comprehensive Application Analysis',
          content: JSON.stringify(insights),
          related_notes: notes.map(n => n.id),
          related_programs: programs?.map(p => p.id) || [],
          confidence_score: 0.9
        })

      // Generate smart reminders based on insights
      if (insights.action_items && Array.isArray(insights.action_items) && insights.action_items.length > 0) {
        const reminders = insights.action_items.slice(0, 5).map((item: any) => ({
          user_id: user.id,
          title: item.title || item.action || 'Action Item',
          description: item.description || '',
          reminder_type: item.type || 'task',
          due_date: item.deadline || null,
          ai_generated: true,
          priority: item.priority || 3
        }))

        await supabase
          .from('smart_reminders')
          .insert(reminders)
      }

      return new Response(JSON.stringify({ 
        success: true, 
        insights,
        message: 'Comprehensive analysis completed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in analyze-notes function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
