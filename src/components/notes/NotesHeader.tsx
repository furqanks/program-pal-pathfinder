
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
  FolderOpen
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
  const { summarizeAllNotes, getTodaysSummary, organizeNotes, notes } = useAINotesContext();

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        {/* Top row on mobile, left side on desktop */}
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
          
          {/* New button visible on mobile */}
          <Button 
            onClick={onNewNote} 
            size="sm" 
            className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 md:hidden ml-auto"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Second row on mobile, right side on desktop */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          {/* Search and filter row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-8 w-full md:w-48 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <Select value={contextFilter} onValueChange={onContextFilterChange}>
              <SelectTrigger className="w-20 md:w-32 h-8 bg-background border-border">
                <Filter className="md:mr-2 h-3 w-3" />
                <SelectValue placeholder="All" className="hidden md:block" />
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
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 justify-center md:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={getTodaysSummary}
              className="h-8 bg-background border-border hover:bg-accent flex-1 md:flex-none"
            >
              <Calendar className="md:mr-2 h-3 w-3" />
              <span className="hidden md:inline">Today's Summary</span>
              <span className="md:hidden">Today</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={organizeNotes}
              className="h-8 bg-background border-border hover:bg-accent flex-1 md:flex-none"
            >
              <FolderOpen className="md:mr-2 h-3 w-3" />
              <span className="hidden md:inline">Organise</span>
              <span className="md:hidden">Sort</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={summarizeAllNotes}
              disabled={notes.length === 0}
              className="h-8 bg-background border-border hover:bg-accent flex-1 md:flex-none"
            >
              <FileText className="md:mr-2 h-3 w-3" />
              <span className="hidden md:inline">Summarize</span>
              <span className="md:hidden">Sum</span>
            </Button>

            {/* New button hidden on mobile */}
            <Button 
              onClick={onNewNote} 
              size="sm" 
              className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 hidden md:flex"
            >
              <Plus className="mr-2 h-3 w-3" />
              New
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesHeader;
