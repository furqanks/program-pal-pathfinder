
import { useState } from "react";
import { cn } from "@/lib/utils";
import NotesHeader from "./NotesHeader";
import NotesTimeline from "./NotesTimeline";
import NotionLikeEditor from "./NotionLikeEditor";

const NotionLikeInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        {/* Sidebar - Notes Timeline - Hidden on mobile when editor is open */}
        <div className={cn(
          "transition-all duration-300 border-r border-border bg-background",
          sidebarOpen ? "w-80" : "w-0",
          "overflow-hidden",
          // Hide sidebar on mobile when in editor mode
          "md:block",
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
        <div className="flex-1 overflow-hidden bg-background">
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
              <div className="text-center">
                <div className="bg-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm border">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a note to edit</h3>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">Choose a note from the sidebar or create a new one</p>
              </div>
            </div>
          ) : (
            <NotionLikeEditor
              selectedNote={selectedNote}
              onNoteCreated={handleNoteCreated}
              onNoteUpdated={handleNoteUpdated}
              onBackToTimeline={handleBackToTimeline}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionLikeInterface;
