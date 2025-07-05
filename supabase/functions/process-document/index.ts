import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

// CORS headers
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

// Enhanced PDF text extraction using more sophisticated parsing
async function extractTextFromPDF(arrayBuffer: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log(`Processing PDF: ${fileName}, size: ${arrayBuffer.byteLength} bytes`);
    
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Strategy 1: Try to find PDF stream objects and text content
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let content = decoder.decode(uint8Array);
    
    // Multiple extraction strategies for better PDF support
    const extractedTexts: string[] = [];
    
    // Enhanced strategy: Look for text streams with better filtering
    const streamPattern = /stream[\r\n]+(.*?)[\r\n]+endstream/gs;
    let match;
    while ((match = streamPattern.exec(content)) !== null) {
      const streamContent = match[1];
      if (streamContent && !streamContent.includes('%PDF') && streamContent.length > 20) {
        // Try to extract readable text from stream
        const cleanText = streamContent
          .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII and whitespace
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanText.length > 50) {
          extractedTexts.push(cleanText);
        }
      }
    }
    
    // Strategy 2: Extract text objects (Tj commands) - more precise
    const textObjectPattern = /\(([^)]*)\)\s*Tj/g;
    const textMatches: string[] = [];
    while ((match = textObjectPattern.exec(content)) !== null) {
      if (match[1] && match[1].trim().length > 2) {
        // Decode PDF string escapes
        const decodedText = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"');
        textMatches.push(decodedText.trim());
      }
    }
    
    if (textMatches.length > 0) {
      extractedTexts.push(textMatches.join(' '));
    }
    
    // Strategy 3: Extract text arrays (TJ commands) with better parsing
    const textArrayPattern = /\[([^\]]*)\]\s*TJ/g;
    while ((match = textArrayPattern.exec(content)) !== null) {
      const arrayContent = match[1];
      // Extract strings from the array with better parsing
      const stringPattern = /\(([^)]*)\)/g;
      const strings: string[] = [];
      let stringMatch;
      while ((stringMatch = stringPattern.exec(arrayContent)) !== null) {
        if (stringMatch[1] && stringMatch[1].trim().length > 1) {
          strings.push(stringMatch[1]);
        }
      }
      if (strings.length > 0) {
        extractedTexts.push(strings.join(' '));
      }
    }
    
    // Strategy 4: Look for readable text patterns with better filtering
    const readableTextPattern = /[A-Za-z]{3,}[\w\s.,;:!?'"()-]{10,}/g;
    const readableMatches = content.match(readableTextPattern);
    if (readableMatches && readableMatches.length > 5) {
      const combinedText = readableMatches
        .filter(text => 
          text.length > 10 && 
          !text.includes('obj') && 
          !text.includes('endobj') &&
          !text.includes('stream') &&
          !text.includes('xref')
        )
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (combinedText.length > 100) {
        extractedTexts.push(combinedText);
      }
    }
    
    // Strategy 5: Look for embedded fonts and text content
    const fontTextPattern = /\/F\d+\s+\d+\s+Tf[^(]*\(([^)]+)\)/g;
    while ((match = fontTextPattern.exec(content)) !== null) {
      if (match[1] && match[1].length > 3) {
        extractedTexts.push(match[1]);
      }
    }
    
    // Combine and clean all extracted text with deduplication
    const allText = extractedTexts.join('\n\n');
    const combinedText = allText
      .replace(/\s+/g, ' ')
      .replace(/(.{50,}?)\1+/g, '$1') // Remove repeated chunks
      .trim();
    
    if (combinedText.length > 100) {
      console.log(`Successfully extracted ${combinedText.length} characters from PDF`);
      return combinedText;
    }
    
    // Enhanced fallback message with more helpful instructions
    return `PDF document "${fileName}" was processed, but automatic text extraction had limited success.

This can happen with:
• **Image-based PDFs** (scanned documents) - these contain images of text, not actual text
• **Password-protected PDFs** - encrypted files cannot be processed
• **Complex formatting** - tables, forms, or unusual layouts
• **Non-standard encoding** - some PDFs use custom fonts or encoding

**Recommended solutions:**
1. **Copy and paste** the text content directly into the editor below
2. **Convert to Word document** (.docx) first and upload that instead  
3. **Save as plain text** (.txt) and upload that
4. **Use OCR software** if it's a scanned document

This will ensure our AI can properly analyze your content and provide accurate feedback.`;
    
  } catch (error) {
    console.error("PDF extraction error:", error);
    return `PDF document "${fileName}" was uploaded, but encountered a processing error.

**What happened:** ${error instanceof Error ? error.message : 'Unknown processing error'}

**What to do next:**
1. **Copy and paste** the text content directly into the editor below
2. **Try converting** the PDF to a Word document (.docx) first
3. **Check if the PDF** is password-protected or corrupted

This will give you the best results for AI analysis.`;
  }
}

