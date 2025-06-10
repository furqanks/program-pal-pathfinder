
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Sparkles,
  SidebarClose,
  SidebarOpen,
  Filter
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";

interface NotesHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  contextFilter: string;
  onContextFilterChange: (filter: string) => void;
  onNewNote: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const NotesHeader = ({
  searchTerm,
  onSearchChange,
  contextFilter,
  onContextFilterChange,
  onNewNote,
  sidebarOpen,
  onSidebarToggle
}: NotesHeaderProps) => {
  const { analyzeAllNotes, notes } = useAINotesContext();

  return (
    <div className="border-b bg-white sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-8 w-8 hover:bg-gray-100"
          >
            {sidebarOpen ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">Notes</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-8 w-64 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Select value={contextFilter} onValueChange={onContextFilterChange}>
            <SelectTrigger className="w-32 h-8 border-gray-200">
              <Filter className="mr-2 h-3 w-3" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={analyzeAllNotes}
            disabled={notes.length === 0}
            className="h-8 border-gray-200"
          >
            <Sparkles className="mr-2 h-3 w-3" />
            Analyze
          </Button>
          
          <Button 
            onClick={onNewNote} 
            size="sm" 
            className="h-8 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-3 w-3" />
            New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesHeader;
