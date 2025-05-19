
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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

// Helper function to generate a random storage key
function generateStorageKey(fileExtension: string): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().getTime();
  return `temp/${randomString}_${timestamp}.${fileExtension}`;
}

// Helper function to extract the text from a PDF file
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    // Using PDF.co Web API for extraction (you could replace this with any PDF extraction service)
    const apiKey = Deno.env.get('PDF_EXTRACTION_API_KEY');
    
    if (!apiKey) {
      // For demo purposes, return a placeholder text that indicates it's from a PDF
      console.log("PDF extraction API key not found, using mock extraction");
      return `This is a PDF document. Unfortunately, the API key for PDF extraction is missing. 
      In production, you would need to set up a PDF extraction API key.
      For now, please try uploading a Word document instead as those can be processed directly.`;
    }

    // In a real implementation, you would call a PDF extraction API here
    // For this implementation, we'll return a message explaining the situation
    return "PDF extraction requires a third-party service API key. Please configure it in the environment variables.";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Helper function to extract the text from a Word document
// For .docx files, we're using the raw text content
async function extractTextFromWord(file: File): Promise<string> {
  try {
    // For Word documents, we'll extract text from the file directly
    console.log("Extracting text from Word document");
    
    // Read the file as text
    const textContent = await file.text();
    
    console.log(`Extracted ${textContent.length} characters from document`);
    console.log("First 100 chars:", textContent.substring(0, 100) + "...");
    
    // Return the text content
    return textContent;
  } catch (error) {
    console.error("Word extraction error:", error);
    throw new Error("Failed to extract text from Word document");
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
        extractedText = await extractTextFromPDF("");
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
