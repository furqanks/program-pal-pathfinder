
import { ExternalLink } from "lucide-react";
import { processMarkdownSecurely, createSafeHtml } from "@/utils/secureRenderer";

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
    
    // Use the secure markdown processor with additional URL link processing
    let processedText = text;
    
    // Enhanced URL regex that handles links in tables and content
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    processedText = processedText.replace(urlRegex, (url) => {
      const displayUrl = url.length > 40 ? `${url.substring(0, 40)}...` : url;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium break-all inline-flex items-center gap-1 text-sm">${displayUrl} <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15,3 21,3 21,9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
    });
    
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={createSafeHtml(processMarkdownSecurely(processedText))} />;
  };

  return { renderMarkdown, formatTextWithLinks };
};
