
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
    
    // Use the College Scorecard API with enhanced fields for comprehensive data
    const apiUrl = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${collegeScoreCardApiKey}&school.name=${encodeURIComponent(query)}&_fields=id,school.name,school.city,school.state,school.school_url,school.main_campus,school.ownership,school.locale,school.carnegie_basic,school.carnegie_undergrad,school.carnegie_size_setting,school.religious_affiliation,school.men_only,school.women_only,school.degrees_awarded.predominant,school.degrees_awarded.highest,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.admissions.act_scores.midpoint.cumulative,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.cost.avg_net_price.overall,latest.cost.attendance.academic_year,latest.student.size,latest.student.demographics.race_ethnicity.white,latest.student.demographics.race_ethnicity.black,latest.student.demographics.race_ethnicity.hispanic,latest.student.demographics.race_ethnicity.asian,latest.student.demographics.men,latest.student.demographics.women,latest.academics.program_available.certificate,latest.academics.program_available.assoc,latest.academics.program_available.bachelors,latest.academics.program_available.masters,latest.academics.program_available.doctorate,latest.academics.program_percentage.engineering,latest.academics.program_percentage.business_marketing,latest.academics.program_percentage.health,latest.academics.program_percentage.computer,latest.academics.program_percentage.education,latest.academics.program_percentage.social_science,latest.academics.program_percentage.psychology,latest.academics.program_percentage.biological,latest.academics.program_percentage.visual_performing,latest.academics.program_percentage.communications_technology,latest.earnings.10_yrs_after_entry.median,latest.repayment.3_yr_default_rate,latest.completion.completion_rate_4yr_150nt&_per_page=20`;
    
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

    // Transform the API response to include comprehensive data
    const transformedResults = apiData.results?.map((school: any) => {
      // Basic school information
      const schoolName = school['school.name'];
      const schoolCity = school['school.city'];
      const schoolState = school['school.state'];
      const schoolUrl = school['school.school_url'];
      const isMainCampus = school['school.main_campus'];
      
      // Ownership and type
      const ownership = school['school.ownership'];
      const ownershipText = ownership === 1 ? 'Public' : ownership === 2 ? 'Private nonprofit' : ownership === 3 ? 'Private for-profit' : 'Unknown';
      
      // Carnegie classifications
      const carnegieBasic = school['school.carnegie_basic'];
      const carnegieSize = school['school.carnegie_size_setting'];
      
      // Religious affiliation
      const religiousAffiliation = school['school.religious_affiliation'];
      
      // Gender restrictions
      const menOnly = school['school.men_only'];
      const womenOnly = school['school.women_only'];
      
      // Costs and financial information
      const inStateTuition = school['latest.cost.tuition.in_state'];
      const outOfStateTuition = school['latest.cost.tuition.out_of_state'];
      const avgNetPrice = school['latest.cost.avg_net_price.overall'];
      const totalAttendanceCost = school['latest.cost.attendance.academic_year'];
      
      let tuitionText = '';
      if (inStateTuition && outOfStateTuition) {
        tuitionText = `$${inStateTuition.toLocaleString()} (in-state), $${outOfStateTuition.toLocaleString()} (out-of-state)`;
      } else if (outOfStateTuition) {
        tuitionText = `$${outOfStateTuition.toLocaleString()}`;
      } else if (inStateTuition) {
        tuitionText = `$${inStateTuition.toLocaleString()}`;
      }

      // Admissions information
      const admissionRate = school['latest.admissions.admission_rate.overall'];
      const acceptanceRateText = admissionRate ? `${(admissionRate * 100).toFixed(1)}%` : undefined;
      const satScore = school['latest.admissions.sat_scores.average.overall'];
      const actScore = school['latest.admissions.act_scores.midpoint.cumulative'];
      
      // Student demographics
      const studentSize = school['latest.student.size'];
      const menPercentage = school['latest.student.demographics.men'];
      const womenPercentage = school['latest.student.demographics.women'];
      const whitePercentage = school['latest.student.demographics.race_ethnicity.white'];
      const blackPercentage = school['latest.student.demographics.race_ethnicity.black'];
      const hispanicPercentage = school['latest.student.demographics.race_ethnicity.hispanic'];
      const asianPercentage = school['latest.student.demographics.race_ethnicity.asian'];

      // Degree types available
      const degreeTypes = [];
      if (school['latest.academics.program_available.certificate']) degreeTypes.push('Certificate');
      if (school['latest.academics.program_available.assoc']) degreeTypes.push('Associate');
      if (school['latest.academics.program_available.bachelors']) degreeTypes.push('Bachelor\'s');
      if (school['latest.academics.program_available.masters']) degreeTypes.push('Master\'s');
      if (school['latest.academics.program_available.doctorate']) degreeTypes.push('Doctorate');

      // Program percentages
      const programPercentages = {
        engineering: school['latest.academics.program_percentage.engineering'],
        business: school['latest.academics.program_percentage.business_marketing'],
        health: school['latest.academics.program_percentage.health'],
        computer: school['latest.academics.program_percentage.computer'],
        education: school['latest.academics.program_percentage.education'],
        socialScience: school['latest.academics.program_percentage.social_science'],
        psychology: school['latest.academics.program_percentage.psychology'],
        biological: school['latest.academics.program_percentage.biological'],
        visualPerforming: school['latest.academics.program_percentage.visual_performing'],
        communications: school['latest.academics.program_percentage.communications_technology']
      };

      // Popular programs (>5% of students)
      const popularPrograms = [];
      if (programPercentages.engineering && programPercentages.engineering > 0.05) popularPrograms.push('Engineering');
      if (programPercentages.business && programPercentages.business > 0.05) popularPrograms.push('Business');
      if (programPercentages.health && programPercentages.health > 0.05) popularPrograms.push('Health Sciences');
      if (programPercentages.computer && programPercentages.computer > 0.05) popularPrograms.push('Computer Science');
      if (programPercentages.education && programPercentages.education > 0.05) popularPrograms.push('Education');
      if (programPercentages.socialScience && programPercentages.socialScience > 0.05) popularPrograms.push('Social Sciences');
      if (programPercentages.psychology && programPercentages.psychology > 0.05) popularPrograms.push('Psychology');
      if (programPercentages.biological && programPercentages.biological > 0.05) popularPrograms.push('Biological Sciences');
      if (programPercentages.visualPerforming && programPercentages.visualPerforming > 0.05) popularPrograms.push('Arts');
      if (programPercentages.communications && programPercentages.communications > 0.05) popularPrograms.push('Communications');

      // Outcomes
      const medianEarnings = school['latest.earnings.10_yrs_after_entry.median'];
      const defaultRate = school['latest.repayment.3_yr_default_rate'];
      const completionRate = school['latest.completion.completion_rate_4yr_150nt'];

      // Map degree type codes to readable names
      const degreeTypeMap: { [key: number]: string } = {
        1: 'Certificate programs',
        2: 'Associate degrees',
        3: 'Bachelor\'s degrees',
        4: 'Graduate degrees'
      };

      const predominantDegree = school['school.degrees_awarded.predominant'];
      const predominantDegreeText = predominantDegree ? degreeTypeMap[predominantDegree] || 'Various programs' : 'Various programs';

      return {
        name: schoolName || 'Unknown University',
        location: `${schoolCity || ''}, ${schoolState || ''}`.trim().replace(/^,|,$/, ''),
        ranking: undefined, // College Scorecard doesn't provide rankings
        tuition: tuitionText || 'Not available',
        acceptanceRate: acceptanceRateText,
        programsOffered: popularPrograms.length > 0 ? popularPrograms : [predominantDegreeText],
        description: `Student enrollment: ${studentSize ? studentSize.toLocaleString() : 'N/A'} students. ${schoolUrl ? `Website: ${schoolUrl}` : ''}`,
        
        // Extended data
        extendedData: {
          ownership: ownershipText,
          isMainCampus,
          religiousAffiliation: religiousAffiliation || null,
          menOnly: menOnly === 1,
          womenOnly: womenOnly === 1,
          costs: {
            avgNetPrice: avgNetPrice ? `$${avgNetPrice.toLocaleString()}` : null,
            totalAttendanceCost: totalAttendanceCost ? `$${totalAttendanceCost.toLocaleString()}` : null
          },
          admissions: {
            satScore: satScore ? Math.round(satScore) : null,
            actScore: actScore ? Math.round(actScore) : null
          },
          demographics: {
            menPercentage: menPercentage ? `${(menPercentage * 100).toFixed(1)}%` : null,
            womenPercentage: womenPercentage ? `${(womenPercentage * 100).toFixed(1)}%` : null,
            diversity: {
              white: whitePercentage ? `${(whitePercentage * 100).toFixed(1)}%` : null,
              black: blackPercentage ? `${(blackPercentage * 100).toFixed(1)}%` : null,
              hispanic: hispanicPercentage ? `${(hispanicPercentage * 100).toFixed(1)}%` : null,
              asian: asianPercentage ? `${(asianPercentage * 100).toFixed(1)}%` : null
            }
          },
          degreeTypes,
          programPercentages: Object.entries(programPercentages)
            .filter(([_, percentage]) => percentage && percentage > 0.01)
            .map(([program, percentage]) => ({
              program: program.charAt(0).toUpperCase() + program.slice(1),
              percentage: `${(percentage * 100).toFixed(1)}%`
            })),
          outcomes: {
            medianEarnings: medianEarnings ? `$${medianEarnings.toLocaleString()}` : null,
            defaultRate: defaultRate ? `${(defaultRate * 100).toFixed(1)}%` : null,
            completionRate: completionRate ? `${(completionRate * 100).toFixed(1)}%` : null
          }
        }
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
