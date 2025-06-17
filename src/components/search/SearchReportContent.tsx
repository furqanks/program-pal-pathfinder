
import { ExternalLink } from "lucide-react";

interface SearchReportContentProps {
  rawContent: string;
}

const SearchReportContent = ({ rawContent }: SearchReportContentProps) => {
  const formatContentWithCitations = (text: string) => {
    // Split the text into lines to preserve structure
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={lineIndex} />;
      }
      
      // Check for URLs in the line
      const urlRegex = /(https?:\/\/[^\s\[\]]+)/g;
      const parts = line.split(urlRegex);
      
      const formattedLine = parts.map((part, partIndex) => {
        if (part.match(urlRegex)) {
          // Extract a meaningful title from the URL or use the domain
          const url = new URL(part);
          const displayText = url.hostname.replace('www.', '');
          
          return (
            <a
              key={partIndex}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium bg-muted/30 px-2 py-0.5 rounded text-sm mx-1"
            >
              {displayText}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
        return part;
      });
      
      // Handle different line types for better formatting
      if (line.startsWith('###')) {
        return (
          <h3 key={lineIndex} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {formattedLine}
          </h3>
        );
      } else if (line.startsWith('##')) {
        return (
          <h2 key={lineIndex} className="text-xl font-bold mt-8 mb-4 text-foreground">
            {formattedLine}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-2xl font-bold mt-8 mb-4 text-foreground">
            {formattedLine}
          </h1>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={lineIndex} className="ml-4 mb-1 list-disc text-foreground">
            {formattedLine}
          </li>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={lineIndex} className="font-semibold mb-2 text-foreground">
            {formattedLine}
          </p>
        );
      } else {
        return (
          <p key={lineIndex} className="mb-2 text-foreground leading-relaxed">
            {formattedLine}
          </p>
        );
      }
    });
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div className="font-sans text-sm leading-relaxed">
        {formatContentWithCitations(rawContent)}
      </div>
    </div>
  );
};

export default SearchReportContent;
