import { useState } from "react";
import { cn } from "@/lib/utils";
import NotesHeader from "./NotesHeader";
import NotesGrid from "./NotesGrid";
import MainEditor from "./MainEditor";

const NotionLikeInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewNote = () => {
    setSelectedNote(null);
  };

  const handleNoteSelect = (note: any) => {
    setSelectedNote(note);
  };

  const handleNoteCreated = () => {
    setSelectedNote(null);
  };

  const handleNoteUpdated = () => {
    // Keep the note selected after updating
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
        {/* Timeline Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r bg-gray-50/30 backdrop-blur-sm",
          sidebarOpen ? "w-80" : "w-0",
          "overflow-hidden"
        )}>
          {sidebarOpen && (
            <NotesGrid
              selectedNoteId={selectedNote?.id}
              onNoteSelect={handleNoteSelect}
              searchTerm={searchTerm}
              contextFilter={contextFilter}
              isCompact={true}
            />
          )}
        </div>

        {/* Main Content Area - Notion-like layout */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Recent Notes Grid */}
          <div className="border-b bg-gray-50/30">
            <NotesGrid
              selectedNoteId={selectedNote?.id}
              onNoteSelect={handleNoteSelect}
              searchTerm={searchTerm}
              contextFilter={contextFilter}
              isCompact={false}
              maxNotes={6}
            />
          </div>

          {/* Main Editor */}
          <div className="flex-1 overflow-auto">
            <MainEditor
              selectedNote={selectedNote}
              onNoteCreated={handleNoteCreated}
              onNoteUpdated={handleNoteUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionLikeInterface;
