
import SearchReportHeader from "./SearchReportHeader";
import SearchReportContent from "./SearchReportContent";
import SearchReportVerification from "./SearchReportVerification";
import SearchReportSources from "./SearchReportSources";

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

  return (
    <div className="space-y-6">
      <SearchReportHeader 
        query={query}
        citations={citations}
        onSearchGoogle={handleSearchGoogle}
      />

      <SearchReportContent rawContent={rawContent} query={query} />
      
      <SearchReportVerification />

      <SearchReportSources citations={citations} />
    </div>
  );
};

export default SearchReportView;
