import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { Browser } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateHTML(cvType: string, cvData: any): string {
  const name = cvData.personalInfo?.name || 'Your Name';
  const email = cvData.personalInfo?.email || '';
  const phone = cvData.personalInfo?.phone || '';
  
  let sectionsHTML = '';

  if (cvType === 'academic') {
    if (cvData.education) {
      sectionsHTML += `
        <div class="section">
          <h2>Education</h2>
          <p>${cvData.education.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.researchExperience) {
      sectionsHTML += `
        <div class="section">
          <h2>Research Experience</h2>
          <p>${cvData.researchExperience.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.publications) {
      sectionsHTML += `
        <div class="section">
          <h2>Publications</h2>
          <p>${cvData.publications.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.conferences) {
      sectionsHTML += `
        <div class="section">
          <h2>Conferences & Presentations</h2>
          <p>${cvData.conferences.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.teaching) {
      sectionsHTML += `
        <div class="section">
          <h2>Teaching Experience</h2>
          <p>${cvData.teaching.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.skills) {
      sectionsHTML += `
        <div class="section">
          <h2>Skills</h2>
          <p>${cvData.skills.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
  } else if (cvType === 'professional') {
    if (cvData.summary) {
      sectionsHTML += `
        <div class="section">
          <h2>Professional Summary</h2>
          <p>${cvData.summary.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.workExperience) {
      sectionsHTML += `
        <div class="section">
          <h2>Work Experience</h2>
          <p>${cvData.workExperience.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.education) {
      sectionsHTML += `
        <div class="section">
          <h2>Education</h2>
          <p>${cvData.education.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.skills) {
      sectionsHTML += `
        <div class="section">
          <h2>Skills</h2>
          <p>${cvData.skills.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (cvData.achievements) {
      sectionsHTML += `
        <div class="section">
          <h2>Key Achievements</h2>
          <p>${cvData.achievements.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
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
          .contact-info {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            font-size: 20px;
            color: #1a1a1a;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .section p {
            font-size: 14px;
            line-height: 1.8;
            color: #444;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${name}</h1>
          <div class="contact-info">
            ${[email, phone].filter(Boolean).join(' | ')}
          </div>
        </div>
        ${sectionsHTML}
      </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let browser: Browser | null = null;

  try {
    const { cvType, cvData } = await req.json();
    console.log('Generating PDF for CV type:', cvType);

    const html = generateHTML(cvType, cvData);

    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cvData.personalInfo?.name || 'CV'}_${cvType}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (browser) {
      await browser.close();
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
