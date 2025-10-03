import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "npm:docx@^9.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvType, cvData } = await req.json();
    console.log('Generating DOCX for CV type:', cvType);

    const sections = [];

    // Header with name and contact info
    sections.push(
      new Paragraph({
        text: cvData.personalInfo?.name || 'Your Name',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    if (cvData.personalInfo?.email || cvData.personalInfo?.phone) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [cvData.personalInfo.email, cvData.personalInfo.phone].filter(Boolean).join(' | '),
              size: 22,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Academic CV sections
    if (cvType === 'academic') {
      // Education
      if (cvData.education) {
        sections.push(
          new Paragraph({
            text: 'Education',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.education, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Research Experience
      if (cvData.researchExperience) {
        sections.push(
          new Paragraph({
            text: 'Research Experience',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.researchExperience, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Publications
      if (cvData.publications) {
        sections.push(
          new Paragraph({
            text: 'Publications',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.publications, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Conferences
      if (cvData.conferences) {
        sections.push(
          new Paragraph({
            text: 'Conferences & Presentations',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.conferences, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Teaching Experience
      if (cvData.teaching) {
        sections.push(
          new Paragraph({
            text: 'Teaching Experience',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.teaching, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Skills
      if (cvData.skills) {
        sections.push(
          new Paragraph({
            text: 'Skills',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.skills, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }
    }

    // Professional CV sections
    if (cvType === 'professional') {
      // Professional Summary
      if (cvData.summary) {
        sections.push(
          new Paragraph({
            text: 'Professional Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.summary, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Work Experience
      if (cvData.workExperience) {
        sections.push(
          new Paragraph({
            text: 'Work Experience',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.workExperience, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Education
      if (cvData.education) {
        sections.push(
          new Paragraph({
            text: 'Education',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.education, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Skills
      if (cvData.skills) {
        sections.push(
          new Paragraph({
            text: 'Skills',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.skills, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }

      // Achievements
      if (cvData.achievements) {
        sections.push(
          new Paragraph({
            text: 'Key Achievements',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.achievements, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${cvData.personalInfo?.name || 'CV'}_${cvType}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
