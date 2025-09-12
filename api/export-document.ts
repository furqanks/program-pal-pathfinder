import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Environment variables with fallbacks
const supabaseUrl = process.env.SUPABASE_URL || 'https://ljoxowcnyiqsbmzkkudn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb3hvd2NueWlxc2JtemtrdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODIwMzEsImV4cCI6MjA2MzA1ODAzMX0.Ogn9ZXzTrEwKns_EQXrH1g04GXbnSPAUDN4-0hEHcHw';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// CORS helper - Updated to include lovable.dev domains
const setCorsHeaders = (res: NextApiResponse, origin: string) => {
  if (allowedOrigins.includes(origin) || 
      origin.includes('lovable.app') || 
      origin.includes('lovable.dev') || 
      origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
};

// Rate limiting helper (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const limit = rateLimitStore.get(userId);
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 10) { // 10 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
};

// Generate HTML from document content - Updated field mapping
const generateDocumentHTML = (document: any, format: string = 'pdf'): string => {
  const content = document.original_text || document.content_raw || '';
  const title = `${document.document_type} - ${new Date().toLocaleDateString()}`;
  
  const styles = format === 'pdf' ? `
    <style>
      body {
        font-family: 'Times New Roman', serif;
        line-height: 1.6;
        max-width: 8.5in;
        margin: 1in auto;
        color: #333;
        background: white;
      }
      .header {
        text-align: center;
        margin-bottom: 2em;
        border-bottom: 2px solid #333;
        padding-bottom: 0.5em;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .subtitle {
        font-size: 14px;
        color: #666;
        margin: 0.5em 0 0 0;
      }
      .content {
        font-size: 12px;
        text-align: justify;
        white-space: pre-wrap;
        margin: 2em 0;
      }
      .footer {
        margin-top: 2em;
        padding-top: 1em;
        border-top: 1px solid #ccc;
        font-size: 10px;
        color: #666;
        text-align: center;
      }
      @media print {
        body { margin: 0.5in; }
        .no-print { display: none; }
      }
      @page {
        margin: 1in;
        size: A4;
      }
    </style>
  ` : `
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #007acc;
        padding-bottom: 15px;
      }
      .title {
        font-size: 28px;
        font-weight: bold;
        margin: 0;
        color: #007acc;
      }
      .subtitle {
        font-size: 16px;
        color: #666;
        margin: 10px 0 0 0;
      }
      .content {
        font-size: 14px;
        white-space: pre-wrap;
        margin: 30px 0;
      }
      .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #ccc;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${styles}
    </head>
    <body>
      <div class="header">
        <h1 class="title">${document.document_type || 'Document'}</h1>
        <p class="subtitle">Created on ${new Date(document.created_at || Date.now()).toLocaleDateString()}</p>
      </div>
      
      <div class="content">
        ${content}
      </div>
      
      <div class="footer">
        Generated on ${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;
};

// Generate DOCX from document - Updated field mapping
const generateDOCX = async (document: any): Promise<Buffer> => {
  const content = document.original_text || document.content_raw || '';
  const title = `${document.document_type} - ${new Date().toLocaleDateString()}`;
  
  console.log('Generating DOCX with content length:', content.length);
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: document.document_type || 'Document',
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Created on ${new Date(document.created_at || Date.now()).toLocaleDateString()}`,
              italics: true,
              size: 20,
            }),
          ],
        }),
        new Paragraph({ text: '' }), // Empty paragraph for spacing
        ...content.split('\n').map(line => 
          new Paragraph({
            children: [new TextRun({ text: line, size: 24 })],
          })
        ),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on ${new Date().toLocaleString()}`,
              italics: true,
              size: 18,
            }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '';
  setCorsHeaders(res, origin);

  // Handle preflight - Updated headers
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-client-info, apikey');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Export request received:', { method: req.method, origin });
    
    // Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Validating user token...');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Token validation failed:', authError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('User authenticated:', user.id);

    // Create an authenticated client for RLS-aware DB access
    const db = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      console.log('Rate limit exceeded for user:', user.id);
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { action, documentId, format = 'docx' } = req.body;
    console.log('Request params:', { action, documentId, format });

    if (!documentId) {
      console.log('Missing document ID');
      return res.status(400).json({ error: 'Document ID is required' });
    }

    // Fetch document with RLS using user's token - Updated table name
    console.log('Fetching document from user_documents table...');
    const { data: document, error: fetchError } = await db
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.log('Database fetch error:', fetchError);
      return res.status(404).json({ error: 'Document not found', details: fetchError.message });
    }

    if (!document) {
      console.log('No document returned from database');
      return res.status(404).json({ error: 'Document not found' });
    }

    console.log('Document found:', { id: document.id, type: document.document_type });

    const filename = `${document.document_type}_${new Date().toISOString().split('T')[0]}`;
    console.log('Generated filename:', filename);

    if (format === 'html') {
      console.log('Generating HTML export...');
      const html = generateDocumentHTML(document, 'html');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.html"`);
      return res.status(200).send(html);
    }

    if (format === 'txt') {
      console.log('Generating TXT export...');
      const content = document.original_text || document.content_raw || '';
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
      return res.status(200).send(content);
    }

    if (format === 'docx') {
      console.log('Generating DOCX export...');
      const docxBuffer = await generateDOCX(document);
      console.log('DOCX buffer generated, size:', docxBuffer.length);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.docx"`);
      return res.status(200).send(docxBuffer);
    }

    if (format === 'pdf') {
      console.log('Generating PDF export...');
      const html = generateDocumentHTML(document, 'pdf');
      
      const browser = await puppeteer.launch({
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
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in',
        },
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      return res.status(200).send(pdfBuffer);
    }

    console.log('Unsupported format requested:', format);
    return res.status(400).json({ error: 'Unsupported format', supportedFormats: ['docx', 'pdf', 'html', 'txt'] });

  } catch (error) {
    console.error('Export error:', error);
    
    // Provide detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.error('Full error details:', errorDetails);
    
    return res.status(500).json({ 
      error: 'Export failed', 
      details: errorMessage,
      timestamp: errorDetails.timestamp
    });
  }
}