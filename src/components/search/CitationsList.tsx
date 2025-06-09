
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe } from "lucide-react";

interface Citation {
  title?: string;
  text?: string;
  url: string;
}

interface CitationsListProps {
  citations: Citation[];
}

export const CitationsList = ({ citations }: CitationsListProps) => {
  const validCitations = citations.filter(citation => citation.title || citation.text);
  
  if (validCitations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="font-bold">Sources & References ({validCitations.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {validCitations.map((citation, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-primary hover:underline line-clamp-2 block mb-2"
              >
                {citation.title || citation.url}
              </a>
              {citation.text && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {citation.text}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span className="truncate">{new URL(citation.url).hostname}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
