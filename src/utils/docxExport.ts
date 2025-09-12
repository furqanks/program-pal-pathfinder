import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface DocxExportInput {
  title: string;
  content: string;
  createdAt?: string | Date;
}

export const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-z0-9\-_.]+/gi, '_').slice(0, 120);
};

export async function generateDocxBlob({ title, content, createdAt }: DocxExportInput): Promise<Blob> {
  const created = createdAt ? new Date(createdAt) : new Date();
  const safeContent = content || '';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title || 'Document',
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created on ${created.toLocaleDateString()}`,
                italics: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          ...safeContent.split('\n').map((line) =>
            new Paragraph({
              children: [new TextRun({ text: line, size: 24 })],
            })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on ${new Date().toLocaleString()}`,
                italics: true,
                size: 18,
              }),
            ],
          }),
        ],
      },
    ],
  });

  // In the browser use toBlob
  return await Packer.toBlob(doc);
}

export function buildDocxFilename(title: string) {
  const date = new Date().toISOString().split('T')[0];
  const base = sanitizeFilename(title || 'document');
  return `${base}_${date}.docx`;
}
