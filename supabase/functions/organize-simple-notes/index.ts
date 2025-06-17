
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

    // The exact GPT prompt as specified
    const organizationPrompt = `You are an AI assistant helping students organize their application research notes.

The user provides you with unstructured notes related to university applications, programs, deadlines, requirements, and personal preferences.

Your task is to structure the information into clear, organized sections.

Format your output in markdown using tables, bullet lists, and headings where appropriate.

Extract and organize data into the following sections if available:

### Program Information

| University | Program | Degree Level | Country | Notes |
| ---------- | ------- | ------------ | ------- | ----- |

### Requirements

* Minimum GPA:
* IELTS/TOEFL:
* GRE/GMAT:
* Prerequisites:
* Work Experience:
* Application Documents:

### Deadlines

| University | Program | Deadline Type | Date |
| ---------- | ------- | ------------- | ---- |

### Scholarships / Funding

* Scholarship Name:
* Amount:
* Eligibility:
* Deadline:

### Tasks & Next Steps

* To-do items, actions, or decisions extracted from the notes.

### Additional Notes

* Any remaining notes or comments not covered above.

If any section is not applicable, simply omit it.
Use clean, professional formatting.
Do not explain your output — just present the structured information.

Here are the raw notes to organize:

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
            content: 'You are an expert at organizing university application research notes. Follow the user instructions exactly and output clean markdown.' 
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
