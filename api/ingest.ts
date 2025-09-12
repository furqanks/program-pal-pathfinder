import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { Resume } from '../src/types/resume';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

function setCorsHeaders(res: NextApiResponse, origin: string) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

function parseTextToResume(text: string): { resume: Resume; confidence: number } {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let confidence = 0;
  let currentSection = 'basics';
  const sections: any = {
    basics: { fullName: '', title: '', email: '', phone: '', location: '', links: [] },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    awards: []
  };

  // Find name (usually first meaningful line)
  const nameMatch = lines.find(line => 
    line.length > 3 && 
    line.length < 50 && 
    !line.includes('@') && 
    !line.includes('http') &&
    !/\d{4}/.test(line)
  );
  if (nameMatch) {
    sections.basics.fullName = nameMatch;
    confidence += 0.2;
  }

  // Find email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    sections.basics.email = emailMatch[0];
    confidence += 0.1;
  }

  // Find phone
  const phoneMatch = text.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
  if (phoneMatch) {
    sections.basics.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
    confidence += 0.1;
  }

  let currentExperience: any = null;
  let currentEducation: any = null;
  let currentProject: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Section headers
    if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work history')) {
      currentSection = 'experience';
      confidence += 0.15;
      continue;
    }
    if (lowerLine.includes('education') || lowerLine.includes('academic')) {
      currentSection = 'education';
      confidence += 0.15;
      continue;
    }
    if (lowerLine.includes('project') || lowerLine.includes('portfolio')) {
      currentSection = 'projects';
      confidence += 0.1;
      continue;
    }
    if (lowerLine.includes('skill') || lowerLine.includes('technical') || lowerLine.includes('competenc')) {
      currentSection = 'skills';
      confidence += 0.1;
      continue;
    }
    if (lowerLine.includes('award') || lowerLine.includes('achievement') || lowerLine.includes('honor')) {
      currentSection = 'awards';
      confidence += 0.1;
      continue;
    }
    if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
      currentSection = 'summary';
      confidence += 0.1;
      continue;
    }

    // Parse content based on current section
    if (currentSection === 'experience') {
      // Look for company/role patterns
      if (line.length > 3 && !line.startsWith('•') && !line.startsWith('-')) {
        if (currentExperience && currentExperience.company) {
          sections.experience.push(currentExperience);
        }
        currentExperience = {
          company: line.split('|')[0].trim(),
          role: line.includes('|') ? line.split('|')[1].trim() : '',
          start: '',
          end: '',
          bullets: []
        };
        
        // Look for dates in next few lines
        const dateMatch = text.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
        if (dateMatch) {
          currentExperience.start = dateMatch[1];
          currentExperience.end = dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current' ? undefined : dateMatch[2];
        }
      } else if (currentExperience && (line.startsWith('•') || line.startsWith('-'))) {
        currentExperience.bullets.push(line.replace(/^[•\-]\s*/, ''));
      }
    }
    
    if (currentSection === 'education') {
      if (line.length > 3 && !line.startsWith('•') && !line.startsWith('-')) {
        if (currentEducation && currentEducation.institution) {
          sections.education.push(currentEducation);
        }
        currentEducation = {
          institution: line.split('|')[0].trim(),
          degree: line.includes('|') ? line.split('|')[1].trim() : '',
          start: '',
          end: '',
          details: []
        };
        
        const dateMatch = text.match(/(\d{4})\s*[-–]\s*(\d{4})/);
        if (dateMatch) {
          currentEducation.start = dateMatch[1];
          currentEducation.end = dateMatch[2];
        }
      } else if (currentEducation && (line.startsWith('•') || line.startsWith('-'))) {
        currentEducation.details.push(line.replace(/^[•\-]\s*/, ''));
      }
    }

    if (currentSection === 'summary' && line.length > 10) {
      sections.summary += (sections.summary ? ' ' : '') + line;
    }
  }

  // Add last items
  if (currentExperience && currentExperience.company) {
    sections.experience.push(currentExperience);
  }
  if (currentEducation && currentEducation.institution) {
    sections.education.push(currentEducation);
  }

  return {
    resume: sections as Resume,
    confidence: Math.min(confidence, 1)
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '';
  
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCorsHeaders(res, origin);

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  try {
    const bb = busboy({ headers: req.headers });
    let fileBuffer: Buffer | null = null;
    let fileName = '';

    bb.on('file', (fieldname, file, info) => {
      fileName = info.filename;
      const chunks: Buffer[] = [];
      
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on('finish', async () => {
      if (!fileBuffer) {
        return res.status(400).json({ error: 'No file provided' });
      }

      let text = '';
      
      try {
        if (fileName.toLowerCase().endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          text = result.value;
        } else if (fileName.toLowerCase().endsWith('.pdf')) {
          const pdfData = await pdfParse(fileBuffer);
          text = pdfData.text;
        } else {
          return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' });
        }

        const result = parseTextToResume(text);
        res.json(result);
      } catch (error) {
        console.error('Error parsing document:', error);
        res.status(500).json({ error: 'Failed to parse document' });
      }
    });

    req.pipe(bb);
  } catch (error) {
    console.error('Error in ingest API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};