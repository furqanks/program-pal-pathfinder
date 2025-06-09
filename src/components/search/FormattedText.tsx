
import { ExternalLink } from "lucide-react";

interface FormattedTextProps {
  text: string;
}

export const FormattedText = ({ text }: FormattedTextProps) => {
  // Parse inline URLs
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const parts = text.split(urlRegex);
  
  return (
    <>
      {parts.map((part, partIndex) => {
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
        
        // Format text with bold markers - stronger emphasis
        return part
          .split(/(\*\*[^*]+\*\*)/)
          .map((textPart, textIndex) => {
            if (textPart.startsWith('**') && textPart.endsWith('**')) {
              return (
                <strong key={textIndex} className="font-bold text-foreground">
                  {textPart.slice(2, -2)}
                </strong>
              );
            }
            return textPart;
          });
      })}
    </>
  );
};
