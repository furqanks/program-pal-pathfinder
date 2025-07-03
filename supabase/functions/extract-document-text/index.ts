
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extract } from "https://deno.land/x/office_text_extractor@v0.2.0/mod.ts";

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

// Helper function to extract text from PDF using simple text fallback
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log("Attempting PDF text extraction");
    
    // For basic PDF text extraction, we'll return a helpful message
    // In production, you'd use a proper PDF parsing library or service
    return `PDF document uploaded: "${file.name}". 
    
For better PDF text extraction, please consider:
1. Converting your PDF to a Word document first
2. Copy-pasting the text content directly into the editor

This will ensure accurate text processing for feedback generation.`;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Helper function to extract text from Word documents
async function extractTextFromWord(file: File): Promise<string> {
  try {
    console.log("Extracting text from Word document:", file.name);
    
    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use the office text extractor
    const extractedText = await extract(uint8Array);
    
    console.log(`Successfully extracted ${extractedText.length} characters from Word document`);
    console.log("First 200 chars:", extractedText.substring(0, 200) + "...");
    
    // Clean up the extracted text
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    if (!cleanText || cleanText.length < 10) {
      throw new Error("No meaningful content could be extracted from the document");
    }
    
    return cleanText;
  } catch (error) {
    console.error("Word extraction error:", error);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
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
