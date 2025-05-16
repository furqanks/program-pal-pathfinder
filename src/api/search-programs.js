
// Mock API endpoint for searching programs with Perplexity API
export async function POST(request) {
  try {
    const { query, apiKey } = await request.json();

    // Validate inputs
    if (!query || !apiKey) {
      return new Response(JSON.stringify({ error: "Missing query or API key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // YOUR_PERPLEXITY_API_KEY_HERE
    // This would be replaced with an environment variable in production
    
    // Actual Perplexity API call
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that searches for academic programs. 
            When given a search query about academic programs, return EXACTLY 5 programs that match the query.
            Format your response as a JSON array of objects with these fields:
            - programName: The name of the program (e.g., "Master of Science in Data Science")
            - university: The university offering the program (e.g., "Stanford University")
            - degreeType: The type of degree (e.g., "Masters", "PhD", "Bachelors")
            - country: The country where the university is located (e.g., "USA")
            - description: A brief description of the program (2-3 sentences max)
            
            ONLY return the JSON array, no other text.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    
    // Parse the response to extract the programs
    let results = [];
    try {
      // The assistant's message will be JSON text that needs to be parsed
      const content = perplexityData.choices[0].message.content;
      // Try to find and parse JSON in the response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to parsing the entire content as JSON
        results = JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to parse Perplexity response:", error);
      // Fallback to mock data if parsing fails
      results = getMockResults(query);
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Search programs API error:", error);
    
    // Return mock data on error for demonstration purposes
    const mockResults = getMockResults(request.query);
    
    return new Response(JSON.stringify({ results: mockResults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Helper function to generate mock results for testing
function getMockResults(query) {
  const searchTerm = query.toLowerCase();
  const isMasters = searchTerm.includes('master') || searchTerm.includes('ms') || searchTerm.includes('ma');
  const isDataScience = searchTerm.includes('data') || searchTerm.includes('analytics');
  const isCanada = searchTerm.includes('canada');
  
  return [
    {
      programName: `${isMasters ? 'Master of Science' : 'Bachelor of Science'} in ${isDataScience ? 'Data Science' : 'Computer Science'}`,
      university: isCanada ? 'University of Toronto' : 'Stanford University',
      degreeType: isMasters ? 'Masters' : 'Bachelors',
      country: isCanada ? 'Canada' : 'USA',
      description: `This program focuses on ${isDataScience ? 'statistical analysis, machine learning, and big data technologies' : 'algorithms, software engineering, and computer systems'}. Students will gain hands-on experience through projects and internships.`
    },
    {
      programName: `${isMasters ? 'Master of Science' : 'Bachelor of Science'} in ${isDataScience ? 'Business Analytics' : 'Information Technology'}`,
      university: isCanada ? 'University of British Columbia' : 'MIT',
      degreeType: isMasters ? 'Masters' : 'Bachelors',
      country: isCanada ? 'Canada' : 'USA',
      description: `A comprehensive program that combines ${isDataScience ? 'business insights with data-driven decision making' : 'technical knowledge with practical applications'}. Graduates are well-prepared for careers in the technology sector.`
    },
    {
      programName: `${isMasters ? 'Master' : 'Bachelor'} of ${isDataScience ? 'Data Science' : 'Computer Engineering'}`,
      university: isCanada ? 'McGill University' : 'University of California, Berkeley',
      degreeType: isMasters ? 'Masters' : 'Bachelors',
      country: isCanada ? 'Canada' : 'USA',
      description: `Students in this program will learn ${isDataScience ? 'statistical methods and programming skills to analyze complex datasets' : 'hardware and software design principles for computing systems'}. The curriculum includes both theoretical and practical components.`
    },
    {
      programName: `${isMasters ? 'Master' : 'Bachelor'} of ${isDataScience ? 'Applied Data Analysis' : 'Software Engineering'}`,
      university: isCanada ? 'University of Waterloo' : 'Carnegie Mellon University',
      degreeType: isMasters ? 'Masters' : 'Bachelors',
      country: isCanada ? 'Canada' : 'USA',
      description: `This program emphasizes ${isDataScience ? 'practical applications of data science techniques in various domains' : 'software development methodologies and team-based project work'}. Strong industry connections provide excellent career opportunities.`
    },
    {
      programName: `${isMasters ? 'Master' : 'Bachelor'} of ${isDataScience ? 'Computational Analytics' : 'Digital Media Design'}`,
      university: isCanada ? 'University of Alberta' : 'Georgia Institute of Technology',
      degreeType: isMasters ? 'Masters' : 'Bachelors',
      country: isCanada ? 'Canada' : 'USA', 
      description: `An innovative program that ${isDataScience ? 'combines computational methods with domain-specific knowledge' : 'integrates technical skills with creative design'}. Students work on real-world projects throughout the curriculum.`
    }
  ];
}
