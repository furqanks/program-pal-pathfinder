
import { useMarkdownRenderer } from "./MarkdownRenderer";

interface SearchReportContentProps {
  rawContent: string;
}

const SearchReportContent = ({ rawContent }: SearchReportContentProps) => {
  const { renderMarkdown } = useMarkdownRenderer();

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderMarkdown(rawContent)}
    </div>
  );
};

export default SearchReportContent;
