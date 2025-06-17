
import { ExternalLink } from "lucide-react";

export const useMarkdownRenderer = () => {
  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, partIndex) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={partIndex}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium break-all inline-flex items-center gap-1 text-sm"
          >
            {part.length > 40 ? `${part.substring(0, 40)}...` : part}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Simple markdown rendering for headers, tables, and lists
    const lines = text.split('\n');
    const rendered: JSX.Element[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: JSX.Element[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('### ')) {
        rendered.push(<h3 key={i} className="text-lg font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('## ')) {
        rendered.push(<h2 key={i} className="text-xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('# ')) {
        rendered.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>);
      }
      // Table detection
      else if (line.includes('|') && line.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableHeaders = line.split('|').map(h => h.trim()).filter(h => h);
          tableRows = [];
        } else if (!line.includes('---')) {
          const cells = line.split('|').map(c => c.trim()).filter(c => c);
          if (cells.length > 0) {
            tableRows.push(
              <tr key={`row-${i}`}>
                {cells.map((cell, idx) => (
                  <td key={idx} className="border border-border px-3 py-2">
                    {formatTextWithLinks(cell)}
                  </td>
                ))}
              </tr>
            );
          }
        }
      } else if (inTable && (!line.includes('|') || line.trim() === '')) {
        // End table and render it
        rendered.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className="border border-border px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
      // Bullet points
      else if (line.startsWith('* ')) {
        rendered.push(
          <li key={i} className="ml-4 mb-1 list-disc">
            {formatTextWithLinks(line.replace('* ', ''))}
          </li>
        );
      }
      // Bold text patterns
      else if (line.startsWith('**') && line.endsWith('**')) {
        rendered.push(<p key={i} className="font-semibold mb-2">{formatTextWithLinks(line.replace(/\*\*/g, ''))}</p>);
      }
      // Regular paragraphs
      else if (line.trim() && !line.includes('---')) {
        rendered.push(<p key={i} className="mb-2">{formatTextWithLinks(line)}</p>);
      }
    }
    
    // Close any open table
    if (inTable && tableHeaders.length > 0) {
      rendered.push(
        <div key="final-table" className="my-4 overflow-x-auto">
          <table className="w-full border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="border border-border px-3 py-2 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </div>
      );
    }
    
    return <div className="prose prose-sm max-w-none">{rendered}</div>;
  };

  return { renderMarkdown, formatTextWithLinks };
};
