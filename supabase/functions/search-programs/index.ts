
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // Utility: timeout wrapper for fetch
  const fetchWithTimeout = async (
    input: string | URL | Request,
    init: RequestInit & { timeoutMs?: number } = {},
  ) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), init.timeoutMs ?? 15000);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  };

  // Utility: determine if a URL hostname looks like an official university domain
  const isOfficialUniversityDomain = (hostname: string) => {
    const blocked = [
      'mastersportal', 'topuniversities', 'keystone', 'studyportals', 'coursera', 'udemy', 'edx',
      'shiksha', 'leverageedu', 'collegedunia', 'usnews', 'timeshighereducation', 'hotcourses',
      'thecompleteuniversityguide', 'findamasters', 'indeed', 'linkedin', 'facebook', 'x.com'
    ];
    if (blocked.some(b => hostname.includes(b))) return false;

    // Common official patterns (.edu, .ac.*, country specific academic SLDs)
    const patterns = [
      /\.edu(\.|$)/i,
      /\.ac\./i,
      /\.edu\.[a-z]{2,3}$/i,
      /\.ac\.[a-z]{2,3}$/i,
      /\.ox\.ac\.uk$/i,
      /\.cam\.ac\.uk$/i,
      /\.unimelb\.edu\.au$/i,
    ];
    return patterns.some((re) => re.test(hostname));
  };

  // Validate a URL by making a HTTP request
  const validateUrl = async (url: string) => {
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) return { ok: false, reason: 'invalid-protocol' };

      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': UA,
        },
        redirect: 'follow',
        timeoutMs: 12000,
      });

      const contentType = res.headers.get('content-type') || '';
      const finalUrl = res.url || url;
      const ok = res.status < 400 && contentType.includes('text/html');
      return { ok, status: res.status, contentType, finalUrl };
    } catch (e) {
      return { ok: false, reason: (e as Error).message?.slice(0, 120) || 'fetch-failed' };
    }
  };

  // Ask Perplexity to repair a broken/missing URL for a specific program
  const repairUrlWithPerplexity = async (
    apiKey: string,
    program: { programName: string; university: string; country?: string; degreeType?: string }
  ): Promise<string | null> => {
    try {
      const prompt = `You are fixing a single program URL. Return ONLY JSON with a single field "url" containing the EXACT program page URL on the official university site.
Strict rules:
- The link must be the program's specific page (not the homepage, department hub, or PDF unless it's the only official page).
- It must be on the institution's official domain (e.g., *.edu, *.ac.*, or the university's primary domain).
- Do not provide third-party aggregator or ranking sites.
- If multiple intakes exist, choose the main program page.

Program:
Name: ${program.programName}
University: ${program.university}
Country: ${program.country ?? ''}
Degree Type: ${program.degreeType ?? ''}

Output format strictly:
{"url": "https://..."}`

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'You return only JSON. No commentary.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 400,
          temperature: 0.1,
          top_p: 0.9,
          return_citations: false,
          search_recency_filter: 'month',
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const text = (data?.choices && data.choices[0]?.message?.content) || data?.output_text || '';
      if (!text) return null;

      // Extract JSON from possible fences
      const cleaned = text
        .replace(/```json/gi, '```')
        .replace(/```/g, '')
        .trim();
      try {
        const obj = JSON.parse(cleaned);
        const candidate = typeof obj?.url === 'string' ? obj.url : null;
        if (candidate) {
          const u = new URL(candidate);
          return `${u.protocol}//${u.host}${u.pathname}${u.search}`;
        }
      } catch (_) {
        // Try to pull first https URL if parsing fails
        const match = cleaned.match(/https?:\/\/[^\s"'<>)]+/);
        if (match) return match[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  // Robust JSON extraction from Perplexity output (handles code fences / partials)
  const extractProgramsJson = (content: string): any[] => {
    const cleaned = content
      .replace(/```json/gi, '```')
      .replace(/```/g, '')
      .trim();

    const tryParses: Array<() => any> = [
      () => JSON.parse(cleaned),
      () => {
        // Find array in object e.g., {"programs": [...]}
        const arrMatch = cleaned.match(/\"programs\"\s*:\s*(\[.*\])/s) || cleaned.match(/\"results\"\s*:\s*(\[.*\])/s);
        if (arrMatch) return JSON.parse(arrMatch[1]);
        throw new Error('no-array');
      },
      () => {
        // Extract first top-level array
        const start = cleaned.indexOf('[');
        const end = cleaned.lastIndexOf(']');
        if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
        throw new Error('no-top-array');
      },
    ];

    for (const fn of tryParses) {
      try {
        const out = fn();
        if (Array.isArray(out)) return out;
      } catch {}
    }
    return [];
  };

  // Extract facts from validated program HTML pages
  const extractFactsFromHtml = async (url: string) => {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': UA,
        },
        redirect: 'follow',
        timeoutMs: 12000,
      });
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const grabNear = (labelPatterns: RegExp[], maxLen = 280) => {
        for (const re of labelPatterns) {
          const m = text.match(re);
          if (m && m.index !== undefined) {
            const start = Math.max(0, m.index);
            const snippet = text.slice(start, start + maxLen);
            return snippet.trim();
          }
        }
        return '';
      };

      const tuition = grabNear([
        /tuition[^\w]{0,10}fee[^\w]{0,5}/i,
        /tuition[^\w]{0,10}cost/i,
        /fees?[^\w]{0,10}(international|tuition)/i,
      ]);

      const deadlines = grabNear([
        /(application|apply|deadline|closing)[^\w]{0,10}(date|deadline)/i,
        /(key|important)[^\w]{0,10}(dates|deadlines)/i,
      ]);

      const requirements = grabNear([
        /(entry|admission|eligibility)[^\w]{0,12}(requirements|criteria)/i,
        /(academic|english|language)[^\w]{0,10}(requirements)/i,
      ], 420);

      const duration = grabNear([
        /(duration|length)[^\w]{0,10}(program|course)?/i,
        /(years?|months?)[^\w]{0,5}(full[-\s]?time|part[-\s]?time)?/i,
      ], 180);

      const cleanLine = (s: string) => s.replace(/\s{2,}/g, ' ').trim();

      return {
        tuition: cleanLine(tuition).slice(0, 300),
        deadlines: cleanLine(deadlines).slice(0, 300),
        requirements: cleanLine(requirements).slice(0, 500),
        duration: cleanLine(duration).slice(0, 200),
      };
    } catch {
      return { tuition: '', deadlines: '', requirements: '', duration: '' };
    }
  };

  // Generate a strict JSON prompt for Perplexity
  const buildJsonPrompt = (query: string, resultCount: number) => {
    return `You are a university program search assistant.
    Return ONLY JSON. No markdown, no commentary. Format: an array of program objects.
    Each program MUST be a real program with the exact official program page URL.

    CRITICAL RULES:
    - Use only official university domains (*.edu, *.ac.*, or the institution's primary domain).
    - Link directly to the program page.
    - Avoid third-party sites (mastersportal, keystone, coursera, edx, usnews, rankings, etc.).
    - Prefer diverse institutions. Aim for at least ${resultCount} distinct programs.

    Each program object fields:
    - programName: string
    - university: string
    - degreeType: string
    - country: string
    - duration: string
    - tuition: string
    - deadlines: string
    - requirements: string
    - url: string (MUST be the program's exact official page)

    Query: ${query}`;
  };

  // Build cleaned markdown report from validated programs
  const buildCleanedReport = (programs: any[], query: string) => {
    const lines: string[] = [];
    lines.push(`# University Program Search Report`);
    lines.push('');
    lines.push(`Query: ${query}`);
    lines.push('');
    programs.forEach((p) => {
      lines.push(`## ${p.programName} — ${p.university}`);
      lines.push(`- Degree: ${p.degreeType || 'N/A'}`);
      lines.push(`- Location: ${p.country || 'N/A'}`);
      lines.push(`- Duration: ${p.duration || 'N/A'}${p.sources?.duration === 'html' ? ' (from source)' : ''}`);
      lines.push(`- Tuition: ${p.tuition || 'N/A'}${p.sources?.tuition === 'html' ? ' (from source)' : ''}`);
      lines.push(`- Deadlines: ${p.deadlines || 'N/A'}${p.sources?.deadlines === 'html' ? ' (from source)' : ''}`);
      lines.push(`- Requirements: ${p.requirements || 'N/A'}${p.sources?.requirements === 'html' ? ' (from source)' : ''}`);
      lines.push(`- Program Page: ${p.urlValidated ? `[Verified Link](${p.finalUrl || p.url})` : (p.finalUrl || p.url ? `[Unverified Link](${p.finalUrl || p.url})` : 'Unavailable')}`);
      const flags: string[] = [];
      if (!p.isOfficialDomain) flags.push('Non-official domain');
      if (p.urlStatus && p.urlStatus >= 400) flags.push(`HTTP ${p.urlStatus}`);
      if (flags.length) lines.push(`- Validation Notes: ${flags.join('; ')}`);
      lines.push('');
    });
    const sources = programs
      .map((p) => p.finalUrl || p.url)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i);
    lines.push('### Sources');
    if (sources.length) {
      sources.forEach((s) => lines.push(`- ${s}`));
    } else {
      lines.push('- No verified sources available.');
    }
    lines.push('');
    lines.push(`> Disclaimer: Links and details were auto-validated where possible. Always verify on the university's official site.`);
    return lines.join('\n');
  };

  try {
    const { query, resultCount = 10 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const prompt = buildJsonPrompt(query, resultCount);
    console.log('Sending structured JSON query to Perplexity:', query);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              'You return only strict JSON arrays with program objects. Use ONLY official program URLs.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.1,
        top_p: 0.9,
        return_citations: true,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Perplexity API error - Status:',
        response.status,
        'Response:',
        errorText,
      );

      let errorDetails = 'Unknown API error';
      try {
        const errorData = JSON.parse(errorText);
        errorDetails = errorData.error?.message || errorText;
      } catch {
        errorDetails = errorText;
      }

      return new Response(
        JSON.stringify({
          error: `Perplexity API Error (${response.status}): ${errorDetails}`,
          statusCode: response.status,
          details: errorText,
        }),
        {
          status: response.status >= 500 ? 500 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json();
    console.log('Perplexity response received, keys:', Object.keys(data || {}));

    const content = (data?.choices && data.choices[0]?.message?.content)
      || data?.output_text
      || '';

    if (!content || typeof content !== 'string') {
      console.error('Invalid response structure from API', data);
      return new Response(
        JSON.stringify({
          error: 'Invalid response structure from API',
          receivedKeys: Object.keys(data || {}),
          sample: JSON.stringify(data).slice(0, 500),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Extract array of programs
    let programs = extractProgramsJson(content) as any[];
    if (!Array.isArray(programs) || programs.length === 0) {
      console.warn('No programs parsed from Perplexity output.');
      programs = [];
    }

    // Trim to requested count at most, but keep more if model returns more
    if (programs.length > resultCount + 5) programs = programs.slice(0, resultCount + 5);

    // Validate and repair URLs sequentially to avoid overloading remote sites
    const validated: any[] = [];
    for (const p of programs) {
      const programName = (p.programName || p.name || '').toString().trim();
      const university = (p.university || p.institution || '').toString().trim();
      const degreeType = (p.degreeType || p.degree || '').toString().trim();
      const country = (p.country || p.location || '').toString().trim();
      let duration = (p.duration || '').toString().trim();
      let tuition = (p.tuition || p.fees || '').toString().trim();
      let deadlines = (p.deadlines || p.applicationDeadlines || p.deadline || '').toString().trim();
      let requirements = (p.requirements || p.entryRequirements || '').toString().trim();
      let url = (p.url || p.website || '').toString().trim();

      let urlValidated = false;
      let urlStatus: number | undefined = undefined;
      let finalUrl: string | undefined = undefined;
      let isOfficialDomain = false;

      if (url && /^https?:\/\//i.test(url)) {
        try {
          const host = new URL(url).hostname;
          isOfficialDomain = isOfficialUniversityDomain(host);
        } catch {}
        const v = await validateUrl(url);
        urlValidated = v.ok;
        urlStatus = (v as any).status;
        finalUrl = (v as any).finalUrl || url;
      }

      // Attempt repair when not validated or non-official
      if ((!urlValidated || !isOfficialDomain) && perplexityApiKey) {
        const repaired = await repairUrlWithPerplexity(perplexityApiKey, {
          programName,
          university,
          country,
          degreeType,
        });
        if (repaired) {
          try {
            const host = new URL(repaired).hostname;
            isOfficialDomain = isOfficialUniversityDomain(host);
          } catch {}
          const v2 = await validateUrl(repaired);
          if (v2.ok) {
            urlValidated = true;
            urlStatus = (v2 as any).status;
            finalUrl = (v2 as any).finalUrl || repaired;
            url = repaired;
          }
        }
      }

      // Extract facts directly from the validated official page
      let tuitionSource: 'model' | 'html' = 'model';
      let deadlinesSource: 'model' | 'html' = 'model';
      let requirementsSource: 'model' | 'html' = 'model';
      let durationSource: 'model' | 'html' = 'model';

      if (urlValidated && isOfficialDomain && (finalUrl || url)) {
        try {
          const facts = await extractFactsFromHtml(finalUrl || url);
          if (facts.tuition) { tuition = facts.tuition; tuitionSource = 'html'; }
          if (facts.deadlines) { deadlines = facts.deadlines; deadlinesSource = 'html'; }
          if (facts.requirements) { requirements = facts.requirements; requirementsSource = 'html'; }
          if (facts.duration) { duration = facts.duration; durationSource = 'html'; }
        } catch (_) {
          // ignore extraction failure, keep model fields
        }
      }

      validated.push({
        programName,
        university,
        degreeType,
        country,
        duration,
        tuition,
        deadlines,
        requirements,
        url,
        finalUrl,
        isOfficialDomain,
        urlValidated,
        urlStatus,
        sources: {
          tuition: tuitionSource,
          deadlines: deadlinesSource,
          requirements: requirementsSource,
          duration: durationSource,
        },
      });

      if (validated.length >= resultCount) break;
    }

    // Build cleaned markdown reports for the UI
    const cleanedMarkdown = buildCleanedReport(validated, query);
    const verifiedOnly = validated.filter((p) => p.urlValidated && p.isOfficialDomain);
    const cleanedVerifiedMarkdown = buildCleanedReport(verifiedOnly, `${query} (Verified links only)`);

    // Compose response
    return new Response(
      JSON.stringify({
        searchResults: validated,
        citations: data.citations || [],
        rawContent: cleanedMarkdown,
        rawContentVerifiedOnly: cleanedVerifiedMarkdown,
        original: { modelOutput: content },
        searchMetadata: {
          query,
          resultCount: validated.length,
          verifiedCount: verifiedOnly.length,
          requestedCount: resultCount,
          model: data.model || 'sonar-pro',
          hasStructuredData: true,
          reportFormat: true,
          disclaimer:
            'Links validated best-effort. Always verify tuition, deadlines, and requirements on the official page.',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Search programs error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
})
