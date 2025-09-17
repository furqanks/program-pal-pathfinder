import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

type J = { type?: string; attrs?: any; text?: string; marks?: any[]; content?: J[] };

const hasMark = (n: J, t: string) => Array.isArray(n.marks) && n.marks.some((m:any)=>m.type===t);

function runsFrom(node: J): TextRun[] {
  if (node.type !== 'text') return [];
  let run = new TextRun(node.text || '');
  if (hasMark(node, 'bold')) run = run.bold();
  if (hasMark(node, 'italic')) run = run.italics();
  if (hasMark(node, 'underline')) run = run.underline();
  // (optional) add link mark support later
  return [run];
}

function parasFrom(nodes: J[], ctx?: { ol?: boolean; olIndex?: number; }): Paragraph[] {
  const out: Paragraph[] = [];
  for (const n of nodes || []) {
    switch (n.type) {
      case 'heading': {
        const lvl = n.attrs?.level || 1;
        const h =
          lvl === 1 ? HeadingLevel.HEADING_1 :
          lvl === 2 ? HeadingLevel.HEADING_2 :
          HeadingLevel.HEADING_3;
        out.push(new Paragraph({ heading: h, children: (n.content||[]).flatMap(runsFrom) }));
        break;
      }
      case 'paragraph': {
        out.push(new Paragraph({ children: (n.content||[]).flatMap(runsFrom) }));
        break;
      }
      case 'blockquote': {
        const inner = parasFrom(n.content || []);
        inner.forEach(p => p.border({ left: { color: 'E5E7EB', space: 1, size: 6 } }));
        out.push(...inner);
        break;
      }
      case 'bulletList': {
        for (const li of n.content || []) {
          const inner = parasFrom(li.content || []);
          inner.forEach(p => p.bullet({ level: 0 }));
          out.push(...inner);
        }
        break;
      }
      case 'orderedList': {
        let idx = 1;
        for (const li of n.content || []) {
          const inner = parasFrom(li.content || []);
          inner.forEach(p => {
            // Prefix "1. " for robust numbering without complex numbering config
            p.children = [new TextRun(`${idx}. `), ...(p.options.children || [])];
          });
          out.push(...inner);
          idx++;
        }
        break;
      }
      case 'hardBreak': {
        out.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
        break;
      }
      default:
        if (Array.isArray(n.content)) out.push(...parasFrom(n.content));
    }
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { content_json, title } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!content_json?.content) return res.status(400).json({ error: 'Missing content_json.content' });

    // Basic sanity log (visible in Vercel logs)
    console.log('export nodes:', content_json.content.length);

    const children = parasFrom(content_json.content);
    const doc = new Document({
      sections: [{ children }],
    });

    const buf = await Packer.toBuffer(doc);
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'document').replace(/[^a-z0-9_-]+/gi,'_')}.docx"`);
    return res.status(200).send(buf);
  } catch (e:any) {
    console.error('export error', e);
    return res.status(500).json({ error: e?.message || 'Export failed' });
  }
}