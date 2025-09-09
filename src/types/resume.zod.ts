import { z } from "zod";

export const ResumeZ = z.object({
  basics: z.object({
    fullName: z.string(),
    title: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
    location: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    start: z.string(),
    end: z.string().optional(),
    bullets: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    start: z.string(),
    end: z.string(),
    details: z.array(z.string()).optional(),
  })),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    bullets: z.array(z.string()).optional(),
    link: z.string().url().optional(),
  })).optional(),
  skills: z.array(z.object({
    category: z.string(),
    items: z.array(z.string()),
  })).optional(),
  awards: z.array(z.object({
    name: z.string(),
    by: z.string().optional(),
    year: z.string().optional(),
  })).optional(),
});

export type Resume = z.infer<typeof ResumeZ>;