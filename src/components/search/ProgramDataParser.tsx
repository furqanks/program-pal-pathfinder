
interface ParsedProgram {
  number?: string;
  title: string;
  university?: string;
  location?: string;
  degreeLevel?: string;
  duration?: string;
  tuitionFees?: string;
  applicationDeadline?: string;
  entryRequirements?: string;
  programHighlights?: string;
  url?: string;
}

export const parseProgramsFromContent = (content: string): ParsedProgram[] => {
  if (!content) return [];

  const programs: ParsedProgram[] = [];
  
  // Split content by common program separators
  const sections = content.split(/(?=\s*#\s*\d+\.|\s*\d+\.\s+)/g).filter(section => section.trim().length > 0);
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    
    // Skip if this doesn't look like a program entry
    if (!trimmedSection.match(/^#?\s*\d+\./)) continue;
    
    const program: ParsedProgram = {
      title: '',
      university: '',
      location: '',
      degreeLevel: '',
      duration: '',
      tuitionFees: '',
      applicationDeadline: '',
      entryRequirements: '',
      programHighlights: ''
    };

    // Extract program number and title
    const titleMatch = trimmedSection.match(/^#?\s*(\d+)\.\s*([^-\n]+?)(?:\s*-\s*([^-\n]+?))?(?:\s*-|\n|$)/);
    if (titleMatch) {
      program.number = titleMatch[1];
      program.title = titleMatch[2].trim();
      if (titleMatch[3]) {
        program.university = titleMatch[3].trim();
      }
    }

    // Extract structured data
    const lines = trimmedSection.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('university:')) {
        program.university = trimmedLine.replace(/.*university:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('location:')) {
        program.location = trimmedLine.replace(/.*location:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('degree level:')) {
        program.degreeLevel = trimmedLine.replace(/.*degree level:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('duration:')) {
        program.duration = trimmedLine.replace(/.*duration:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('tuition fees:')) {
        program.tuitionFees = trimmedLine.replace(/.*tuition fees:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('application deadline:')) {
        program.applicationDeadline = trimmedLine.replace(/.*application deadline:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('entry requirements:')) {
        program.entryRequirements = trimmedLine.replace(/.*entry requirements:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().includes('program highlights:')) {
        program.programHighlights = trimmedLine.replace(/.*program highlights:\s*/i, '').trim();
      }
    }

    // Extract URLs
    const urlMatch = trimmedSection.match(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/);
    if (urlMatch) {
      program.url = urlMatch[2];
    }

    // Only add if we have a meaningful title
    if (program.title && program.title.length > 5) {
      programs.push(program);
    }
  }

  return programs;
};
