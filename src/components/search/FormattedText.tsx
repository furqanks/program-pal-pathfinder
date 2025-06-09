
import { ExternalLink, GraduationCap, MapPin, DollarSign, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      
      // Enhanced program detection - look for numbered programs with # symbols
      const numberedProgramMatch = trimmedBlock.match(/^#\s*(\d+)\.\s*(.+?)(?:\s*-\s*(.+))?$/m);
      if (numberedProgramMatch) {
        const [, number, title, subtitle] = numberedProgramMatch;
        const restOfContent = trimmedBlock.replace(/^#\s*\d+\.\s*.+$/m, '').trim();
        
        return (
          <Card key={blockIndex} className="mb-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <Badge variant="outline" className="text-sm font-bold bg-primary/10 text-primary shrink-0">
                  {number}
                </Badge>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
                    {title.replace(/^#*\s*/, '')}
                  </h3>
                  {subtitle && (
                    <p className="text-muted-foreground mb-3">{subtitle}</p>
                  )}
                </div>
              </div>
              {restOfContent && (
                <div className="space-y-4">
                  {formatProgramDetails(restOfContent)}
                </div>
              )}
            </CardContent>
          </Card>
        );
      }

      // Look for simple numbered lists (1. Program Name)
      const simpleNumberMatch = trimmedBlock.match(/^(\d+)\.\s*(.+)$/m);
      if (simpleNumberMatch && !trimmedBlock.includes('\n')) {
        const [, number, title] = simpleNumberMatch;
        return (
          <Card key={blockIndex} className="mb-4 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm font-bold bg-primary/10 text-primary shrink-0">
                  {number}
                </Badge>
                <h3 className="text-lg font-semibold text-foreground">
                  {title.replace(/^#*\s*/, '')}
                </h3>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Check for main section headings (## or ###) - remove # symbols
      if (trimmedBlock.match(/^#{2,3}\s+/)) {
        const headingText = trimmedBlock.replace(/^#{2,3}\s*/, '').replace(/\*\*/g, '');
        return (
          <div key={blockIndex} className="mt-8 mb-6 first:mt-0">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-primary" />
              {headingText}
            </h2>
            <div className="h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-2 mb-4"></div>
          </div>
        );
      }
      
      // Check for bold headings (standalone **text** lines)
      if (trimmedBlock.match(/^\*\*[^*]+\*\*:?\s*$/) && trimmedBlock.length < 100) {
        const headingText = trimmedBlock.replace(/\*\*/g, '').replace(/:$/, '');
        return (
          <h3 key={blockIndex} className="text-lg font-semibold text-foreground mt-6 mb-4 first:mt-0 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
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

      // Look for key-value pairs with colons
      if (line.includes(':')) {
        const [label, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        if (label && value) {
          const icon = getDetailIcon(label);
          details.push(
            <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              {icon}
              <div className="flex-1">
                <span className="font-semibold text-foreground block mb-1">{label.trim()}</span>
                <span className="text-muted-foreground text-sm">{formatInlineContent(value)}</span>
              </div>
            </div>
          );
          continue;
        }
      }
      
      // Handle bullet points or other content
      if (line.startsWith('-') || line.startsWith('•')) {
        details.push(
          <div key={i} className="flex items-start gap-3 py-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
            <span className="text-foreground text-sm leading-relaxed">
              {formatInlineContent(line.replace(/^[-•]\s*/, ''))}
            </span>
          </div>
        );
      } else {
        // Regular text content
        details.push(
          <div key={i} className="py-1 text-sm text-foreground leading-relaxed">
            {formatInlineContent(line)}
          </div>
        );
      }
    }
    
    return details;
  };

  const getDetailIcon = (label: string) => {
    const labelLower = label.toLowerCase();
    if (labelLower.includes('university') || labelLower.includes('institution')) {
      return <GraduationCap className="h-4 w-4 text-primary mt-0.5" />;
    }
    if (labelLower.includes('location') || labelLower.includes('country') || labelLower.includes('city')) {
      return <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />;
    }
    if (labelLower.includes('tuition') || labelLower.includes('fee') || labelLower.includes('cost')) {
      return <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />;
    }
    if (labelLower.includes('deadline') || labelLower.includes('date')) {
      return <Calendar className="h-4 w-4 text-red-600 mt-0.5" />;
    }
    if (labelLower.includes('duration') || labelLower.includes('length')) {
      return <Clock className="h-4 w-4 text-purple-600 mt-0.5" />;
    }
    return <div className="w-4 h-4 mt-0.5"></div>;
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
    <div className="space-y-4">
      {processContent(text)}
    </div>
  );
};
