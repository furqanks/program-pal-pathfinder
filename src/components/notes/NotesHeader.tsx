
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Sparkles,
  SidebarClose,
  SidebarOpen,
  Filter,
  LayoutGrid,
  Clock,
  FileText
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";

interface NotesHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  contextFilter: string;
  onContextFilterChange: (filter: string) => void;
  showTimeline: boolean;
  onTimelineToggle: () => void;
  onNewNote: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const NotesHeader = ({
  searchTerm,
  onSearchChange,
  contextFilter,
  onContextFilterChange,
  showTimeline,
  onTimelineToggle,
  onNewNote,
  sidebarOpen,
  onSidebarToggle
}: NotesHeaderProps) => {
  const { analyzeAllNotes, notes } = useAINotesContext();

  return (
    <div className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-9 w-9 hover:bg-muted/50"
          >
            {sidebarOpen ? <SidebarClose className="h-5 w-5" /> : <SidebarOpen className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notes</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{notes.filter(n => !n.is_archived).length} notes</span>
                <span>•</span>
                <span>Organized by time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeAllNotes}
            disabled={notes.length === 0}
            className="h-9"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze All
          </Button>
          
          <Button onClick={onNewNote} size="sm" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      <div className="px-6 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 border-border/50 focus:border-primary"
            />
          </div>

          <Select value={contextFilter} onValueChange={onContextFilterChange}>
            <SelectTrigger className="w-40 h-9 border-border/50">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contexts</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showTimeline ? "default" : "outline"}
            size="sm"
            onClick={onTimelineToggle}
            className="h-9"
          >
            {showTimeline ? <Clock className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
            {showTimeline ? "Timeline" : "Editor"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesHeader;
