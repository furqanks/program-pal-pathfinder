import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, mimeType, fileName } = await req.json();
    
    if (!image) {
      throw new Error('No image data provided');
    }

    console.log(`Processing OCR for ${fileName || 'image'}`);

    // Use OpenAI Vision API for OCR
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text content from this image. Return only the extracted text without any additional commentary or formatting. If the image contains a document, preserve the structure and formatting as much as possible.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Vision API error:', errorText);
      throw new Error(`OpenAI Vision API error: ${errorText}`);
    }

    const result = await response.json();
    const extractedText = result.choices[0]?.message?.content;

    if (!extractedText || extractedText.trim().length === 0) {
      console.log('No text found in image');
      return new Response(
        JSON.stringify({ text: '', message: 'No text found in the image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OCR extraction successful, extracted text length:', extractedText.length);

    return new Response(
      JSON.stringify({ text: extractedText.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OCR extraction error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});