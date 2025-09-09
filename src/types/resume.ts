export interface Resume {
  basics: {
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    links?: { label: string; url: string }[];
    location?: string;
  };
  summary?: string;
  experience: { company: string; role: string; start: string; end?: string; bullets: string[] }[];
  education: { institution: string; degree: string; start: string; end: string; details?: string[] }[];
  projects?: { name: string; description?: string; bullets?: string[]; link?: string }[];
  skills?: { category: string; items: string[] }[];
  awards?: { name: string; by?: string; year?: string }[];
}

export interface ResumeParseResult {
  resume: Resume;
  confidence: number;
}