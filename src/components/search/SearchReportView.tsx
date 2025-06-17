
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Search as SearchIcon, 
  ExternalLink, 
  Info, 
  AlertTriangle,
  GraduationCap,
  FileText,
  Globe,
  Sparkles,
  Star
} from "lucide-react";

interface SearchReportViewProps {
  rawContent: string;
  query: string;
  citations: any[];
}

const SearchReportView = ({ rawContent, query, citations }: SearchReportViewProps) => {
  const handleSearchGoogle = () => {
    const searchQuery = `${query} university programs official website`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  // Render markdown content in the same style as Smart Notes
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Simple markdown rendering for headers, tables, and lists
    const lines = text.split('\n');
    const rendered: JSX.Element[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: JSX.Element[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('### ')) {
        rendered.push(<h3 key={i} className="text-lg font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('## ')) {
        rendered.push(<h2 key={i} className="text-xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('# ')) {
        rendered.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>);
      }
      // Table detection
      else if (line.includes('|') && line.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableHeaders = line.split('|').map(h => h.trim()).filter(h => h);
          tableRows = [];
        } else if (!line.includes('---')) {
          const cells = line.split('|').map(c => c.trim()).filter(c => c);
          if (cells.length > 0) {
            tableRows.push(
              <tr key={`row-${i}`}>
                {cells.map((cell, idx) => (
                  <td key={idx} className="border border-border px-3 py-2">
                    {formatTextWithLinks(cell)}
                  </td>
                ))}
              </tr>
            );
          }
        }
      } else if (inTable && (!line.includes('|') || line.trim() === '')) {
        // End table and render it
        rendered.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className="border border-border px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
      // Bullet points
      else if (line.startsWith('* ')) {
        rendered.push(
          <li key={i} className="ml-4 mb-1 list-disc">
            {formatTextWithLinks(line.replace('* ', ''))}
          </li>
        );
      }
      // Bold text patterns
      else if (line.startsWith('**') && line.endsWith('**')) {
        rendered.push(<p key={i} className="font-semibold mb-2">{formatTextWithLinks(line.replace(/\*\*/g, ''))}</p>);
      }
      // Regular paragraphs
      else if (line.trim() && !line.includes('---')) {
        rendered.push(<p key={i} className="mb-2">{formatTextWithLinks(line)}</p>);
      }
    }
    
    // Close any open table
    if (inTable && tableHeaders.length > 0) {
      rendered.push(
        <div key="final-table" className="my-4 overflow-x-auto">
          <table className="w-full border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="border border-border px-3 py-2 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </div>
      );
    }
    
    return <div className="prose prose-sm max-w-none">{rendered}</div>;
  };

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

  return (
    <div className="space-y-6">
      {/* Report Header - Same style as Smart Notes */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-2 flex items-center gap-2">
                  University Program Search Results
                  <Star className="h-5 w-5 text-primary" />
                </CardTitle>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Search Query:</span> <span className="italic">"{query}"</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>Official university sources</span>
                    </div>
                    {citations.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{citations.length} verified sources</span>
                      </>
                    )}
                    <span>•</span>
                    <span>At least 5 program options included</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchGoogle}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Search Google for More
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content - Same style as Smart Notes organized output */}
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Organized Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-t pt-4">
            {renderMarkdown(rawContent)}
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Notice - Same style as Smart Notes */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                Important: Verify All Information
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                This AI-generated report provides insights from official sources with at least 5 program options. 
                <strong> Always verify details directly with universities</strong> before applying. 
                Information may change frequently.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  Check Current Fees
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  Verify Deadlines
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                  Confirm Requirements
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Section - Same style as Smart Notes */}
      {citations.length > 0 && citations.some(citation => citation.title || citation.text) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Verified Sources ({citations.filter(citation => citation.title || citation.text).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {citations
                .filter(citation => citation.title || citation.text)
                .map((citation, index) => (
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
      )}
    </div>
  );
};

export default SearchReportView;
