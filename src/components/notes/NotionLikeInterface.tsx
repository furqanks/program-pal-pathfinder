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
  const [viewMode, setViewMode] = useState<'timeline' | 'editor'>('editor');

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
    // Keep the note selected after updating
    setViewMode('timeline');
  };

  const handleBackToTimeline = () => {
    setViewMode('timeline');
    setSelectedNote(null);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
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
          "transition-all duration-300 border-r bg-gray-50/30 backdrop-blur-sm",
          sidebarOpen ? "w-80" : "w-0",
          "overflow-hidden"
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

        {/* Main Content Area - Full Notion-like Editor */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'timeline' ? (
            <div className="h-full flex items-center justify-center bg-gray-50/30">
              <div className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a note to edit</h3>
                <p className="text-muted-foreground mb-4">Choose a note from the sidebar or create a new one</p>
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
