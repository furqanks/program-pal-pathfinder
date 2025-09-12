import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ResumeZ, Resume } from '../src/types/resume.zod';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

function setCorsHeaders(res: NextApiResponse, origin: string) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

function generateClassicTemplate(resume: Resume): string {
  return `
<!DOCTYPE html>
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
    
    .experience-item,
    .education-item,
    .project-item {
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
    
    .skills-category {
      margin-bottom: 0.1in;
    }
    
    .skills-category-name {
      font-weight: bold;
      display: inline;
    }
    
    .skills-items {
      display: inline;
      margin-left: 0.1in;
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
      ${resume.basics.email ? `<span>${resume.basics.email}</span>` : ''}
      ${resume.basics.phone && resume.basics.email ? '<span> • </span>' : ''}
      ${resume.basics.phone ? `<span>${resume.basics.phone}</span>` : ''}
      ${resume.basics.location && (resume.basics.email || resume.basics.phone) ? '<span> • </span>' : ''}
      ${resume.basics.location ? `<span>${resume.basics.location}</span>` : ''}
    </div>
    ${resume.basics.links && resume.basics.links.length > 0 ? `
      <div class="contact-info">
        ${resume.basics.links.map((link, index) => `
          ${index > 0 ? ' • ' : ''}${link.label}: ${link.url}
        `).join('')}
      </div>
    ` : ''}
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
      ${resume.experience.map(exp => `
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
              ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.education && resume.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${resume.education.map(edu => `
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
              ${edu.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.projects && resume.projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${resume.projects.map(project => `
        <div class="project-item">
          <div class="project-name">
            ${project.name}
            ${project.link ? `<span style="font-weight: normal; font-size: 10pt; margin-left: 0.1in;">(${project.link})</span>` : ''}
          </div>
          ${project.description ? `<div style="font-style: italic; margin-bottom: 0.05in;">${project.description}</div>` : ''}
          ${project.bullets && project.bullets.length > 0 ? `
            <ul>
              ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.skills && resume.skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${resume.skills.map(skillCategory => `
        <div class="skills-category">
          <span class="skills-category-name">${skillCategory.category}:</span>
          <span class="skills-items">${skillCategory.items.join(', ')}</span>
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.awards && resume.awards.length > 0 ? `
    <div class="section">
      <div class="section-title">Awards & Achievements</div>
      ${resume.awards.map(award => `
        <div style="margin-bottom: 0.1in;">
          <span style="font-weight: bold;">${award.name}</span>
          ${award.by ? ` - ${award.by}` : ''}
          ${award.year ? ` (${award.year})` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>
  `;
}

function generateModernTemplate(resume: Resume): string {
  return `
<!DOCTYPE html>
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
      display: flex;
      flex-wrap: wrap;
      gap: 0.15in;
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
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -2pt;
      left: 0;
      width: 40pt;
      height: 2pt;
      background: #764ba2;
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
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200pt, 1fr));
      gap: 0.15in;
    }
    
    .skills-category {
      background: #f8f9fa;
      padding: 0.15in;
      border-radius: 6pt;
      border: 1pt solid #e9ecef;
    }
    
    .skills-category-name {
      font-weight: 600;
      color: #667eea;
      font-size: 11pt;
      display: block;
      margin-bottom: 0.08in;
    }
    
    .skills-items {
      font-size: 10pt;
      line-height: 1.4;
      color: #495057;
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
      ${resume.basics.email ? `<div>${resume.basics.email}</div>` : ''}
      ${resume.basics.phone ? `<div>${resume.basics.phone}</div>` : ''}
      ${resume.basics.location ? `<div>${resume.basics.location}</div>` : ''}
      ${resume.basics.links ? resume.basics.links.map(link => `<div>${link.label}: ${link.url}</div>`).join('') : ''}
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
      ${resume.experience.map(exp => `
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
              ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.education && resume.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${resume.education.map(edu => `
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
              ${edu.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.projects && resume.projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Notable Projects</div>
      ${resume.projects.map(project => `
        <div class="project-item">
          <div class="project-name">
            ${project.name}
            ${project.link ? `<span style="font-weight: normal; font-size: 10pt; margin-left: 0.1in; color: #667eea;"> — ${project.link}</span>` : ''}
          </div>
          ${project.description ? `<div style="font-style: italic; margin-bottom: 0.08in; color: #6c757d;">${project.description}</div>` : ''}
          ${project.bullets && project.bullets.length > 0 ? `
            <ul>
              ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${resume.skills && resume.skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Core Competencies</div>
      <div class="skills-grid">
        ${resume.skills.map(skillCategory => `
          <div class="skills-category">
            <span class="skills-category-name">${skillCategory.category}</span>
            <div class="skills-items">${skillCategory.items.join(' • ')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  ${resume.awards && resume.awards.length > 0 ? `
    <div class="section">
      <div class="section-title">Awards & Recognition</div>
      ${resume.awards.map(award => `
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
</html>
  `;
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

  try {
    const { resume, template = 'classic' } = req.body;
    
    if (!resume) {
      return res.status(400).json({ error: 'Resume data required' });
    }

    // Validate input
    const inputValidation = ResumeZ.safeParse(resume);
    if (!inputValidation.success) {
      return res.status(400).json({ error: 'Invalid resume format' });
    }

    // Generate HTML based on template
    const html = template === 'modern' ? 
      generateModernTemplate(inputValidation.data) : 
      generateClassicTemplate(inputValidation.data);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}