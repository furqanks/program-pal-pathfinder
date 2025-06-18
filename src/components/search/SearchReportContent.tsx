
interface SearchReportContentProps {
  rawContent: string;
  query?: string;
}

const SearchReportContent = ({ rawContent }: SearchReportContentProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Search Results</h3>
      </div>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {rawContent}
        </pre>
      </div>
    </div>
  );
};

export default SearchReportContent;
