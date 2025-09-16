import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  attrs?: any;
  marks?: TipTapMark[];
  text?: string;
}

interface TipTapMark {
  type: string;
  attrs?: any;
}

// Simple DOCX generation function using basic XML structure
const generateDocxFromTipTap = (content: TipTapNode, title: string): Uint8Array => {
  // Basic DOCX XML structure
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${title ? `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>${escapeXml(title)}</w:t></w:r></w:p>` : ''}
    ${processContentToXml(content)}
    <w:p><w:r><w:rPr><w:i/></w:rPr><w:t>Generated on ${new Date().toLocaleString()}</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  // Create ZIP structure for DOCX
  const files = new Map<string, string>();
  
  // Add required DOCX files
  files.set('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  files.set('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  files.set('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  files.set('word/document.xml', documentXml);

  // Create a simple ZIP-like structure (simplified for demo)
  // In production, you'd use a proper ZIP library
  const encoder = new TextEncoder();
  return encoder.encode(documentXml); // Simplified - just return the XML for now
};

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const processContentToXml = (node: TipTapNode): string => {
  if (!node.content) return '';

  return node.content.map(child => processNodeToXml(child)).join('');
};

const processNodeToXml = (node: TipTapNode): string => {
  switch (node.type) {
    case 'paragraph':
      if (!node.content || node.content.length === 0) {
        return '<w:p><w:r><w:t></w:t></w:r></w:p>';
      }
      const paraContent = node.content.map(child => processInlineToXml(child)).join('');
      return `<w:p>${paraContent}</w:p>`;

    case 'heading':
      const level = node.attrs?.level || 1;
      const headingStyle = `Heading${level}`;
      if (!node.content) return '';
      const headingContent = node.content.map(child => processInlineToXml(child)).join('');
      return `<w:p><w:pPr><w:pStyle w:val="${headingStyle}"/></w:pPr>${headingContent}</w:p>`;

    case 'bulletList':
      if (!node.content) return '';
      return node.content.map(listItem => {
        if (!listItem.content) return '';
        return listItem.content.map(para => {
          if (!para.content) return '';
          const itemContent = para.content.map(child => processInlineToXml(child)).join('');
          return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${itemContent}</w:p>`;
        }).join('');
      }).join('');

    case 'orderedList':
      if (!node.content) return '';
      return node.content.map((listItem, index) => {
        if (!listItem.content) return '';
        return listItem.content.map(para => {
          if (!para.content) return '';
          const itemContent = para.content.map(child => processInlineToXml(child)).join('');
          return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr></w:pPr>${itemContent}</w:p>`;
        }).join('');
      }).join('');

    case 'blockquote':
      if (!node.content) return '';
      const quoteContent = node.content.map(child => processNodeToXml(child)).join('');
      return `<w:p><w:pPr><w:ind w:left="720"/></w:pPr><w:r><w:t>"</w:t></w:r>${quoteContent.replace(/<w:p>/g, '').replace(/<\/w:p>/g, '')}<w:r><w:t>"</w:t></w:r></w:p>`;

    default:
      if (node.content) {
        return node.content.map(child => processNodeToXml(child)).join('');
      }
      return '';
  }
};

const processInlineToXml = (node: TipTapNode): string => {
  if (node.type === 'text' && node.text) {
    let runProps = '';
    let text = escapeXml(node.text);

    if (node.marks) {
      const rPr: string[] = [];
      node.marks.forEach(mark => {
        switch (mark.type) {
          case 'bold':
            rPr.push('<w:b/>');
            break;
          case 'italic':
            rPr.push('<w:i/>');
            break;
          case 'underline':
            rPr.push('<w:u w:val="single"/>');
            break;
        }
      });
      if (rPr.length > 0) {
        runProps = `<w:rPr>${rPr.join('')}</w:rPr>`;
      }
    }

    return `<w:r>${runProps}<w:t>${text}</w:t></w:r>`;
  } else if (node.type === 'hardBreak') {
    return '<w:r><w:br/></w:r>';
  }

  return '';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content_json } = await req.json();

    if (!content_json) {
      return new Response(
        JSON.stringify({ error: 'Missing content_json in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating DOCX for:', title);
    console.log('Content:', JSON.stringify(content_json, null, 2));

    // For now, return a simple text response since creating a proper DOCX requires more complex ZIP handling
    // In a production environment, you'd use a proper DOCX generation library
    const xmlContent = processContentToXml(content_json);
    
    return new Response(
      xmlContent || 'No content to export',
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${title || 'document'}.docx"`,
        },
      }
    );

  } catch (error) {
    console.error('Error generating DOCX:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate DOCX',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});