import type { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

function generateCVHtml(cvType: string, cvData: any): string {
  const contactInfo = [cvData.email, cvData.phone, cvData.location].filter(Boolean).join(' | ');
  
  let sectionsHtml = '';
  
  if (cvType === 'academic') {
    if (cvData.education) {
      sectionsHtml += `
        <div class="section">
          <h2>EDUCATION</h2>
          <p>${cvData.education.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.research) {
      sectionsHtml += `
        <div class="section">
          <h2>RESEARCH EXPERIENCE</h2>
          <p>${cvData.research.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.publications) {
      sectionsHtml += `
        <div class="section">
          <h2>PUBLICATIONS</h2>
          <p>${cvData.publications.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.conferences) {
      sectionsHtml += `
        <div class="section">
          <h2>CONFERENCES & PRESENTATIONS</h2>
          <p>${cvData.conferences.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.teaching) {
      sectionsHtml += `
        <div class="section">
          <h2>TEACHING EXPERIENCE</h2>
          <p>${cvData.teaching.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.skills) {
      sectionsHtml += `
        <div class="section">
          <h2>SKILLS</h2>
          <p>${cvData.skills.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
  } else {
    if (cvData.summary) {
      sectionsHtml += `
        <div class="section">
          <h2>PROFESSIONAL SUMMARY</h2>
          <p>${cvData.summary.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.experience) {
      sectionsHtml += `
        <div class="section">
          <h2>WORK EXPERIENCE</h2>
          <p>${cvData.experience.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.education) {
      sectionsHtml += `
        <div class="section">
          <h2>EDUCATION</h2>
          <p>${cvData.education.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.skills) {
      sectionsHtml += `
        <div class="section">
          <h2>SKILLS</h2>
          <p>${cvData.skills.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.achievements) {
      sectionsHtml += `
        <div class="section">
          <h2>ACHIEVEMENTS</h2>
          <p>${cvData.achievements.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
          color: #1a1a1a;
        }
        .header .contact {
          font-size: 14px;
          color: #555;
        }
        .section {
          margin-bottom: 25px;
        }
        .section h2 {
          font-size: 18px;
          text-transform: uppercase;
          color: #1a1a1a;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 15px;
          letter-spacing: 1px;
        }
        .section p {
          font-size: 14px;
          color: #333;
          line-height: 1.8;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${cvData.fullName || 'Your Name'}</h1>
        ${contactInfo ? `<div class="contact">${contactInfo}</div>` : ''}
      </div>
      ${sectionsHtml}
    </body>
    </html>
  `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let browser;
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { cvType, cvData } = req.body;

    if (!cvType || !cvData) {
      return res.status(400).json({ error: 'Missing cvType or cvData' });
    }

    const html = generateCVHtml(cvType, cvData);

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    const filename = `${(cvData.fullName || 'CV').replace(/[^a-z0-9_-]+/gi, '_')}_${cvType}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error: any) {
    console.error('export-cv-pdf error:', error);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({ error: error?.message || 'Failed to export CV as PDF' });
  }
}
