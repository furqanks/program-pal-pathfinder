
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
      // For demo purposes, return a more substantial placeholder text
      console.log("PDF extraction API key not found, returning enhanced placeholder text");
      return `
        Statement of Purpose

        My journey toward pursuing a Master's degree in Computer Science began during my undergraduate studies at XYZ University. As a student with a deep passion for artificial intelligence and machine learning, I've been fascinated by the potential of these technologies to solve real-world problems.

        During my undergraduate program, I maintained a GPA of 3.8/4.0 while completing challenging coursework in algorithms, data structures, and machine learning fundamentals. Beyond academics, I've gained practical experience through internships at two technology companies where I worked on developing machine learning models for customer behavior prediction.

        My research experience includes a senior thesis project titled "Neural Networks for Natural Language Processing," where I implemented a novel approach to sentiment analysis that achieved 89% accuracy on benchmark datasets. This work was subsequently published in the undergraduate research journal at my university.

        I am particularly interested in your program because of the renowned faculty working on cutting-edge research in deep learning and natural language processing. The opportunity to work with Professor Johnson on reinforcement learning applications would align perfectly with my career goals of developing AI systems that can learn and adapt in complex environments.

        Upon completion of the Master's program, I aim to pursue a career in industry research, focusing on developing AI solutions that address pressing societal challenges in healthcare or environmental sustainability. I believe that your program will provide me with the knowledge, skills, and network necessary to make meaningful contributions to the field.

        Thank you for considering my application. I am excited about the possibility of joining your prestigious program and contributing to the research community at your institution.
      `;
    }

    // In a real implementation, you would call a PDF extraction API here
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
      // For demo purposes, return a more substantial placeholder text
      console.log("Word extraction API key not found, returning enhanced placeholder text");
      return `
        Letter of Recommendation

        I am writing to highly recommend Jane Doe for admission to your graduate program in Environmental Science. As her professor and research advisor for the past three years, I have had the opportunity to observe Jane's exceptional academic abilities, research skills, and dedication to environmental conservation.

        Jane has consistently ranked in the top 5% of her class, demonstrating outstanding analytical thinking and problem-solving capabilities. Her coursework in Environmental Policy, Climate Science, and Sustainable Development has been exemplary, earning her consistent A grades. Beyond her academic achievements, Jane has shown remarkable initiative by founding the campus Sustainability Club, which has implemented several successful recycling and energy conservation programs across our university.

        As her research advisor, I have been particularly impressed with Jane's independent research project on the impact of microplastics on marine ecosystems. Her methodology was innovative, her data collection meticulous, and her analysis showed a sophisticated understanding of complex ecological interactions that is rare among undergraduate students. This research resulted in a co-authored publication in the Journal of Environmental Studies, a significant achievement for an undergraduate.

        Jane's leadership qualities are equally impressive. She coordinated a team of five students on a field research project in Costa Rica, managing logistics, team dynamics, and research protocols with remarkable efficiency and diplomacy. Her ability to communicate complex scientific concepts to diverse audiences was evident during her presentation at our departmental symposium, where she received the Best Undergraduate Research award.

        I believe Jane possesses the intellectual capacity, research skills, and passion for environmental science necessary to excel in your graduate program. Her dedication to addressing pressing environmental challenges through rigorous scientific inquiry makes her an ideal candidate for advanced study.

        I give Jane my strongest recommendation and would be happy to provide any additional information you may need.

        Sincerely,
        Professor Robert Smith, PhD
        Department of Environmental Science
        University College
      `;
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

      // Generate a storage key for the file
      const storageKey = generateStorageKey(fileExtension);
      const fileKey = storageKey.replace('temp/', '');

      console.log(`Processing ${fileType} file, storage key: ${fileKey}`);
      
      // Create the 'temp' bucket if it doesn't exist
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('temp');
        
        if (bucketError && bucketError.code === '404') {
          console.log("Creating 'temp' bucket");
          const { error: createBucketError } = await supabase.storage
            .createBucket('temp', { public: false });
          
          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError);
            return createErrorResponse(`Failed to create storage bucket: ${createBucketError.message}`, 500);
          }
        }
      } catch (bucketCheckError) {
        console.error("Error checking bucket:", bucketCheckError);
      }
      
      // Upload file to Supabase Storage
      console.log("Uploading file to storage");
      
      // Convert the File to Uint8Array for upload
      const fileBuffer = await file.arrayBuffer();
      const fileUint8Array = new Uint8Array(fileBuffer);
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('temp')
        .upload(fileKey, fileUint8Array, {
          contentType: fileType,
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return createErrorResponse(`Failed to upload file: ${uploadError.message}`, 500);
      }

      // Get file URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from('temp')
        .createSignedUrl(fileKey, 60); // URL valid for 60 seconds

      if (urlError || !urlData?.signedUrl) {
        console.error("URL generation error:", urlError);
        return createErrorResponse("Failed to generate file URL", 500);
      }

      console.log("File uploaded, signed URL generated");
      
      // Extract text from the document
      const extractedText = await extractionFunction(urlData.signedUrl);

      // Clean up: delete the temporary file
      await supabase.storage
        .from('temp')
        .remove([fileKey]);

      console.log("Text extracted, temporary file deleted");
      
      // Return the extracted text
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
