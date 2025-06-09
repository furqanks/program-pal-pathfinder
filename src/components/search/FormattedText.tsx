
import { ExternalLink } from "lucide-react";

interface FormattedTextProps {
  text: string;
}

export const FormattedText = ({ text }: FormattedTextProps) => {
  // Parse inline URLs
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  
  // Enhanced text processing for better formatting
  const processText = (content: string) => {
    // Split by double line breaks to create paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    return paragraphs.map((paragraph, paragraphIndex) => {
      const trimmedParagraph = paragraph.trim();
      
      // Check for headings (### or ## or single line with **bold** pattern)
      const isHeading = trimmedParagraph.match(/^#{2,3}\s/) || 
                       (trimmedParagraph.includes('**') && 
                        trimmedParagraph.length < 100 && 
                        !trimmedParagraph.includes('\n') &&
                        trimmedParagraph.match(/^\*\*[^*]+\*\*:?\s*$/));
      
      if (isHeading) {
        const cleanHeading = trimmedParagraph
          .replace(/^#{2,3}\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/:$/, '');
        
        return (
          <h3 key={paragraphIndex} className="text-lg font-bold text-foreground mb-3 mt-6 first:mt-0">
            {cleanHeading}
          </h3>
        );
      }
      
      // Check for bullet lists
      const lines = trimmedParagraph.split('\n');
      const isBulletList = lines.length > 1 && 
                          lines.some(line => line.match(/^[•\-*]\s/) || line.match(/^\d+\.\s/));
      
      if (isBulletList) {
        return (
          <ul key={paragraphIndex} className="space-y-2 mb-4 list-disc list-inside">
            {lines.map((line, lineIndex) => {
              const cleanLine = line.replace(/^[•\-*\d\.]\s*/, '').trim();
              if (!cleanLine) return null;
              
              return (
                <li key={lineIndex} className="text-sm text-foreground leading-relaxed">
                  {formatInlineText(cleanLine)}
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Regular paragraph
      return (
        <p key={paragraphIndex} className="text-sm text-foreground leading-relaxed mb-4">
          {formatInlineText(trimmedParagraph)}
        </p>
      );
    });
  };
  
  // Format inline text with URLs, bold, and italic
  const formatInlineText = (text: string) => {
    const parts = text.split(urlRegex);
    
    return parts.map((part, partIndex) => {
      // Handle URLs
      if (part.match(urlRegex)) {
        return (
          <a
            key={partIndex}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium break-all inline-flex items-center gap-1"
          >
            {part.length > 50 ? `${part.substring(0, 50)}...` : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      // Process text for bold and italic formatting
      return formatTextStyles(part, partIndex);
    });
  };
  
  // Handle bold (**text**) and italic (*text*) formatting
  const formatTextStyles = (text: string, baseIndex: number) => {
    // First handle bold text (**text**)
    const boldParts = text.split(/(\*\*[^*]+\*\*)/);
    
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
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
    // Split by single asterisks, but avoid those that are part of ** sequences
    const italicParts = text.split(/(\*(?!\*)[^*]+\*(?!\*))/);
    
    return italicParts.map((italicPart, italicIndex) => {
      if (italicPart.startsWith('*') && italicPart.endsWith('*') && 
          !italicPart.startsWith('**') && !italicPart.endsWith('**')) {
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
      {processText(text)}
    </div>
  );
};
