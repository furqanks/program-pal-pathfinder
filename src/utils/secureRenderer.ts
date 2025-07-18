import DOMPurify from 'dompurify';

/**
 * Secure HTML sanitization utility using DOMPurify
 * This prevents XSS attacks by sanitizing HTML content before rendering
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // Allow common formatting tags
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    // Allow common attributes but restrict dangerous ones
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    // Ensure links are safe
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Remove any script-related attributes
    FORBID_ATTR: ['style', 'onload', 'onerror', 'onclick', 'onmouseover']
  });
};

/**
 * Secure markdown-to-HTML processor
 * Processes markdown content and returns sanitized HTML
 */
export const processMarkdownSecurely = (text: string): string => {
  if (!text) return '';
  
  let processed = text.trim();
  
  // Handle headers (### or ## or #)
  processed = processed.replace(/^#+\s+(.+)$/gm, (match, content) => {
    const level = match.match(/^#+/)?.[0].length || 3;
    const className = level === 1 ? 'text-xl font-bold mb-3 mt-4' : 
                     level === 2 ? 'text-lg font-semibold mb-2 mt-3' : 
                     'text-base font-medium mb-2 mt-2';
    return `<h${Math.min(level, 6)} class="${className}">${content.trim()}</h${Math.min(level, 6)}>`;
  });
  
  // Handle bold text (**text**)
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Handle italic text (*text*)
  processed = processed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  
  // Handle bullet points (- text)
  processed = processed.replace(/^[\s]*-[\s]+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
  
  // Wrap consecutive <li> elements in <ul>
  processed = processed.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
    return `<ul class="list-disc mb-3 space-y-1">${match}</ul>`;
  });
  
  // Handle numbered lists (1. text)
  processed = processed.replace(/^[\s]*\d+\.[\s]+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
  processed = processed.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
    if (!match.includes('list-disc')) {
      return `<ol class="list-decimal mb-3 space-y-1">${match}</ol>`;
    }
    return match;
  });
  
  // Split into paragraphs and wrap them
  const paragraphs = processed.split(/\n\s*\n/);
  processed = paragraphs.map(para => {
    para = para.trim();
    if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<ol')) {
      return `<p class="mb-3 leading-relaxed">${para.replace(/\n/g, '<br>')}</p>`;
    }
    return para;
  }).join('\n');
  
  // Sanitize the final HTML before returning
  return sanitizeHtml(processed);
};

/**
 * Creates a safe HTML object for React's dangerouslySetInnerHTML
 * This should be used instead of direct dangerouslySetInnerHTML
 */
export const createSafeHtml = (html: string) => ({
  __html: sanitizeHtml(html)
});