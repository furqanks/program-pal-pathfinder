
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe } from "lucide-react";

interface SearchReportSourcesProps {
  citations: any[];
}

const SearchReportSources = ({ citations }: SearchReportSourcesProps) => {
  const validCitations = citations.filter(citation => citation.title || citation.text);
  
  if (validCitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Verified Sources ({validCitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          {validCitations.map((citation, index) => (
            <div key={index} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline line-clamp-2 block mb-2 leading-snug"
              >
                {citation.title || citation.url}
              </a>
              {citation.text && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
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

export default SearchReportSources;
