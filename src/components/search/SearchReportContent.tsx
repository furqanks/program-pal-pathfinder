
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useMarkdownRenderer } from "./MarkdownRenderer";

interface SearchReportContentProps {
  rawContent: string;
}

const SearchReportContent = ({ rawContent }: SearchReportContentProps) => {
  const { renderMarkdown } = useMarkdownRenderer();

  return (
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
  );
};

export default SearchReportContent;
