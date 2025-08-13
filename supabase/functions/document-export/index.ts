import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, documentId, userId, format = 'pdf', ...params } = await req.json();
    
    let result;
    
    switch (action) {
      case 'export_document':
        result = await exportDocument(documentId, userId, format, params);
        break;
      case 'batch_export':
        result = await batchExport(userId, params.documentIds, format, params);
        break;
      case 'generate_portfolio':
        result = await generatePortfolio(userId, params.programId, params);
        break;
      case 'create_print_version':
        result = await createPrintVersion(documentId, userId, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function exportDocument(documentId: string, userId: string, format: string, options: any) {
  // Get document
  const { data: document, error: docError } = await supabase
    .from('user_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (docError || !document) {
    throw new Error('Document not found or access denied');
  }

  let content = document.original_text;
  let mimeType = 'text/plain';
  let filename = `${document.document_type}_${new Date().toISOString().split('T')[0]}`;

  switch (format.toLowerCase()) {
    case 'pdf':
      content = await generatePDF(document, options);
      mimeType = 'application/pdf';
      filename += '.pdf';
      break;
    case 'docx':
      content = await generateDOCX(document, options);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename += '.docx';
      break;
    case 'html':
      content = await generateHTML(document, options);
      mimeType = 'text/html';
      filename += '.html';
      break;
    case 'txt':
      filename += '.txt';
      break;
    case 'latex':
      content = await generateLaTeX(document, options);
      mimeType = 'application/x-latex';
      filename += '.tex';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  // In a real implementation, you'd upload to storage and return a download URL
  // For now, return the content directly encoded
  const base64Content = btoa(content);

  return {
    filename,
    mimeType,
    content: base64Content,
    downloadUrl: `data:${mimeType};base64,${base64Content}`,
    size: content.length
  };
}

async function batchExport(userId: string, documentIds: string[], format: string, options: any) {
  // Get all documents
  const { data: documents, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .in('id', documentIds);

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  const exports = [];
  
  for (const document of documents || []) {
    try {
      const exportResult = await exportDocument(document.id, userId, format, options);
      exports.push({
        documentId: document.id,
        documentType: document.document_type,
        success: true,
        ...exportResult
      });
    } catch (error) {
      exports.push({
        documentId: document.id,
        documentType: document.document_type,
        success: false,
        error: error.message
      });
    }
  }

  return {
    exports,
    totalRequested: documentIds.length,
    successful: exports.filter(e => e.success).length,
    failed: exports.filter(e => !e.success).length
  };
}

async function generatePortfolio(userId: string, programId: string, options: any) {
  // Get program details
  const { data: program, error: programError } = await supabase
    .from('programs_saved')
    .select('*')
    .eq('id', programId)
    .eq('user_id', userId)
    .single();

  if (programError || !program) {
    throw new Error('Program not found');
  }

  // Get all documents for this program
  const { data: documents, error: docsError } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .order('document_type');

  if (docsError) {
    throw new Error(`Failed to fetch documents: ${docsError.message}`);
  }

  // Generate portfolio HTML
  const portfolioHTML = generatePortfolioHTML(program, documents || [], options);
  
  // Convert to PDF (simplified - in production use proper PDF library)
  const portfolioPDF = await generatePDFFromHTML(portfolioHTML);
  
  const filename = `${program.program_name}_Portfolio_${new Date().toISOString().split('T')[0]}.pdf`;
  const base64Content = btoa(portfolioPDF);

  return {
    filename,
    mimeType: 'application/pdf',
    content: base64Content,
    downloadUrl: `data:application/pdf;base64,${base64Content}`,
    documentsIncluded: documents?.length || 0,
    programName: program.program_name,
    university: program.university
  };
}

async function createPrintVersion(documentId: string, userId: string, options: any) {
  const document = await supabase
    .from('user_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (!document.data) {
    throw new Error('Document not found');
  }

  // Format for printing with proper margins, fonts, etc.
  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document.data.document_type}</title>
      <style>
        @page { 
          margin: 1in;
          size: letter;
        }
        body { 
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
        }
        h1 { 
          font-size: 14pt;
          margin-bottom: 0.5in;
          text-align: center;
        }
        p { 
          margin-bottom: 12pt;
          text-align: justify;
        }
        .header {
          text-align: center;
          margin-bottom: 0.5in;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${document.data.document_type}</h1>
      </div>
      <div class="content">
        ${document.data.original_text.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
    </body>
    </html>
  `;

  const base64Content = btoa(printHTML);

  return {
    filename: `${document.data.document_type}_Print.html`,
    mimeType: 'text/html',
    content: base64Content,
    downloadUrl: `data:text/html;base64,${base64Content}`,
    optimizedForPrint: true
  };
}

// Helper functions for different formats
async function generatePDF(document: any, options: any): Promise<string> {
  // Simplified PDF generation - in production use proper PDF library
  const content = `
    ${document.document_type}
    
    ${document.original_text}
    
    ${document.feedback_summary ? `\n\nAI Feedback:\n${document.feedback_summary}` : ''}
    ${document.score ? `\n\nScore: ${document.score}/10` : ''}
  `;
  
  return content; // In real implementation, return actual PDF binary
}

async function generateDOCX(document: any, options: any): Promise<string> {
  // Simplified DOCX generation - in production use proper DOCX library
  const content = `
    Document Type: ${document.document_type}
    Created: ${new Date(document.created_at).toLocaleDateString()}
    
    ${document.original_text}
  `;
  
  return content;
}

async function generateHTML(document: any, options: any): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document.document_type}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #eee; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .feedback { background: #f5f5f5; padding: 15px; margin-top: 20px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>${document.document_type}</h1>
      <div class="meta">
        Created: ${new Date(document.created_at).toLocaleDateString()}
        ${document.score ? ` | Score: ${document.score}/10` : ''}
      </div>
      <div class="content">
        ${document.original_text.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
      ${document.feedback_summary ? `
        <div class="feedback">
          <h3>AI Feedback</h3>
          <p>${document.feedback_summary}</p>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

async function generateLaTeX(document: any, options: any): Promise<string> {
  return `
\\documentclass[12pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{times}

\\title{${document.document_type}}
\\author{}
\\date{${new Date(document.created_at).toLocaleDateString()}}

\\begin{document}
\\maketitle

${document.original_text.split('\n\n').map(p => `${p}\n`).join('\n')}

${document.score ? `\\vspace{1em}\n\\noindent\\textbf{Score:} ${document.score}/10` : ''}

\\end{document}
  `;
}

function generatePortfolioHTML(program: any, documents: any[], options: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Application Portfolio - ${program.program_name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .program-info { margin-bottom: 30px; }
        .document { margin-bottom: 40px; page-break-before: auto; }
        .document h2 { color: #333; border-bottom: 1px solid #ccc; }
        h1 { color: #333; }
        .meta { color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Application Portfolio</h1>
        <div class="program-info">
          <h2>${program.program_name}</h2>
          <p><strong>University:</strong> ${program.university}</p>
          <p><strong>Country:</strong> ${program.country}</p>
          ${program.deadline ? `<p><strong>Deadline:</strong> ${program.deadline}</p>` : ''}
        </div>
      </div>
      
      ${documents.map(doc => `
        <div class="document">
          <h2>${doc.document_type}</h2>
          <div class="meta">
            Version ${doc.version_number} | Created: ${new Date(doc.created_at).toLocaleDateString()}
            ${doc.score ? ` | Score: ${doc.score}/10` : ''}
          </div>
          <div class="content">
            ${doc.original_text.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

async function generatePDFFromHTML(html: string): Promise<string> {
  // Simplified - in production use proper HTML to PDF conversion
  return html;
}