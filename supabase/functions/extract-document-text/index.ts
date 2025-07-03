
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to handle CORS preflight requests
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Helper function to send error responses
function createErrorResponse(message: string, status: number) {
  console.error(`Error: ${message}`);
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper function to extract text from PDF
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log("Attempting PDF text extraction for:", file.name);
    
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // For PDF files, we'll try to extract text using a simple approach
    // Convert to Uint8Array for text extraction attempts
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = decoder.decode(uint8Array);
    
    // Simple PDF text extraction - look for text between common PDF markers
    // This is a basic approach and won't work for all PDFs
    const textPattern = /BT\s+.*?ET/g;
    const matches = rawText.match(textPattern);
    
    if (matches && matches.length > 0) {
      // Extract text from PDF stream objects
      let extractedText = matches.join(' ')
        .replace(/BT\s+/g, '')
        .replace(/ET/g, '')
        .replace(/Tj/g, ' ')
        .replace(/TJ/g, ' ')
        .replace(/Td/g, ' ')
        .replace(/TD/g, ' ')
        .replace(/Tm/g, ' ')
        .replace(/T\*/g, '\n')
        .replace(/\([^)]*\)/g, (match) => match.slice(1, -1))
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length > 50) {
        console.log(`Extracted ${extractedText.length} characters from PDF`);
        return extractedText;
      }
    }
    
    // If PDF extraction fails, return a helpful message
    return `PDF document "${file.name}" was uploaded, but text extraction failed. 

This often happens with:
• Image-based PDFs (scanned documents)
• Password-protected PDFs
• Complex formatting or encrypted PDFs

Please try:
1. Copy-pasting the text content directly into the editor
2. Converting the PDF to a Word document first
3. Using a plain text version of your document

This will ensure our AI can properly analyze your content.`;
    
  } catch (error) {
    console.error("PDF extraction error:", error);
    return `PDF document "${file.name}" was uploaded, but encountered an extraction error.

Please copy and paste the text content directly into the editor for the best AI analysis experience.`;
  }
}

// Helper function to extract text from Word documents
async function extractTextFromWord(file: File): Promise<string> {
  try {
    console.log("Processing Word document:", file.name);
    
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // For DOCX files (which are ZIP archives), we need to extract the document.xml
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check if it's a DOCX file (ZIP signature)
    const isDocx = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B;
    
    if (isDocx) {
      // Try to extract text from DOCX
      const text = await extractDocxText(uint8Array);
      if (text && text.length > 20) {
        console.log(`Extracted ${text.length} characters from DOCX`);
        return text;
      }
    }
    
    // For older DOC files or if DOCX extraction fails, try simple text extraction
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = decoder.decode(uint8Array);
    
    // Clean up the raw text
    let cleanText = rawText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Look for readable text patterns
    const words = cleanText.split(' ').filter(word => 
      word.length > 2 && /^[a-zA-Z]/.test(word)
    );
    
    if (words.length > 10) {
      cleanText = words.join(' ');
      console.log(`Extracted ${cleanText.length} characters from Word document`);
      return cleanText;
    }
    
    // If extraction fails, return helpful message
    return `Word document "${file.name}" was uploaded, but text extraction had limited success.

For the best results, please:
1. **Copy and paste** the text content directly into the editor
2. **Save as plain text** (.txt) and upload that instead
3. **Export as PDF** and try uploading that

This will ensure our AI can properly analyze your document content and provide accurate feedback.`;
    
  } catch (error) {
    console.error("Word processing error:", error);
    return `Word document "${file.name}" was uploaded, but encountered an extraction error.

Please copy and paste the text content directly into the editor for the best AI analysis experience.`;
  }
}

// Helper function to extract text from DOCX files
async function extractDocxText(uint8Array: Uint8Array): Promise<string> {
  try {
    // This is a simplified DOCX text extraction
    // DOCX files are ZIP archives containing XML files
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(uint8Array);
    
    // Look for document.xml content patterns
    const xmlPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const matches = [];
    let match;
    
    while ((match = xmlPattern.exec(content)) !== null) {
      if (match[1] && match[1].trim()) {
        matches.push(match[1]);
      }
    }
    
    if (matches.length > 0) {
      return matches.join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Alternative pattern for text content
    const textPattern = />\s*([A-Za-z][A-Za-z0-9\s,.'";:!?-]{10,})\s*</g;
    const textMatches = [];
    
    while ((match = textPattern.exec(content)) !== null) {
      if (match[1] && match[1].trim().length > 10) {
        textMatches.push(match[1].trim());
      }
    }
    
    if (textMatches.length > 0) {
      return textMatches.join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    return '';
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return '';
  }
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Check if request is multipart/form-data by examining Content-Type header
    const contentType = req.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      console.error(`Invalid content type: ${contentType}`);
      return createErrorResponse("Request must be multipart/form-data", 400);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get form data and file
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return createErrorResponse("No file uploaded", 400);
      }

      // Check file type
      const fileType = file.type;
      console.log(`Processing file of type: ${fileType}, name: ${file.name}`);

      // Extract text based on file type
      let extractedText = "";
      
      if (fileType === "application/pdf") {
        // For PDFs, we'd use a service API (requires setup)
        console.log("Detected PDF file, using PDF extraction");
        extractedText = await extractTextFromPDF(file);
      } else if (
        fileType === "application/msword" || 
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // For Word docs, extract directly
        console.log("Detected Word document, extracting text directly");
        extractedText = await extractTextFromWord(file);
      } else {
        return createErrorResponse("Unsupported file type. Only PDF and Word documents are supported.", 400);
      }

      console.log(`Successfully extracted ${extractedText.length} characters from document`);
      
      // Return the extracted text without any modification
      return new Response(
        JSON.stringify({ text: extractedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (formDataError) {
      console.error("Form data parsing error:", formDataError);
      return createErrorResponse(`Failed to process form data: ${formDataError.message}`, 400);
    }
  } catch (error) {
    console.error("Document processing error:", error);
    return createErrorResponse(`Document processing failed: ${error.message}`, 500);
  }
});
