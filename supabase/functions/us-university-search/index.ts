
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
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const collegeScoreCardApiKey = Deno.env.get('COLLEGE_SCORECARD_API_KEY');
    
    if (!collegeScoreCardApiKey) {
      console.error('College Scorecard API key not found');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching US universities with query:', query);
    
    // Use the College Scorecard API with proper authentication
    // Search by school name with enhanced fields for better data
    const apiUrl = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${collegeScoreCardApiKey}&school.name=${encodeURIComponent(query)}&_fields=id,school.name,school.city,school.state,school.school_url,latest.admissions.admission_rate.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.academics.program_available,school.degrees_awarded.predominant,latest.student.size,school.carnegie_basic,latest.academics.program_percentage.engineering,latest.academics.program_percentage.business_marketing,latest.academics.program_percentage.health&_per_page=20`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('College Scorecard API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from College Scorecard API' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiData = await response.json();
    console.log('College Scorecard API response:', apiData);

    // Transform the API response to match our expected format
    const transformedResults = apiData.results?.map((school: any) => {
      // Access fields using the dot notation keys as they appear in the API response
      const inStateTuition = school['latest.cost.tuition.in_state'];
      const outOfStateTuition = school['latest.cost.tuition.out_of_state'];
      
      let tuitionText = '';
      if (inStateTuition && outOfStateTuition) {
        tuitionText = `$${inStateTuition.toLocaleString()} (in-state), $${outOfStateTuition.toLocaleString()} (out-of-state)`;
      } else if (outOfStateTuition) {
        tuitionText = `$${outOfStateTuition.toLocaleString()}`;
      } else if (inStateTuition) {
        tuitionText = `$${inStateTuition.toLocaleString()}`;
      }

      const admissionRate = school['latest.admissions.admission_rate.overall'];
      const acceptanceRateText = admissionRate ? `${(admissionRate * 100).toFixed(1)}%` : undefined;

      // Map degree type codes to readable names
      const degreeTypeMap: { [key: number]: string } = {
        1: 'Certificate programs',
        2: 'Associate degrees',
        3: 'Bachelor\'s degrees',
        4: 'Graduate degrees'
      };

      const predominantDegree = school['school.degrees_awarded.predominant'];
      const degreeType = predominantDegree ? degreeTypeMap[predominantDegree] || 'Various programs' : 'Various programs';

      // Add more program information if available
      const programs = [degreeType];
      const engineeringPercentage = school['latest.academics.program_percentage.engineering'];
      const businessPercentage = school['latest.academics.program_percentage.business_marketing'];
      const healthPercentage = school['latest.academics.program_percentage.health'];
      
      if (engineeringPercentage && engineeringPercentage > 0.1) {
        programs.push('Engineering');
      }
      if (businessPercentage && businessPercentage > 0.1) {
        programs.push('Business');
      }
      if (healthPercentage && healthPercentage > 0.1) {
        programs.push('Health Sciences');
      }

      const studentSize = school['latest.student.size'];
      const schoolUrl = school['school.school_url'];
      const schoolName = school['school.name'];
      const schoolCity = school['school.city'];
      const schoolState = school['school.state'];

      return {
        name: schoolName || 'Unknown University',
        location: `${schoolCity || ''}, ${schoolState || ''}`.trim().replace(/^,|,$/, ''),
        ranking: undefined, // College Scorecard doesn't provide rankings
        tuition: tuitionText || 'Not available',
        acceptanceRate: acceptanceRateText,
        programsOffered: programs,
        description: `Student enrollment: ${studentSize ? studentSize.toLocaleString() : 'N/A'} students. ${schoolUrl ? `Website: ${schoolUrl}` : ''}`,
      };
    }) || [];

    console.log(`Found ${transformedResults.length} results for query: ${query}`);

    return new Response(
      JSON.stringify({ results: transformedResults }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in us-university-search function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search universities' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
