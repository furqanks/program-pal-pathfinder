import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { cvType, cvData } = req.body;

    if (!cvType || !cvData) {
      return res.status(400).json({ error: 'Missing cvType or cvData' });
    }

    const children: Paragraph[] = [];

    // Header Section
    children.push(
      new Paragraph({
        text: cvData.fullName || 'Your Name',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    if (cvData.email || cvData.phone || cvData.location) {
      const contactInfo = [cvData.email, cvData.phone, cvData.location].filter(Boolean).join(' | ');
      children.push(
        new Paragraph({
          text: contactInfo,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    if (cvType === 'academic') {
      // Academic CV Structure
      
      // Education
      if (cvData.education) {
        children.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.education, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Research Experience
      if (cvData.research) {
        children.push(
          new Paragraph({
            text: 'RESEARCH EXPERIENCE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.research, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Publications
      if (cvData.publications) {
        children.push(
          new Paragraph({
            text: 'PUBLICATIONS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.publications, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Conferences
      if (cvData.conferences) {
        children.push(
          new Paragraph({
            text: 'CONFERENCES & PRESENTATIONS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.conferences, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Teaching
      if (cvData.teaching) {
        children.push(
          new Paragraph({
            text: 'TEACHING EXPERIENCE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.teaching, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Skills
      if (cvData.skills) {
        children.push(
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.skills, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }
    } else {
      // Professional CV Structure
      
      // Professional Summary
      if (cvData.summary) {
        children.push(
          new Paragraph({
            text: 'PROFESSIONAL SUMMARY',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.summary, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Work Experience
      if (cvData.experience) {
        children.push(
          new Paragraph({
            text: 'WORK EXPERIENCE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.experience, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Education
      if (cvData.education) {
        children.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.education, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Skills
      if (cvData.skills) {
        children.push(
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.skills, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }

      // Achievements
      if (cvData.achievements) {
        children.push(
          new Paragraph({
            text: 'ACHIEVEMENTS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.achievements, size: 24 })],
            spacing: { after: 300 }
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    
    const filename = `${(cvData.fullName || 'CV').replace(/[^a-z0-9_-]+/gi, '_')}_${cvType}.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('export-cv-docx error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to export CV as DOCX' });
  }
}
