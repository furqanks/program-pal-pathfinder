
import { useMarkdownRenderer } from "./MarkdownRenderer";

interface SearchReportContentProps {
  rawContent: string;
  query?: string;
}

const SearchReportContent = ({ rawContent }: SearchReportContentProps) => {
  const { renderMarkdown } = useMarkdownRenderer();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Search Results</h3>
      </div>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {renderMarkdown(rawContent)}
      </div>
    </div>
  );
};

export default SearchReportContent;
