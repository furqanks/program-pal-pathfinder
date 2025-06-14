
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { 
  Grid3X3, 
  List, 
  Calendar, 
  Plus, 
  Search,
  Sparkles,
  LayoutGrid,
  Timeline
} from "lucide-react";
import NotionLikeEditor from "./NotionLikeEditor";
import NotesGrid from "./NotesGrid";
import NotesTimeline from "./NotesTimeline";
import FilterBar from "./FilterBar";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";

const NotionLikeInterface = () => {
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showArchived, setShowArchived] = useState(false);
  const [activeView, setActiveView] = useState<"grid" | "timeline">("grid");
  const [showEditor, setShowEditor] = useState(false);

  const { notes, folders, summarizeAllNotes } = useAINotesContext();
  const { programs } = useProgramContext();
  const { tags } = useTagContext();

  // Auto-select first note on load if none selected
  useEffect(() => {
    if (!selectedNote && notes.length > 0 && !showEditor) {
      const firstNote = notes.find(note => !note.is_archived);
      if (firstNote) {
        setSelectedNote(firstNote);
      }
    }
  }, [notes, selectedNote, showEditor]);

  const handleNoteSelect = (note: any) => {
    setSelectedNote(note);
    setShowEditor(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
  };

  const handleNoteCreated = () => {
    setShowEditor(false);
    toast.success("Note created successfully!");
  };

  const handleNoteUpdated = () => {
    toast.success("Note updated successfully!");
  };

  const handleAnalyzeAll = async () => {
    try {
      await summarizeAllNotes();
      toast.success("All notes analyzed successfully!");
    } catch (error) {
      toast.error("Failed to analyze notes");
    }
  };

  const activeNotes = notes.filter(note => note.is_archived === showArchived);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Enhanced Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Notes</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("grid")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={activeView === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("timeline")}
                className="h-8"
              >
                <Timeline className="h-4 w-4 mr-2" />
                Timeline
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeAll}
              disabled={activeNotes.length === 0}
              className="h-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze All
            </Button>
            <Button onClick={handleNewNote} size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="px-6 pb-3">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            contextFilter={contextFilter}
            onContextFilterChange={setContextFilter}
            folderFilter={folderFilter}
            onFolderFilterChange={setFolderFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
            folders={folders}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Notes List Panel */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full border-r border-border bg-muted/20">
              {activeView === "grid" ? (
                <NotesGrid
                  selectedNoteId={selectedNote?.id}
                  onNoteSelect={handleNoteSelect}
                  searchTerm={searchTerm}
                  contextFilter={contextFilter}
                  isCompact={true}
                />
              ) : (
                <NotesTimeline
                  selectedNoteId={selectedNote?.id}
                  onNoteSelect={handleNoteSelect}
                  searchTerm={searchTerm}
                  contextFilter={contextFilter}
                />
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Editor/Viewer Panel */}
          <ResizablePanel defaultSize={65}>
            <div className="h-full">
              {showEditor || selectedNote ? (
                <NotionLikeEditor
                  selectedNote={showEditor ? null : selectedNote}
                  onNoteCreated={handleNoteCreated}
                  onNoteUpdated={handleNoteUpdated}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Select a note to view</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a note from the sidebar or create a new one
                    </p>
                    <Button onClick={handleNewNote} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Note
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default NotionLikeInterface;
