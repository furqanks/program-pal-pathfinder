
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawNotes, noteTitle } = await req.json();
    
    console.log('Organizing notes:', { noteTitle, rawNotesLength: rawNotes?.length });

    if (!rawNotes || rawNotes.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No notes provided for organization' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Updated GPT prompt with recommendations and casual tone
    const organizationPrompt = `Hey there! 👋 I'm here to help you organize your university application research notes and give you some friendly advice.

You've shared some notes about your application journey, and I'll structure them in a way that's easy to read and actionable. Think of me as your study buddy who's really good at organizing stuff!

Here's what I'll do with your notes:

**Format everything in clean markdown** with tables, bullet points, and headings so it's super easy to scan.

**Organize into these sections** (only including the ones that apply to your notes):

### 🎓 Program Information

| University | Program | Degree Level | Country | Notes |
| ---------- | ------- | ------------ | ------- | ----- |

### 📋 Requirements Checklist

* **Minimum GPA:** 
* **IELTS/TOEFL:** 
* **GRE/GMAT:** 
* **Prerequisites:** 
* **Work Experience:** 
* **Application Documents:** 

### ⏰ Important Deadlines

| University | Program | Deadline Type | Date | Status |
| ---------- | ------- | ------------- | ---- | ------ |

### 💰 Scholarships & Funding

* **Scholarship Name:** 
* **Amount:** 
* **Eligibility:** 
* **Deadline:** 

### ✅ Action Items & Next Steps

* Things you should tackle this week
* Stuff to research further
* Documents to prepare
* People to contact

### 💡 My Recommendations for You

Based on what I see in your notes, here's what I think you should focus on:

* **Quick wins:** Easy tasks you can knock out soon
* **Priority actions:** The most important stuff that could make or break your applications
* **Smart moves:** Strategic suggestions based on your situation
* **Reality check:** Any potential issues I notice that you should address

### 📝 Everything Else

* Any other notes, thoughts, or random ideas that didn't fit elsewhere

**Important:** I'll only include sections that are relevant to your notes. If you didn't mention scholarships, I won't create that section. I keep things clean and focused!

Here are your raw notes to organize:

${rawNotes}`;

    console.log('Calling OpenAI API for note organization...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a friendly, helpful AI assistant who specializes in organizing university application research notes. You speak in a casual, encouraging tone like a knowledgeable friend. Always provide specific, actionable recommendations based on the user\'s notes. Use emojis sparingly but effectively. Focus on being genuinely helpful rather than overly formal.' 
          },
          { role: 'user', content: organizationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const organizedOutput = data.choices[0].message.content;

    console.log('Organization completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        organizedOutput: organizedOutput,
        message: 'Notes organized successfully!'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in organize-simple-notes function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to organize notes. Please try again.',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
