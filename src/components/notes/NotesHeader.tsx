
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  FileText,
  Calendar,
  Filter,
  FolderOpen,
  ChevronDown
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface NotesHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  contextFilter: string;
  onContextFilterChange: (filter: string) => void;
  onNewNote: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  onNoteSelect: (note: any) => void;
  selectedNote?: any;
}

const NotesHeader = ({
  searchTerm,
  onSearchChange,
  contextFilter,
  onContextFilterChange,
  onNewNote,
  onNoteSelect,
  selectedNote
}: NotesHeaderProps) => {
  const { summarizeAllNotes, getTodaysSummary, organizeNotes, notes } = useAINotesContext();
  const [notesPopoverOpen, setNotesPopoverOpen] = useState(false);

  // Filter notes based on search and context
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContext = contextFilter === 'all' || note.context_type === contextFilter;
    
    return matchesSearch && matchesContext;
  }).slice(0, 10); // Limit to recent 10 notes

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="px-3 py-2 md:px-6 md:py-4">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Notes</h1>
              <Badge variant="outline" className="text-xs">
                {notes.length} notes
              </Badge>
            </div>

            {/* Current note selector */}
            <Popover open={notesPopoverOpen} onOpenChange={setNotesPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="max-w-64 justify-between">
                  <span className="truncate">
                    {selectedNote ? selectedNote.title : "Select a note..."}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredNotes.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notes found
                    </div>
                  ) : (
                    filteredNotes.map(note => (
                      <button
                        key={note.id}
                        onClick={() => {
                          onNoteSelect(note);
                          setNotesPopoverOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-accent border-b last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-sm truncate">
                          {note.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {note.content.substring(0, 100)}...
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {note.context_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3">
            {/* Search and filters */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={contextFilter} onValueChange={onContextFilterChange}>
                <SelectTrigger className="w-32 h-9 bg-background border-border">
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

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={getTodaysSummary}
                className="hidden md:flex h-9 bg-background border-border hover:bg-accent"
              >
                <Calendar className="mr-2 h-3 w-3" />
                Today
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={organizeNotes}
                className="hidden md:flex h-9 bg-background border-border hover:bg-accent"
              >
                <FolderOpen className="mr-2 h-3 w-3" />
                Organize
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={summarizeAllNotes}
                disabled={notes.length === 0}
                className="hidden lg:flex h-9 bg-background border-border hover:bg-accent"
              >
                <FileText className="mr-2 h-3 w-3" />
                Summarize
              </Button>

              <Button 
                onClick={onNewNote} 
                size="sm" 
                className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-3 w-3" />
                <span className="hidden sm:inline">New Note</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile filters row */}
        <div className="flex md:hidden items-center gap-2 mt-3">
          <Select value={contextFilter} onValueChange={onContextFilterChange}>
            <SelectTrigger className="flex-1 h-8 bg-background border-border">
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

          <Button
            variant="outline"
            size="sm"
            onClick={getTodaysSummary}
            className="h-8 px-3 bg-background border-border hover:bg-accent"
          >
            <Calendar className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={organizeNotes}
            className="h-8 px-3 bg-background border-border hover:bg-accent"
          >
            <FolderOpen className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesHeader;
