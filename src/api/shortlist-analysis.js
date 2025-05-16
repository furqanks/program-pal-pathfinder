
// API endpoint for analyzing shortlisted programs with OpenAI
export async function POST(request) {
  try {
    const { programs } = await request.json();
    
    // Validate input
    if (!programs || !Array.isArray(programs) || programs.length < 3) {
      return new Response(JSON.stringify({ 
        error: "At least 3 programs are required for analysis" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // OpenAI API key
    const openAiApiKey = process.env.OPENAI_API_KEY || "";
    
    if (!openAiApiKey) {
      console.warn("OpenAI API key not found. Using mock insights.");
      return new Response(JSON.stringify({ insights: generateMockInsights(programs) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Format the program data for the AI
    const programData = programs.map(p => ({
      programName: p.programName,
      university: p.university,
      degreeType: p.degreeType,
      country: p.country,
      tuition: p.tuition,
      deadline: p.deadline,
      tasks: p.tasks ? p.tasks.length : 0,
      tasksCompleted: p.tasks ? p.tasks.filter(t => t.completed).length : 0
    }));
    
    // Create a structured prompt for the AI
    const systemPrompt = `You are an expert academic advisor for international students.
    Analyze the provided list of programs that a student is considering applying to.
    Provide specific insights and recommendations based on the data.
    
    Your analysis should include:
    1. A brief overview of the shortlist characteristics
    2. Comments on country diversity
    3. Comments on deadline clustering and timing
    4. Insights on tuition ranges if available
    5. Gaps or recommendations (e.g., missing program types, geographic regions, etc.)
    
    Format your response as a list of 5-8 specific bullet points, each containing actionable insights.`;
    
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
              content: systemPrompt
            },
            {
              role: "user",
              content: JSON.stringify(programData)
            }
          ],
          temperature: 0.5,
          max_tokens: 1000
        }),
      });
      
      if (!openAiResponse.ok) {
        throw new Error(`OpenAI API error: ${openAiResponse.status}`);
      }
      
      const data = await openAiResponse.json();
      const insights = data.choices[0].message.content
        .split("\n")
        .filter(line => line.trim().startsWith("•") || line.trim().startsWith("-"))
        .map(line => line.replace(/^[•\-]\s*/, "").trim());
      
      return new Response(JSON.stringify({ insights }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      // Fallback to mock insights if OpenAI call fails
      return new Response(JSON.stringify({ insights: generateMockInsights(programs) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Shortlist analysis API error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to analyze shortlist" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Helper function to generate mock insights based on actual program data
function generateMockInsights(programs) {
  const countries = [...new Set(programs.map(p => p.country))];
  const deadlines = programs.filter(p => p.deadline).map(p => new Date(p.deadline));
  
  const insights = [];
  
  // Country diversity
  if (countries.length === 1) {
    insights.push(`All your programs are in ${countries[0]}. Consider diversifying your applications across different countries for better odds.`);
  } else {
    insights.push(`You have a good mix of programs across ${countries.length} countries (${countries.join(", ")}). This gives you geographical flexibility.`);
  }
  
  // Deadline clustering
  if (deadlines.length > 0) {
    deadlines.sort((a, b) => a.getTime() - b.getTime());
    const earliestDeadline = deadlines[0];
    const latestDeadline = deadlines[deadlines.length - 1];
    
    const timeSpan = Math.ceil((latestDeadline.getTime() - earliestDeadline.getTime()) / (1000 * 60 * 60 * 24));
    
    if (timeSpan < 30 && deadlines.length > 1) {
      insights.push(`You have ${deadlines.length} deadlines within a ${timeSpan} day period. Prepare your application materials well in advance to avoid last-minute stress.`);
    } else if (deadlines.length > 1) {
      insights.push(`Your application deadlines are spread across ${timeSpan} days, giving you good time to prepare materials sequentially.`);
    }
  } else {
    insights.push("Consider adding application deadlines to better plan your application timeline.");
  }
  
  // Tuition analysis
  const tuitionsWithValues = programs.filter(p => p.tuition && p.tuition.trim() !== '');
  if (tuitionsWithValues.length > 0) {
    if (tuitionsWithValues.length === programs.length) {
      insights.push("You have entered tuition information for all programs, which is excellent for financial planning.");
    } else {
      insights.push(`You have tuition information for ${tuitionsWithValues.length} out of ${programs.length} programs. Complete this information to better plan finances.`);
    }
  } else {
    insights.push("Add tuition information to your programs to get insights on financial planning.");
  }
  
  // Program type balance
  const degreeTypes = [...new Set(programs.map(p => p.degreeType))];
  if (degreeTypes.length > 1) {
    insights.push(`You're considering multiple degree types: ${degreeTypes.join(", ")}. Ensure your application strategy aligns with the different requirements for each.`);
  }
  
  // Task completion status
  const tasksTotal = programs.reduce((sum, program) => sum + program.tasks.length, 0);
  const tasksCompleted = programs.reduce((sum, program) => sum + program.tasks.filter(t => t.completed).length, 0);
  
  if (tasksTotal > 0) {
    const completionPercentage = Math.round((tasksCompleted / tasksTotal) * 100);
    insights.push(`You have completed ${completionPercentage}% of your application tasks (${tasksCompleted}/${tasksTotal}). ${completionPercentage < 50 ? "Keep up the momentum!" : "Great progress!"}`);
  } else {
    insights.push("Start adding tasks to your programs to track your application progress.");
  }
  
  // Extra recommendation
  insights.push(`Based on your current shortlist, consider exploring programs in ${countries.includes("USA") ? "Europe" : "USA"} to diversify your options.`);
  
  return insights;
}
