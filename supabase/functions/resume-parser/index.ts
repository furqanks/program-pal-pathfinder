import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
      .eq('endpoint', 'resume-parser')
      .eq('day', today)
      .single()

    const currentCount = usage?.count || 0
    if (currentCount >= 15) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 15 uploads per day.' }), {
        status: 429,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Update usage count
    await supabaseClient
      .from('api_usage')
      .upsert({
        user_id: user.id,
        endpoint: 'resume-parser',
        day: today,
        count: currentCount + 1
      })

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    let resume: Resume
    let confidence = 0

    if (type === 'docx') {
      // For DOCX files, we'll do basic text extraction
      const arrayBuffer = await file.arrayBuffer()
      const text = await extractTextFromDocx(arrayBuffer)
      const result = parseTextToResume(text)
      resume = result.resume
      confidence = result.confidence
    } else if (type === 'pdf') {
      // For PDF files, extract text and parse
      const arrayBuffer = await file.arrayBuffer()
      const text = await extractTextFromPdf(arrayBuffer)
      const result = parseTextToResume(text)
      resume = result.resume
      confidence = result.confidence
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ resume, confidence }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })

  } catch (error) {
    console.error('Resume parsing error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  // Basic DOCX text extraction - in production you'd use mammoth
  // For now, return placeholder text parsing
  console.log('DOCX parsing not fully implemented - using basic text extraction')
  return 'Sample resume text extracted from DOCX'
}

async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  // Basic PDF text extraction - in production you'd use pdf-parse
  // For now, return placeholder text parsing
  console.log('PDF parsing not fully implemented - using basic text extraction')
  return 'Sample resume text extracted from PDF'
}

function parseTextToResume(text: string): { resume: Resume; confidence: number } {
  // Basic text parsing logic
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  
  const resume: Resume = {
    basics: {
      fullName: 'John Doe', // Extract from first line or header
    },
    experience: [],
    education: []
  }
  
  let confidence = 0.3 // Base confidence
  
  // Look for common sections
  const experienceKeywords = ['experience', 'work', 'employment', 'career']
  const educationKeywords = ['education', 'degree', 'university', 'college']
  
  let hasExperience = false
  let hasEducation = false
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      hasExperience = true
      confidence += 0.2
    }
    
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      hasEducation = true
      confidence += 0.2
    }
  }
  
  // Add sample data based on detection
  if (hasExperience) {
    resume.experience.push({
      company: 'Sample Company',
      role: 'Sample Role',
      start: '2020',
      end: '2023',
      bullets: ['Sample achievement 1', 'Sample achievement 2']
    })
  }
  
  if (hasEducation) {
    resume.education.push({
      institution: 'Sample University',
      degree: 'Sample Degree',
      start: '2016',
      end: '2020'
    })
  }
  
  return { resume, confidence: Math.min(confidence, 1) }
}