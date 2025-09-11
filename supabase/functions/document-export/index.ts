import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Document export function called')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Authenticated user: ${user.id}`)

    // Rate limiting
    const today = new Date().toISOString().split('T')[0]
    const endpoint = 'export-pdf'

    // Check current usage
    const { data: usage, error: usageError } = await supabase
      .from('api_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)
      .eq('day', today)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Usage check failed:', usageError)
      throw new Error('Rate limit check failed')
    }

    const currentCount = usage?.count || 0
    if (currentCount >= 20) {
      return new Response(JSON.stringify({ error: 'Daily export limit reached (20/day)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const body = await req.json()
    const { resume, template = 'classic', format = 'pdf' } = body

    if (!resume) {
      return new Response(JSON.stringify({ error: 'Resume data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate resume structure
    if (!resume.basics?.fullName || !Array.isArray(resume.experience) || !Array.isArray(resume.education)) {
      return new Response(JSON.stringify({ error: 'Invalid resume structure' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate HTML template
    const html = generateResumeHTML(resume, template)

    if (format === 'docx') {
      // For DOCX, we'll use a simplified approach since docx package isn't available in Deno
      return new Response(JSON.stringify({ error: 'DOCX export not yet implemented in this runtime' }), {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // For PDF generation, we'll use a simplified approach since Puppeteer isn't available in Deno Edge Functions
    // This would normally use Puppeteer/Chromium but we'll return the HTML for now
    console.log('Generated resume HTML for user:', user.id)

    // Increment usage counter
    await supabase
      .from('api_usage')
      .upsert({
        user_id: user.id,
        endpoint,
        day: today,
        count: currentCount + 1
      })

    // Return HTML for now (in production, this would be converted to PDF)
    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="resume-${template}.html"`
      }
    })

  } catch (error: any) {
    console.error('Document export error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Export failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateResumeHTML(resume: any, template: string): string {
  const isModern = template === 'modern'
  
  // Mask PII in logs
  const logSafeResume = {
    ...resume,
    basics: {
      ...resume.basics,
      email: resume.basics?.email ? '[EMAIL]' : undefined,
      phone: resume.basics?.phone ? '[PHONE]' : undefined
    }
  }
  console.log('Generating template for resume:', JSON.stringify(logSafeResume).substring(0, 200))

  if (isModern) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${resume.basics.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #2c3e50;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
      background: white;
    }
    .header {
      margin-bottom: 0.4in;
      padding: 0.3in;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8pt;
    }
    .name {
      font-size: 22pt;
      font-weight: 300;
      letter-spacing: 1pt;
      margin-bottom: 0.1in;
    }
    .title {
      font-size: 14pt;
      font-weight: 400;
      margin-bottom: 0.15in;
      opacity: 0.9;
    }
    .contact-info {
      font-size: 10pt;
      margin-bottom: 0.05in;
    }
    .section {
      margin-bottom: 0.35in;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 16pt;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 0.2in;
      padding-bottom: 0.08in;
      border-bottom: 2pt solid #667eea;
    }
    .experience-item, .education-item, .project-item {
      margin-bottom: 0.25in;
      padding: 0.15in;
      background: #f8f9fa;
      border-radius: 6pt;
      border-left: 3pt solid #667eea;
      page-break-inside: avoid;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.1in;
      align-items: flex-start;
    }
    .company, .institution, .project-name {
      font-weight: 600;
      font-size: 13pt;
      color: #2c3e50;
    }
    .role, .degree {
      font-size: 11pt;
      color: #667eea;
      font-weight: 500;
      margin-top: 0.02in;
    }
    .date {
      font-size: 10pt;
      color: #7f8c8d;
      font-weight: 500;
      background: white;
      padding: 0.05in 0.1in;
      border-radius: 12pt;
      white-space: nowrap;
    }
    ul {
      margin: 0.1in 0 0 0.2in;
      padding-left: 0;
    }
    li {
      margin-bottom: 0.08in;
      list-style: none;
      position: relative;
      padding-left: 0.15in;
    }
    li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
    }
    .summary {
      text-align: justify;
      margin-bottom: 0.2in;
      line-height: 1.6;
      padding: 0.2in;
      background: #f8f9fa;
      border-radius: 6pt;
      border-left: 3pt solid #667eea;
      font-style: italic;
    }
    @media print {
      body { padding: 0.5in; }
      .section { page-break-inside: avoid; }
      .header {
        background: #667eea !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.basics.fullName}</div>
    ${resume.basics.title ? `<div class="title">${resume.basics.title}</div>` : ''}
    <div class="contact-info">
      ${[resume.basics.email, resume.basics.phone, resume.basics.location].filter(Boolean).join(' • ')}
      ${resume.basics.links ? resume.basics.links.map((link: any) => `${link.label}: ${link.url}`).join(' • ') : ''}
    </div>
  </div>

  ${resume.summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary">${resume.summary}</div>
    </div>
  ` : ''}

  ${resume.experience && resume.experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${resume.experience.map((exp: any) => `
        <div class="experience-item">
          <div class="item-header">
            <div>
              <div class="company">${exp.company}</div>
              <div class="role">${exp.role}</div>
            </div>
            <div class="date">${exp.start} - ${exp.end || 'Present'}</div>
          </div>
          ${exp.bullets && exp.bullets.length > 0 ? `
            <ul>
              ${exp.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.education && resume.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${resume.education.map((edu: any) => `
        <div class="education-item">
          <div class="item-header">
            <div>
              <div class="institution">${edu.institution}</div>
              <div class="degree">${edu.degree}</div>
            </div>
            <div class="date">${edu.start} - ${edu.end}</div>
          </div>
          ${edu.details && edu.details.length > 0 ? `
            <ul>
              ${edu.details.map((detail: string) => `<li>${detail}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.projects && resume.projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Notable Projects</div>
      ${resume.projects.map((project: any) => `
        <div class="project-item">
          <div class="project-name">
            ${project.name}
            ${project.link ? `<span style="font-weight: normal; font-size: 10pt; margin-left: 0.1in; color: #667eea;">— ${project.link}</span>` : ''}
          </div>
          ${project.description ? `<div style="font-style: italic; margin-bottom: 0.08in; color: #6c757d;">${project.description}</div>` : ''}
          ${project.bullets && project.bullets.length > 0 ? `
            <ul>
              ${project.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.skills && resume.skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Core Competencies</div>
      ${resume.skills.map((skillCategory: any) => `
        <div style="margin-bottom: 0.15in; background: #f8f9fa; padding: 0.15in; border-radius: 6pt; border: 1pt solid #e9ecef;">
          <span style="font-weight: 600; color: #667eea; font-size: 11pt; display: block; margin-bottom: 0.08in;">${skillCategory.category}</span>
          <div style="font-size: 10pt; line-height: 1.4; color: #495057;">${skillCategory.items.join(' • ')}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.awards && resume.awards.length > 0 ? `
    <div class="section">
      <div class="section-title">Awards & Recognition</div>
      ${resume.awards.map((award: any) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.1in 0.15in; background: #f8f9fa; margin-bottom: 0.1in; border-radius: 6pt; border-left: 3pt solid #28a745;">
          <div>
            <div style="font-weight: 600; color: #2c3e50;">${award.name}</div>
            ${award.by ? `<div style="font-size: 10pt; color: #6c757d;">by ${award.by}</div>` : ''}
          </div>
          ${award.year ? `<div style="font-size: 10pt; color: #6c757d;">${award.year}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>`
  }

  // Classic template
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${resume.basics.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 0.5in;
      border-bottom: 1pt solid #333;
      padding-bottom: 0.25in;
    }
    .name {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.1in;
    }
    .title {
      font-size: 12pt;
      font-style: italic;
      margin-bottom: 0.1in;
    }
    .contact-info {
      font-size: 10pt;
      margin-bottom: 0.05in;
    }
    .section {
      margin-bottom: 0.3in;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1pt solid #333;
      margin-bottom: 0.15in;
      padding-bottom: 0.05in;
    }
    .experience-item, .education-item, .project-item {
      margin-bottom: 0.2in;
      page-break-inside: avoid;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.05in;
    }
    .company, .institution, .project-name {
      font-weight: bold;
      font-size: 12pt;
    }
    .role, .degree {
      font-style: italic;
      font-size: 11pt;
    }
    .date {
      font-size: 10pt;
      color: #666;
    }
    ul {
      margin: 0.1in 0 0 0.2in;
      padding-left: 0;
    }
    li {
      margin-bottom: 0.05in;
      list-style-type: disc;
    }
    .summary {
      text-align: justify;
      margin-bottom: 0.2in;
      line-height: 1.3;
    }
    @media print {
      body { padding: 0.5in; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.basics.fullName}</div>
    ${resume.basics.title ? `<div class="title">${resume.basics.title}</div>` : ''}
    <div class="contact-info">
      ${[resume.basics.email, resume.basics.phone, resume.basics.location].filter(Boolean).join(' • ')}
      ${resume.basics.links ? resume.basics.links.map((link: any) => `${link.label}: ${link.url}`).join(' • ') : ''}
    </div>
  </div>

  ${resume.summary ? `
    <div class="section">
      <div class="section-title">Summary</div>
      <div class="summary">${resume.summary}</div>
    </div>
  ` : ''}

  ${resume.experience && resume.experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${resume.experience.map((exp: any) => `
        <div class="experience-item">
          <div class="item-header">
            <div>
              <div class="company">${exp.company}</div>
              <div class="role">${exp.role}</div>
            </div>
            <div class="date">${exp.start} - ${exp.end || 'Present'}</div>
          </div>
          ${exp.bullets && exp.bullets.length > 0 ? `
            <ul>
              ${exp.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.education && resume.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${resume.education.map((edu: any) => `
        <div class="education-item">
          <div class="item-header">
            <div>
              <div class="institution">${edu.institution}</div>
              <div class="degree">${edu.degree}</div>
            </div>
            <div class="date">${edu.start} - ${edu.end}</div>
          </div>
          ${edu.details && edu.details.length > 0 ? `
            <ul>
              ${edu.details.map((detail: string) => `<li>${detail}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.projects && resume.projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${resume.projects.map((project: any) => `
        <div class="project-item">
          <div class="project-name">
            ${project.name}
            ${project.link ? `<span style="font-weight: normal; font-size: 10pt; margin-left: 0.1in;">(${project.link})</span>` : ''}
          </div>
          ${project.description ? `<div style="font-style: italic; margin-bottom: 0.05in;">${project.description}</div>` : ''}
          ${project.bullets && project.bullets.length > 0 ? `
            <ul>
              ${project.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.skills && resume.skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${resume.skills.map((skillCategory: any) => `
        <div style="margin-bottom: 0.1in;">
          <span style="font-weight: bold;">${skillCategory.category}:</span>
          <span style="margin-left: 0.1in;">${skillCategory.items.join(', ')}</span>
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.awards && resume.awards.length > 0 ? `
    <div class="section">
      <div class="section-title">Awards & Achievements</div>
      ${resume.awards.map((award: any) => `
        <div style="margin-bottom: 0.1in;">
          <span style="font-weight: bold;">${award.name}</span>
          ${award.by ? ` - ${award.by}` : ''}
          ${award.year ? ` (${award.year})` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>`
}