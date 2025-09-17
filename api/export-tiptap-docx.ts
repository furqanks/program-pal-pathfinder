import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

type JSONNode = { 
  type?: string; 
  attrs?: any; 
  text?: string; 
  marks?: any[]; 
  content?: JSONNode[] 
};

function runsFromNode(node: JSONNode): TextRun[] {
  if (!node || node.type !== 'text') return [];
  
  const has = (t: string) => node.marks?.some((m: any) => m.type === t);
  let run = new TextRun({ text: node.text || '' });
  
  if (has('bold')) run = run.bold();
  if (has('italic')) run = run.italics();
  if (has('underline')) run = run.underline();
  
  return [run];
}

function paragraphsFrom(nodes: JSONNode[], level = 0): Paragraph[] {
  const out: Paragraph[] = [];
  
  for (const n of nodes || []) {
    switch (n.type) {
      case 'paragraph':
        out.push(new Paragraph({ 
          children: (n.content || []).flatMap(runsFromNode) 
        }));
        break;
        
      case 'heading': {
        const lvl = n.attrs?.level || 1;
        const headingLevel =
          lvl === 1 ? HeadingLevel.HEADING_1 :
          lvl === 2 ? HeadingLevel.HEADING_2 :
          HeadingLevel.HEADING_3;
        out.push(new Paragraph({
          heading: headingLevel,
          children: (n.content || []).flatMap(runsFromNode),
        }));
        break;
      }
      
      case 'blockquote': {
        const paras = paragraphsFrom(n.content || [], level + 1);
        paras.forEach(p => {
          // Add indent for blockquote effect
          const existing = p.root.options.children || [];
          p.root.options.children = [
            new TextRun({ text: '" ' }),
            ...existing,
            new TextRun({ text: ' "' })
          ];
        });
        out.push(...paras);
        break;
      }
      
      case 'bulletList': {
        for (const li of n.content || []) {
          // li.type === 'listItem'
          const innerParas = paragraphsFrom(li.content || [], level + 1);
          innerParas.forEach(p => {
            p.bullet({ level: 0 });
          });
          out.push(...innerParas);
        }
        break;
      }
      
      case 'orderedList': {
        let i = 1;
        for (const li of n.content || []) {
          const innerParas = paragraphsFrom(li.content || [], level + 1);
          innerParas.forEach(p => {
            // Prepend number for ordered list
            const existing = p.root.options.children || [];
            p.root.options.children = [
              new TextRun(`${i}. `),
              ...existing
            ];
          });
          out.push(...innerParas);
          i++;
        }
        break;
      }
      
      case 'hardBreak':
        out.push(new Paragraph({ 
          children: [new TextRun({ break: 1 })] 
        }));
        break;
        
      default:
        if (n.content) {
          out.push(...paragraphsFrom(n.content, level + 1));
        }
    }
  }
  
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { content_json, title } = typeof req.body === 'string' ? 
      JSON.parse(req.body) : req.body;
      
    if (!content_json) {
      return res.status(400).json({ error: 'Missing content_json (TipTap JSON)' });
    }

    const children = paragraphsFrom(content_json.content || []);
    const doc = new Document({ 
      sections: [{ children }] 
    });
    
    const buf = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'document').replace(/[^a-z0-9_-]+/gi, '_')}.docx"`);
    
    return res.status(200).send(buf);
  } catch (e: any) {
    console.error('DOCX export error:', e);
    return res.status(500).json({ error: e?.message || 'Export failed' });
  }
}