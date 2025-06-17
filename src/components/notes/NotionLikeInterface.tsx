
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import NotesHeader from "./NotesHeader";
import NotesTimeline from "./NotesTimeline";
import NotionLikeEditor from "./NotionLikeEditor";

const NotionLikeInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'editor'>('timeline');
  const isMobile = useIsMobile();

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

  return (
    <div className={cn(
      "flex flex-col bg-background",
      // On mobile, account for the main layout's hamburger menu
      isMobile ? "h-full" : "h-screen"
    )}>
      <NotesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        contextFilter={contextFilter}
        onContextFilterChange={setContextFilter}
        onNewNote={handleNewNote}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onNoteSelect={handleNoteSelect}
        selectedNote={selectedNote}
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
            <NotionLikeEditor
              selectedNote={selectedNote}
              onNoteCreated={handleNoteCreated}
              onNoteUpdated={handleNoteUpdated}
              onNoteSelect={handleNoteSelect}
              onBackToTimeline={handleBackToTimeline}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionLikeInterface;
