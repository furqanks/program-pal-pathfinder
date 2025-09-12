import { NextApiRequest, NextApiResponse } from 'next';
import { ResumeZ, Resume } from '../src/types/resume.zod';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function setCorsHeaders(res: NextApiResponse, origin: string) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

async function improveResumeWithAI(resume: Resume): Promise<Resume> {
  const systemPrompt = "You are a professional CV editor. Improve clarity, action verbs, and measurable impact. Do not invent facts; preserve dates. Return ONLY valid JSON that matches the provided Zod schema. No markdown, no code fences.";
  
  const userPrompt = `Improve this resume JSON. Keep all dates and facts accurate. Make bullet points more impactful with strong action verbs and quantifiable achievements where possible:\n\n${JSON.stringify(resume, null, 2)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const improvedJson = JSON.parse(data.choices[0].message.content);
  
  // Validate with Zod
  const validationResult = ResumeZ.safeParse(improvedJson);
  
  if (!validationResult.success) {
    console.error('First validation failed, retrying with stricter prompt');
    
    // Retry with stricter instructions
    const stricterPrompt = `${systemPrompt}\n\nIMPORTANT: The JSON MUST exactly match this TypeScript interface:\n\ninterface Resume {\n  basics: { fullName: string; title?: string; email?: string; phone?: string; links?: { label: string; url: string }[]; location?: string };\n  summary?: string;\n  experience: { company: string; role: string; start: string; end?: string; bullets: string[] }[];\n  education: { institution: string; degree: string; start: string; end: string; details?: string[] }[];\n  projects?: { name: string; description?: string; bullets?: string[]; link?: string }[];\n  skills?: { category: string; items: string[] }[];\n  awards?: { name: string; by?: string; year?: string }[];\n}\n\nImprove this resume:\n${JSON.stringify(resume, null, 2)}`;

    const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'user', content: stricterPrompt }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 2000,
      }),
    });

    const retryData = await retryResponse.json();
    const retryJson = JSON.parse(retryData.choices[0].message.content);
    
    const retryValidation = ResumeZ.safeParse(retryJson);
    if (!retryValidation.success) {
      throw new Error('AI response failed validation twice');
    }
    
    return retryValidation.data;
  }
  
  return validationResult.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '';
  
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCorsHeaders(res, origin);

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { resume } = req.body;
    
    if (!resume) {
      return res.status(400).json({ error: 'Resume data required' });
    }

    // Validate input
    const inputValidation = ResumeZ.safeParse(resume);
    if (!inputValidation.success) {
      return res.status(400).json({ error: 'Invalid resume format' });
    }

    const improvedResume = await improveResumeWithAI(inputValidation.data);
    
    res.json({ resume: improvedResume });
  } catch (error) {
    console.error('Error improving resume:', error);
    res.status(500).json({ error: 'Failed to improve resume' });
  }
}