
import { ExternalLink } from "lucide-react";

interface FormattedTextProps {
  text: string;
}

export const FormattedText = ({ text }: FormattedTextProps) => {
  const processContent = (content: string) => {
    if (!content || content.trim().length === 0) return null;

    // Split content into blocks and process each one
    const blocks = content.split(/\n\s*\n/).filter(block => block.trim().length > 0);
    
    return blocks.map((block, blockIndex) => {
      const trimmedBlock = block.trim();
      
      // Check for numbered program listings (e.g., "# 1. BSc (Hons) Computer Science")
      const numberedProgramMatch = trimmedBlock.match(/^#\s*(\d+)\.\s*(.+?)(?:\s*-\s*(.+))?$/m);
      if (numberedProgramMatch) {
        const [, number, title, details] = numberedProgramMatch;
        const restOfContent = trimmedBlock.replace(/^#\s*\d+\.\s*.+$/m, '').trim();
        
        return (
          <div key={blockIndex} className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary rounded-r-lg">
            <div className="flex items-start gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-bold text-sm rounded-full flex-shrink-0">
                {number}
              </span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                {details && <p className="text-sm text-muted-foreground">{details}</p>}
              </div>
            </div>
            {restOfContent && (
              <div className="ml-11">
                {formatProgramDetails(restOfContent)}
              </div>
            )}
          </div>
        );
      }

      // Check for main headings (## or ###)
      if (trimmedBlock.match(/^#{2,3}\s+/)) {
        const headingText = trimmedBlock.replace(/^#{2,3}\s*/, '').replace(/\*\*/g, '');
        return (
          <h2 key={blockIndex} className="text-2xl font-bold text-foreground mt-8 mb-6 first:mt-0">
            {headingText}
          </h2>
        );
      }
      
      // Check for bold headings (standalone **text** lines)
      if (trimmedBlock.match(/^\*\*[^*]+\*\*:?\s*$/) && trimmedBlock.length < 100) {
        const headingText = trimmedBlock.replace(/\*\*/g, '').replace(/:$/, '');
        return (
          <h3 key={blockIndex} className="text-lg font-semibold text-foreground mt-6 mb-4 first:mt-0">
            {headingText}
          </h3>
        );
      }
      
      // Regular paragraph content
      return (
        <div key={blockIndex} className="mb-6">
          {formatInlineContent(trimmedBlock)}
        </div>
      );
    });
  };

  const formatProgramDetails = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const details = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Look for key-value pairs with colons or dashes
      if (line.includes(':') || line.includes(' - ')) {
        const parts = line.split(/:\s*|\s*-\s*/).filter(part => part.trim());
        if (parts.length >= 2) {
          const [label, ...valueParts] = parts;
          const value = valueParts.join(' - ');
          
          details.push(
            <div key={i} className="mb-3">
              <span className="font-semibold text-foreground">{label}:</span>
              <span className="ml-2 text-foreground">{formatInlineContent(value)}</span>
            </div>
          );
          continue;
        }
      }
      
      // Handle continuation lines or descriptions
      details.push(
        <div key={i} className="mb-2 text-sm text-foreground leading-relaxed">
          {formatInlineContent(line)}
        </div>
      );
    }
    
    return details;
  };
  
  const formatInlineContent = (text: string) => {
    if (!text) return '';
    
    // Handle URLs first
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
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            {part.length > 50 ? `${part.substring(0, 50)}...` : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      return formatTextStyles(part, partIndex);
    });
  };
  
  const formatTextStyles = (text: string, baseIndex: number) => {
    // Handle bold text (**text**)
    const boldRegex = /(\*\*[^*]+\*\*)/g;
    const boldParts = text.split(boldRegex);
    
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.match(boldRegex)) {
        const boldContent = boldPart.slice(2, -2);
        return (
          <strong key={`${baseIndex}-bold-${boldIndex}`} className="font-bold text-foreground">
            {formatItalicText(boldContent, `${baseIndex}-bold-${boldIndex}`)}
          </strong>
        );
      }
      
      return formatItalicText(boldPart, `${baseIndex}-${boldIndex}`);
    });
  };
  
  const formatItalicText = (text: string, baseKey: string) => {
    const italicRegex = /(\*(?!\*)[^*]+\*(?!\*))/g;
    const italicParts = text.split(italicRegex);
    
    return italicParts.map((italicPart, italicIndex) => {
      if (italicPart.match(italicRegex)) {
        const italicContent = italicPart.slice(1, -1);
        return (
          <em key={`${baseKey}-italic-${italicIndex}`} className="italic text-muted-foreground">
            {italicContent}
          </em>
        );
      }
      
      return italicPart;
    });
  };
  
  return (
    <div className="prose prose-sm max-w-none">
      {processContent(text)}
    </div>
  );
};
