import { NextApiRequest, NextApiResponse } from 'next';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import { ResumeZ, Resume } from '../src/types/resume.zod';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

function setCorsHeaders(res: NextApiResponse, origin: string) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

function createDocxFromResume(resume: Resume): Document {
  const children: any[] = [];

  // Header with name and contact info
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resume.basics.fullName,
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    })
  );

  if (resume.basics.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.basics.title,
            italics: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      })
    );
  }

  // Contact info
  const contactInfo = [];
  if (resume.basics.email) contactInfo.push(resume.basics.email);
  if (resume.basics.phone) contactInfo.push(resume.basics.phone);
  if (resume.basics.location) contactInfo.push(resume.basics.location);
  
  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(' • '),
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  // Links
  if (resume.basics.links && resume.basics.links.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.basics.links.map(link => `${link.label}: ${link.url}`).join(' • '),
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  // Summary
  if (resume.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SUMMARY',
            bold: true,
            size: 24,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.summary,
            size: 22,
          }),
        ],
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXPERIENCE',
            bold: true,
            size: 24,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    resume.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: `\t\t${exp.start} - ${exp.end || 'Present'}`,
              size: 20,
            }),
          ],
          spacing: { after: 60 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.role,
              italics: true,
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${bullet}`,
                  size: 22,
                }),
              ],
              spacing: { after: 60 },
              indent: { left: 360 },
            })
          );
        });
      }

      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 120 },
        })
      );
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 24,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: `\t\t${edu.start} - ${edu.end}`,
              size: 20,
            }),
          ],
          spacing: { after: 60 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              italics: true,
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      if (edu.details && edu.details.length > 0) {
        edu.details.forEach((detail) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${detail}`,
                  size: 22,
                }),
              ],
              spacing: { after: 60 },
              indent: { left: 360 },
            })
          );
        });
      }

      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 120 },
        })
      );
    });
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROJECTS',
            bold: true,
            size: 24,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    resume.projects.forEach((project) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 22,
            }),
            ...(project.link ? [
              new TextRun({
                text: ` (${project.link})`,
                size: 20,
              }),
            ] : []),
          ],
          spacing: { after: 60 },
        })
      );

      if (project.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.description,
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }

      if (project.bullets && project.bullets.length > 0) {
        project.bullets.forEach((bullet) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${bullet}`,
                  size: 22,
                }),
              ],
              spacing: { after: 60 },
              indent: { left: 360 },
            })
          );
        });
      }

      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 120 },
        })
      );
    });
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 24,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    resume.skills.forEach((skillCategory) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${skillCategory.category}: `,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: skillCategory.items.join(', '),
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    });
  }

  // Awards
  if (resume.awards && resume.awards.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'AWARDS & ACHIEVEMENTS',
            bold: true,
            size: 24,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    resume.awards.forEach((award) => {
      const awardText = [
        award.name,
        award.by ? `by ${award.by}` : null,
        award.year ? `(${award.year})` : null,
      ].filter(Boolean).join(' ');

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${awardText}`,
              size: 22,
            }),
          ],
          spacing: { after: 120 },
          indent: { left: 360 },
        })
      );
    });
  }

  return new Document({
    sections: [
      {
        children,
      },
    ],
  });
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
    const { resume } = req.body;
    
    if (!resume) {
      return res.status(400).json({ error: 'Resume data required' });
    }

    // Validate input
    const inputValidation = ResumeZ.safeParse(resume);
    if (!inputValidation.success) {
      return res.status(400).json({ error: 'Invalid resume format' });
    }

    const doc = createDocxFromResume(inputValidation.data);
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.docx');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ error: 'Failed to generate DOCX' });
  }
}