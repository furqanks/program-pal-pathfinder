
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

// Helper function to extract the text from a PDF file using a third-party API
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    // Using PDF.co Web API for extraction (you could replace this with any PDF extraction service)
    const apiKey = Deno.env.get('PDF_EXTRACTION_API_KEY');
    
    if (!apiKey) {
      // Fallback to a simple response for demo purposes
      console.log("PDF extraction API key not found, returning placeholder text");
      return "This is placeholder text extracted from a PDF document. In production, this would be the actual content of your PDF file.";
    }

    // In a real implementation, you would call a PDF extraction API here
    // Example with PDF.co (requires API key):
    // const response = await fetch(`https://api.pdf.co/v1/pdf/extract/text`, {
    //   method: 'POST',
    //   headers: {
    //     'x-api-key': apiKey,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     url: pdfUrl,
    //   }),
    // });
    // const data = await response.json();
    // return data.text;

    // For demo purposes:
    return "This is placeholder text extracted from a PDF document. In production, this would be the actual content of your PDF file.";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Helper function to extract the text from a Word document
async function extractTextFromWord(docUrl: string): Promise<string> {
  try {
    // Using a third-party API for Word document extraction (you could replace this with any service)
    const apiKey = Deno.env.get('DOCX_EXTRACTION_API_KEY');
    
    if (!apiKey) {
      // Fallback to a simple response for demo purposes
      console.log("Word extraction API key not found, returning placeholder text");
      return "This is placeholder text extracted from a Word document. In production, this would be the actual content of your document.";
    }

    // In a real implementation, you would call a Word document extraction API here
    
    // For demo purposes:
    return "This is placeholder text extracted from a Word document. In production, this would be the actual content of your document.";
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
    // Check if request is multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return createErrorResponse("Request must be multipart/form-data", 400);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get form data and file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return createErrorResponse("No file uploaded", 400);
    }

    // Check file type
    const fileType = file.type;
    let fileExtension = "";
    let extractionFunction: (url: string) => Promise<string>;

    if (fileType === "application/pdf") {
      fileExtension = "pdf";
      extractionFunction = extractTextFromPDF;
    } else if (
      fileType === "application/msword" || 
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      fileExtension = fileType === "application/msword" ? "doc" : "docx";
      extractionFunction = extractTextFromWord;
    } else {
      return createErrorResponse("Unsupported file type. Only PDF and Word documents are supported.", 400);
    }

    // Upload file to Supabase Storage
    const storageKey = generateStorageKey(fileExtension);
    
    // Create temp bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'temp')) {
      await supabase.storage.createBucket('temp', { public: false });
    }

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('temp')
      .upload(storageKey.replace('temp/', ''), file, {
        contentType: fileType,
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return createErrorResponse(`Failed to upload file: ${uploadError.message}`, 500);
    }

    // Get file URL
    const { data: urlData } = await supabase.storage
      .from('temp')
      .createSignedUrl(storageKey.replace('temp/', ''), 60); // URL valid for 60 seconds

    if (!urlData?.signedUrl) {
      return createErrorResponse("Failed to generate file URL", 500);
    }

    // Extract text from the document
    const extractedText = await extractionFunction(urlData.signedUrl);

    // Clean up: delete the temporary file
    await supabase.storage
      .from('temp')
      .remove([storageKey.replace('temp/', '')]);

    // Return the extracted text
    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Document processing error:", error);
    return createErrorResponse(`Document processing failed: ${error.message}`, 500);
  }
});
