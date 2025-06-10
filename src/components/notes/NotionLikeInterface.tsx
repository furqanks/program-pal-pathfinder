
import { useState } from "react";
import { cn } from "@/lib/utils";
import NotesHeader from "./NotesHeader";
import NotesTimeline from "./NotesTimeline";
import NotionLikeEditor from "./NotionLikeEditor";

const NotionLikeInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [showTimeline, setShowTimeline] = useState(true);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewNote = () => {
    setSelectedNote(null);
    setShowTimeline(false); // Switch to editor view for new note
  };

  const handleNoteSelect = (note: any) => {
    setSelectedNote(note);
    setShowTimeline(false); // Switch to editor view when selecting a note
  };

  const handleNoteCreated = () => {
    setShowTimeline(true); // Return to timeline after creating
  };

  const handleNoteUpdated = () => {
    // Stay in editor view after updating
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50/30">
      <NotesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        contextFilter={contextFilter}
        onContextFilterChange={setContextFilter}
        showTimeline={showTimeline}
        onTimelineToggle={() => setShowTimeline(!showTimeline)}
        onNewNote={handleNewNote}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Timeline Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r bg-white",
          sidebarOpen ? "w-96" : "w-0",
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

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          {showTimeline ? (
            // Full timeline view when sidebar is closed
            <NotesTimeline
              selectedNoteId={selectedNote?.id}
              onNoteSelect={handleNoteSelect}
              searchTerm={searchTerm}
              contextFilter={contextFilter}
            />
          ) : (
            // Editor view
            <NotionLikeEditor
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
