
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
      <div className="px-3 py-2 md:px-4 md:py-3">
        {/* Mobile: Single compact row */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-7 w-7 hover:bg-accent"
          >
            {sidebarOpen ? <SidebarClose className="h-3 w-3" /> : <SidebarOpen className="h-3 w-3" />}
          </Button>
          
          <h1 className="text-sm font-semibold mr-2">Notes</h1>
          
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 pr-2 h-7 text-xs bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <Select value={contextFilter} onValueChange={onContextFilterChange}>
            <SelectTrigger className="w-12 h-7 bg-background border-border px-1">
              <Filter className="h-3 w-3" />
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
            onClick={onNewNote} 
            size="sm" 
            className="h-7 w-7 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Mobile: Second row with compact action buttons */}
        <div className="flex items-center gap-1 mt-2 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={getTodaysSummary}
            className="h-6 px-2 text-xs bg-background border-border hover:bg-accent flex-1"
          >
            <Calendar className="mr-1 h-3 w-3" />
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={organizeNotes}
            className="h-6 px-2 text-xs bg-background border-border hover:bg-accent flex-1"
          >
            <FolderOpen className="mr-1 h-3 w-3" />
            Sort
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={summarizeAllNotes}
            disabled={notes.length === 0}
            className="h-6 px-2 text-xs bg-background border-border hover:bg-accent flex-1"
          >
            <FileText className="mr-1 h-3 w-3" />
            Sum
          </Button>
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden md:flex md:items-center md:justify-between">
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 h-8 w-48 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <Select value={contextFilter} onValueChange={onContextFilterChange}>
                <SelectTrigger className="w-32 h-8 bg-background border-border">
                  <Filter className="mr-2 h-3 w-3" />
                  <SelectValue placeholder="All" />
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

            <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
};

export default NotesHeader;
