
// Mock API endpoint for reviewing documents with OpenAI
export async function POST(request) {
  try {
    const { documentType, content, programId } = await request.json();
    
    // Validate inputs
    if (!documentType || !content) {
      return new Response(JSON.stringify({ error: "Missing document type or content" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // OpenAI API key
    const openAiApiKey = process.env.OPENAI_API_KEY || "";
    
    if (!openAiApiKey) {
      console.warn("OpenAI API key not found. Using mock data.");
      return generateMockResponse(documentType, content);
    }
    
    // Define the prompt based on document type
    const systemPrompt = getSystemPromptForDocumentType(documentType);
    
    try {
      // Call OpenAI API
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: content,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      
      if (!openAiResponse.ok) {
        throw new Error(`OpenAI API error: ${openAiResponse.status}`);
      }
      
      const data = await openAiResponse.json();
      
      return new Response(
        JSON.stringify({
          feedback: data.choices[0].message.content,
          score: extractScoreFromContent(data.choices[0].message.content),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      return generateMockResponse(documentType, content);
    }
  } catch (error) {
    console.error("Review document API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process document review",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Helper function to get system prompt based on document type
function getSystemPromptForDocumentType(documentType) {
  switch (documentType) {
    case "SOP":
      return `You're an expert admissions advisor evaluating a Statement of Purpose. 
        Provide constructive feedback that will help the student improve their SOP. 
        Focus on clarity, coherence, personal story, fit with the program, and overall persuasiveness.
        
        Analyze the following Statement of Purpose and provide:
        1. A summary paragraph evaluating the overall quality (100-150 words)
        2. 4-5 specific improvement suggestions as bullet points
        3. A score out of 10`;
    case "CV":
      return `You're an expert in academic CV evaluation. 
        Provide constructive feedback that will help improve this CV for academic program applications.
        Focus on formatting, content organization, highlighting of relevant achievements, and overall presentation.
        
        Analyze the following CV and provide:
        1. A summary paragraph evaluating the overall quality (100-150 words)
        2. 4-5 specific improvement suggestions as bullet points
        3. A score out of 10`;
    case "Essay":
      return `You're an expert in academic writing evaluation.
        Provide constructive feedback that will help improve this essay for academic program applications.
        Focus on argument structure, evidence use, writing style, and overall persuasiveness.
        
        Analyze the following essay and provide:
        1. A summary paragraph evaluating the overall quality (100-150 words)
        2. 4-5 specific improvement suggestions as bullet points
        3. A score out of 10`;
    default:
      return `Evaluate this academic document and provide helpful feedback for improvement.`;
  }
}

// Helper function to generate a mock response
function generateMockResponse(documentType, content) {
  const documentTypes = {
    "SOP": "Statement of Purpose",
    "CV": "CV/Resume",
    "Essay": "Academic Essay"
  };
  
  const mockFeedback = `Your ${documentTypes[documentType]} demonstrates a solid understanding of academic writing conventions and presents your qualifications effectively. The structure is logical, and your key achievements are highlighted. However, there are opportunities to strengthen your narrative and make your document more compelling for admissions committees. Consider the specific suggestions below to elevate your application materials.

  Improvement suggestions:
  • Add more specific examples to illustrate your skills and experiences
  • Connect your past experiences more explicitly to your future goals
  • Tailor your content more specifically to the target program
  • Review for clarity and conciseness, particularly in the introduction
  • Consider strengthening your conclusion with a more memorable final statement`;
  
  const mockScore = Math.floor(Math.random() * 3) + 7; // Random score between 7-9
  
  return new Response(
    JSON.stringify({
      feedback: mockFeedback,
      score: mockScore,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Helper function to extract score from GPT response
function extractScoreFromContent(content) {
  // Find patterns like "Score: 8/10" or "I would rate this as a 7 out of 10"
  const scoreRegex = /(\b[0-9]|10\b)[ ]*(\/|out of)[ ]*10/i;
  const match = content.match(scoreRegex);
  
  if (match) {
    const score = parseInt(match[1], 10);
    return score;
  }
  
  // Default score if no match found
  return Math.floor(Math.random() * 3) + 7; // Random score between 7-9
}
