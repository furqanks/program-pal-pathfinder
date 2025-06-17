
interface SearchReportContentProps {
  rawContent: string;
}

const SearchReportContent = ({ rawContent }: SearchReportContentProps) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {rawContent}
      </pre>
    </div>
  );
};

export default SearchReportContent;
