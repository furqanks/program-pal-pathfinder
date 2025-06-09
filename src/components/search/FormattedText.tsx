
import { ExternalLink } from "lucide-react";

interface FormattedTextProps {
  text: string;
}

export const FormattedText = ({ text }: FormattedTextProps) => {
  // Enhanced content processing for better text structure
  const processContent = (content: string) => {
    if (!content || content.trim().length === 0) return null;

    // Split content into logical blocks
    const blocks = content.split(/\n\s*\n/).filter(block => block.trim().length > 0);
    
    return blocks.map((block, blockIndex) => {
      const trimmedBlock = block.trim();
      
      // Check for main headings (## or ###)
      if (trimmedBlock.match(/^#{2,3}\s+/)) {
        const headingText = trimmedBlock.replace(/^#{2,3}\s*/, '').replace(/\*\*/g, '');
        return (
          <h2 key={blockIndex} className="text-xl font-bold text-foreground mt-8 mb-4 first:mt-0">
            {headingText}
          </h2>
        );
      }
      
      // Check for bold headings (standalone **text** lines)
      if (trimmedBlock.match(/^\*\*[^*]+\*\*:?\s*$/) && trimmedBlock.length < 100) {
        const headingText = trimmedBlock.replace(/\*\*/g, '').replace(/:$/, '');
        return (
          <h3 key={blockIndex} className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
            {headingText}
          </h3>
        );
      }
      
      // Check for numbered lists
      const lines = trimmedBlock.split('\n');
      const isNumberedList = lines.length > 1 && lines.every(line => 
        line.trim().match(/^\d+\.\s/) || line.trim().length === 0
      );
      
      if (isNumberedList) {
        const listItems = lines.filter(line => line.trim().length > 0);
        return (
          <ol key={blockIndex} className="list-decimal list-inside space-y-2 mb-6 ml-4">
            {listItems.map((item, itemIndex) => {
              const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
              return (
                <li key={itemIndex} className="text-sm text-foreground leading-relaxed">
                  {formatInlineContent(cleanItem)}
                </li>
              );
            })}
          </ol>
        );
      }
      
      // Check for bullet lists
      const isBulletList = lines.length > 1 && lines.some(line => 
        line.trim().match(/^[•\-\*]\s/) && line.trim().length > 2
      );
      
      if (isBulletList) {
        const listItems = lines.filter(line => line.trim().match(/^[•\-\*]\s/));
        return (
          <ul key={blockIndex} className="list-disc list-inside space-y-2 mb-6 ml-4">
            {listItems.map((item, itemIndex) => {
              const cleanItem = item.replace(/^[•\-\*]\s*/, '').trim();
              return (
                <li key={itemIndex} className="text-sm text-foreground leading-relaxed">
                  {formatInlineContent(cleanItem)}
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Check for structured data (University:, Program:, etc.)
      if (trimmedBlock.match(/^(University|Program|Tuition|Deadline|Duration|Requirements|Application|Contact):/i)) {
        return (
          <div key={blockIndex} className="bg-muted/30 border-l-4 border-l-primary p-4 mb-4 rounded-r-lg">
            <div className="space-y-2 text-sm">
              {lines.map((line, lineIndex) => {
                if (!line.trim()) return null;
                const [label, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                
                if (value) {
                  return (
                    <div key={lineIndex} className="flex flex-wrap gap-2">
                      <span className="font-semibold text-foreground min-w-0">{label.trim()}:</span>
                      <span className="text-foreground flex-1 min-w-0">{formatInlineContent(value)}</span>
                    </div>
                  );
                }
                
                return (
                  <div key={lineIndex} className="font-medium text-foreground">
                    {formatInlineContent(line.trim())}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      
      // Regular paragraph with enhanced formatting
      return (
        <div key={blockIndex} className="mb-4">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return null;
            
            return (
              <p key={lineIndex} className="text-sm text-foreground leading-relaxed mb-2 last:mb-0">
                {formatInlineContent(trimmedLine)}
              </p>
            );
          })}
        </div>
      );
    });
  };
  
  // Enhanced inline content formatting
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
            {part.length > 60 ? `${part.substring(0, 60)}...` : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      return formatTextStyles(part, partIndex);
    });
  };
  
  // Handle bold and italic formatting
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
  
  // Handle italic text (*text*) - avoiding conflict with **bold**
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
