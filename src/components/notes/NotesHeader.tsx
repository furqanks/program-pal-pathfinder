
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  FileText,
  Calendar,
  SidebarClose,
  SidebarOpen,
  Filter,
  FolderOpen,
  RefreshCw
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
  const { summarizeAllNotes, getTodaysSummary, organizeNotes, convertExistingAIContent, notes } = useAINotesContext();

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-8 w-8 hover:bg-accent"
          >
            {sidebarOpen ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
          </Button>
          
          <h1 className="text-lg font-semibold">Notes</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-8 w-64 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <Select value={contextFilter} onValueChange={onContextFilterChange}>
            <SelectTrigger className="w-32 h-8 bg-background border-border">
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
            onClick={getTodaysSummary}
            className="h-8 bg-background border-border hover:bg-accent"
          >
            <Calendar className="mr-2 h-3 w-3" />
            Today's Summary
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={organizeNotes}
            className="h-8 bg-background border-border hover:bg-accent"
          >
            <FolderOpen className="mr-2 h-3 w-3" />
            Organise
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={summarizeAllNotes}
            disabled={notes.length === 0}
            className="h-8 bg-background border-border hover:bg-accent"
          >
            <FileText className="mr-2 h-3 w-3" />
            Summarize
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={convertExistingAIContent}
            className="h-8 bg-background border-border hover:bg-accent"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Fix AI Content
          </Button>
          
          <Button 
            onClick={onNewNote} 
            size="sm" 
            className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
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