// Enhanced Word document text extraction
async function extractTextFromWord(arrayBuffer: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log(`Processing Word document: ${fileName}, size: ${arrayBuffer.byteLength} bytes`);
    
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check if it's a DOCX file (ZIP signature: PK)
    const isDocx = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B;
    
    if (isDocx) {
      // Process DOCX (which is a ZIP archive)
      const text = await extractDocxText(uint8Array);
      if (text && text.length > 50) {
        console.log(`Successfully extracted ${text.length} characters from DOCX`);
        return text;
      }
    }
    
    // Try to extract from older DOC format or fallback
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = decoder.decode(uint8Array);
    
    // Clean up the raw text and look for readable content
    const cleanText = rawText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Look for patterns that indicate actual document text
    const sentences = cleanText.split(/[.!?]+/).filter(sentence => {
      const words = sentence.trim().split(/\s+/).filter(word => 
        word.length > 2 && /^[A-Za-z]/.test(word)
      );
      return words.length >= 5; // At least 5 meaningful words
    });
    
    if (sentences.length >= 3) {
      const extractedText = sentences.join('. ').trim();
      if (extractedText.length > 100) {
        console.log(`Successfully extracted ${extractedText.length} characters from Word document`);
        return extractedText;
      }
    }
    
    // If extraction fails, return helpful message
    return `Word document "${fileName}" was processed, but automatic text extraction had limited success.

For the best results, please:
1. **Copy and paste** the text content directly into the editor
2. **Save as plain text** (.txt) and upload that instead
3. **Export as PDF** and try uploading that

This will ensure our AI can properly analyze your document content and provide accurate feedback.`;
    
  } catch (error) {
    console.error("Word processing error:", error);
    return `Word document "${fileName}" was uploaded, but encountered a processing error.

Please copy and paste the text content directly into the editor for the best AI analysis experience.`;
  }
}

// Helper function to extract text from DOCX files (ZIP archives)
async function extractDocxText(uint8Array: Uint8Array): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(uint8Array);
    
    // DOCX files contain XML with text in <w:t> tags
    const extractedTexts: string[] = [];
    
    // Pattern 1: Standard text elements
    const textPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    while ((match = textPattern.exec(content)) !== null) {
      if (match[1] && match[1].trim()) {
        extractedTexts.push(match[1].trim());
      }
    }
    
    // Pattern 2: Text with attributes
    const textPatternWithAttrs = /<w:t\s[^>]*>([^<]*)<\/w:t>/g;
    while ((match = textPatternWithAttrs.exec(content)) !== null) {
      if (match[1] && match[1].trim()) {
        extractedTexts.push(match[1].trim());
      }
    }
    
    // Pattern 3: Look for any text between XML tags that looks like document content
    const generalTextPattern = />([A-Za-z][A-Za-z0-9\s.,'"!?;:-]{20,})</g;
    while ((match = generalTextPattern.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length > 20 && !text.includes('<') && !text.includes('document')) {
        extractedTexts.push(text);
      }
    }
    
    if (extractedTexts.length > 0) {
      return extractedTexts.join(' ')
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
    // Parse JSON request body
    const { fileUrl, fileName, fileType } = await req.json();
    
    if (!fileUrl || !fileName || !fileType) {
      return createErrorResponse("Missing required parameters: fileUrl, fileName, fileType", 400);
    }

    // Validate file type
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
      return createErrorResponse("Unsupported file type. Only PDF and Word documents are supported.", 400);
    }

    console.log(`Processing document: ${fileName} (${fileType})`);

    // Fetch the file from Supabase storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    console.log(`File fetched successfully, size: ${arrayBuffer.byteLength} bytes`);

    // Extract text based on file type
    let extractedText = "";
    
    if (fileType === "application/pdf") {
      extractedText = await extractTextFromPDF(arrayBuffer, fileName);
    } else if (
      fileType === "application/msword" || 
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await extractTextFromWord(arrayBuffer, fileName);
    }

    console.log(`Text extraction completed. Length: ${extractedText.length} characters`);
    
    // Return the extracted text
    return new Response(
      JSON.stringify({ 
        text: extractedText,
        fileName: fileName,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Document processing error:", error);
    return createErrorResponse(`Document processing failed: ${error.message}`, 500);
  }
});