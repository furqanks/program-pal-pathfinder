
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import NotesHeader from "./NotesHeader";
import NotesTimeline from "./NotesTimeline";
import SimpleNotesEditor from "./SimpleNotesEditor";

const NotionLikeInterface = () => {
  const { loading } = useAINotesContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'editor'>('timeline');

  const handleNewNote = () => {
    setSelectedNote(null);
    setViewMode('editor');
  };

  const handleNoteSelect = (note: any) => {
    setSelectedNote(note);
    setViewMode('editor');
  };

  const handleNoteCreated = () => {
    setSelectedNote(null);
    setViewMode('timeline');
  };

  const handleNoteUpdated = () => {
    setViewMode('timeline');
  };

  const handleBackToTimeline = () => {
    setViewMode('timeline');
    setSelectedNote(null);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">Loading Notes...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we load your notes and insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <NotesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        contextFilter={contextFilter}
        onContextFilterChange={setContextFilter}
        onNewNote={handleNewNote}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Notes Timeline */}
        <div className={cn(
          "transition-all duration-300 border-r border-border bg-background",
          // Desktop behavior
          "hidden md:block",
          sidebarOpen ? "md:w-80" : "md:w-0",
          "overflow-hidden",
          // Mobile behavior - full width when sidebar open, hidden when editor open
          viewMode === 'timeline' && sidebarOpen && "block w-full md:w-80",
          viewMode === 'editor' && "hidden md:block"
        )}>
          {sidebarOpen && (
            <NotesTimeline
              selectedNoteId={selectedNote?.id}
              onNoteSelect={handleNoteSelect}
              searchTerm={searchTerm}
              contextFilter={contextFilter}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className={cn(
          "flex-1 overflow-hidden bg-background",
          // Hide on mobile when sidebar is open and in timeline mode
          viewMode === 'timeline' && sidebarOpen && "hidden md:block"
        )}>
          {viewMode === 'timeline' && !sidebarOpen ? (
            <div className="h-full">
              <NotesTimeline
                selectedNoteId={selectedNote?.id}
                onNoteSelect={handleNoteSelect}
                searchTerm={searchTerm}
                contextFilter={contextFilter}
              />
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="h-full flex items-center justify-center bg-background px-4">
              <div className="text-center max-w-sm mx-auto">
                <div className="bg-card rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 shadow-sm border">
                  <span className="text-2xl md:text-3xl">📝</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Select a note to edit</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">Choose a note from the sidebar or create a new one</p>
              </div>
            </div>
          ) : (
            <SimpleNotesEditor
              selectedNote={selectedNote}
              onNoteCreated={handleNoteCreated}
              onNoteUpdated={handleNoteUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionLikeInterface;
