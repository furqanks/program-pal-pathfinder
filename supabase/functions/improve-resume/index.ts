import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Resume {
  basics: {
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    links?: { label: string; url: string }[];
    location?: string;
  };
  summary?: string;
  experience: { company: string; role: string; start: string; end?: string; bullets: string[] }[];
  education: { institution: string; degree: string; start: string; end: string; details?: string[] }[];
  projects?: { name: string; description?: string; bullets?: string[]; link?: string }[];
  skills?: { category: string; items: string[] }[];
  awards?: { name: string; by?: string; year?: string }[];
}

const RESUME_SCHEMA_DESCRIPTION = `
Resume TypeScript interface:
interface Resume {
  basics: {
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    links?: { label: string; url: string }[];
    location?: string;
  };
  summary?: string;
  experience: { company: string; role: string; start: string; end?: string; bullets: string[] }[];
  education: { institution: string; degree: string; start: string; end: string; details?: string[] }[];
  projects?: { name: string; description?: string; bullets?: string[]; link?: string }[];
  skills?: { category: string; items: string[] }[];
  awards?: { name: string; by?: string; year?: string }[];
}
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Rate limiting check
    const today = new Date().toISOString().split('T')[0]
    
    const { data: usage } = await supabaseClient
      .from('api_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('endpoint', 'improve')
      .eq('day', today)
      .single()

    const currentCount = usage?.count || 0
    if (currentCount >= 50) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 50 improvements per day.' }), {
        status: 429,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Update usage count
    await supabaseClient
      .from('api_usage')
      .upsert({
        user_id: user.id,
        endpoint: 'improve',
        day: today,
        count: currentCount + 1
      })

    // Parse request body
    const { resume } = await req.json()
    if (!resume) {
      return new Response(JSON.stringify({ error: 'Resume data required' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Mask PII in logs
    const sanitizedResume = {
      ...resume,
      basics: {
        ...resume.basics,
        email: resume.basics.email ? '[EMAIL_MASKED]' : undefined,
        phone: resume.basics.phone ? '[PHONE_MASKED]' : undefined,
      }
    }
    console.log('Processing resume improvement for user:', user.id, 'Resume preview:', JSON.stringify(sanitizedResume).substring(0, 200))

    // Create system and user messages
    const systemPrompt = `You are a professional CV editor. Improve clarity, action verbs, and measurable impact. Preserve facts/dates. Do NOT invent content. Return ONLY valid JSON that matches the provided Zod schema. No markdown, no code fences, no explanatory text - ONLY the JSON object.`
    
    const userPrompt = `${RESUME_SCHEMA_DESCRIPTION}

Current resume JSON to improve:
${JSON.stringify(resume)}

Please improve this resume by:
1. Using stronger action verbs
2. Making bullets more concise and impactful
3. Ensuring consistent formatting
4. Preserving all factual information (dates, names, etc.)
5. Adding quantifiable achievements where appropriate based on existing context
6. Return ONLY the improved JSON object, nothing else`

    let improvedResume: Resume | null = null
    let attempts = 0
    const maxAttempts = 2

    while (!improvedResume && attempts < maxAttempts) {
      attempts++
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_completion_tokens: 2000,
          response_format: { type: "json_object" }
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenAI API error:', response.status, errorData)
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedContent = data.choices[0].message.content

      try {
        // Parse the JSON response
        const parsedResume = JSON.parse(generatedContent)
        
        // Basic validation to ensure it matches Resume structure
        if (parsedResume.basics && parsedResume.basics.fullName && 
            Array.isArray(parsedResume.experience) && 
            Array.isArray(parsedResume.education)) {
          
          // Ensure all required fields are strings and arrays are properly formed
          const validatedResume: Resume = {
            basics: {
              fullName: String(parsedResume.basics.fullName || resume.basics.fullName),
              title: parsedResume.basics.title ? String(parsedResume.basics.title) : resume.basics.title,
              email: parsedResume.basics.email ? String(parsedResume.basics.email) : resume.basics.email,
              phone: parsedResume.basics.phone ? String(parsedResume.basics.phone) : resume.basics.phone,
              links: parsedResume.basics.links || resume.basics.links,
              location: parsedResume.basics.location ? String(parsedResume.basics.location) : resume.basics.location
            },
            summary: parsedResume.summary ? String(parsedResume.summary) : resume.summary,
            experience: Array.isArray(parsedResume.experience) ? parsedResume.experience.map((exp: any) => ({
              company: String(exp.company || ''),
              role: String(exp.role || ''),
              start: String(exp.start || ''),
              end: exp.end ? String(exp.end) : undefined,
              bullets: Array.isArray(exp.bullets) ? exp.bullets.map(String) : []
            })) : resume.experience,
            education: Array.isArray(parsedResume.education) ? parsedResume.education.map((edu: any) => ({
              institution: String(edu.institution || ''),
              degree: String(edu.degree || ''),
              start: String(edu.start || ''),
              end: String(edu.end || ''),
              details: Array.isArray(edu.details) ? edu.details.map(String) : undefined
            })) : resume.education,
            projects: parsedResume.projects ? parsedResume.projects.map((proj: any) => ({
              name: String(proj.name || ''),
              description: proj.description ? String(proj.description) : undefined,
              bullets: Array.isArray(proj.bullets) ? proj.bullets.map(String) : undefined,
              link: proj.link ? String(proj.link) : undefined
            })) : resume.projects,
            skills: parsedResume.skills ? parsedResume.skills.map((skill: any) => ({
              category: String(skill.category || ''),
              items: Array.isArray(skill.items) ? skill.items.map(String) : []
            })) : resume.skills,
            awards: parsedResume.awards ? parsedResume.awards.map((award: any) => ({
              name: String(award.name || ''),
              by: award.by ? String(award.by) : undefined,
              year: award.year ? String(award.year) : undefined
            })) : resume.awards
          }

          improvedResume = validatedResume
        } else {
          console.warn(`Attempt ${attempts}: Invalid resume structure from AI`)
          if (attempts === maxAttempts) {
            throw new Error('AI failed to generate valid resume structure')
          }
        }
      } catch (parseError) {
        console.warn(`Attempt ${attempts}: Failed to parse AI response:`, parseError)
        if (attempts === maxAttempts) {
          throw new Error('AI response was not valid JSON')
        }
      }
    }

    if (!improvedResume) {
      throw new Error('Failed to generate improved resume after multiple attempts')
    }

    console.log('Successfully improved resume for user:', user.id)

    return new Response(JSON.stringify({ resume: improvedResume }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })

  } catch (error) {
    console.error('Resume improvement error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})