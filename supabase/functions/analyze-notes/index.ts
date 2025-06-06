
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeNotesRequest {
  noteId?: string;
  action: 'analyze_single' | 'analyze_all' | 'generate_insights';
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { noteId, action }: AnalyzeNotesRequest = await req.json()

    if (action === 'analyze_single' && noteId) {
      // Analyze a single note
      const { data: note } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single()

      if (!note) {
        return new Response(JSON.stringify({ error: 'Note not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Call OpenAI to analyze the note
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
              content: `You are an AI assistant specialized in analyzing university application notes. 
              Analyze the given note and provide:
              1. A concise summary (max 100 words)
              2. Categorize into relevant tags (academic, financial, application, research, personal)
              3. Extract key insights and action items
              4. Assign a priority score (1-10) based on urgency and importance
              5. Determine context type (general, academic, financial, application, research)
              
              Return as JSON with keys: summary, categories, insights, priority_score, context_type, action_items`
            },
            {
              role: 'user',
              content: `Title: ${note.title}\nContent: ${note.content}`
            }
          ],
          temperature: 0.3,
        }),
      })

      const openaiData = await openaiResponse.json()
      const analysis = JSON.parse(openaiData.choices[0].message.content)

      // Update the note with AI analysis
      await supabase
        .from('ai_notes')
        .update({
          ai_summary: analysis.summary,
          ai_categories: analysis.categories,
          ai_insights: analysis.insights,
          priority_score: analysis.priority_score,
          context_type: analysis.context_type,
          last_ai_analysis: new Date().toISOString()
        })
        .eq('id', noteId)

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
              content: `You are an AI assistant specialized in university application planning. 
              Analyze all the user's notes and programs to provide comprehensive insights.
              
              Generate:
              1. Overall summary of their application journey
              2. Key patterns and themes across notes
              3. Specific recommendations for each program
              4. Action items with priority and deadlines
              5. Potential gaps or missing information
              6. Strategic advice for strengthening applications
              
              Return as JSON with keys: overall_summary, patterns, program_recommendations, action_items, gaps, strategic_advice`
            },
            {
              role: 'user',
              content: `Notes: ${JSON.stringify(notesContent)}\nPrograms: ${JSON.stringify(programsContent)}`
            }
          ],
          temperature: 0.3,
        }),
      })

      const openaiData = await openaiResponse.json()
      const insights = JSON.parse(openaiData.choices[0].message.content)

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
      if (insights.action_items && insights.action_items.length > 0) {
        const reminders = insights.action_items.slice(0, 5).map((item: any) => ({
          user_id: user.id,
          title: item.title || item.action,
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
