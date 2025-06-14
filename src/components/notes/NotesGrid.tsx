
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import CompactNoteCard from "./CompactNoteCard";

interface NotesGridProps {
  selectedNoteId?: string;
  onNoteSelect: (note: any) => void;
  searchTerm?: string;
  contextFilter?: string;
  isCompact?: boolean;
  maxNotes?: number;
}

const NotesGrid = ({ 
  selectedNoteId, 
  onNoteSelect, 
  searchTerm = "", 
  contextFilter = "",
  isCompact = false,
  maxNotes
}: NotesGridProps) => {
  const { notes, pinNote, archiveNote, analyzeNote, deleteNote } = useAINotesContext();
  const { programs } = useProgramContext();
  const { tags } = useTagContext();

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.programName} - ${program.university}` : "Unknown Program";
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : "Unknown Tag";
  };

  const filteredNotes = notes
    .filter(note => !note.is_archived)
    .filter(note => {
      if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (contextFilter && contextFilter !== "all" && note.context_type !== contextFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const displayNotes = maxNotes ? filteredNotes.slice(0, maxNotes) : filteredNotes;

  if (isCompact) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>
            <span className="text-xs text-muted-foreground">{displayNotes.length}</span>
          </div>
          {displayNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm">No notes found</p>
            </div>
          ) : (
            displayNotes.map((note) => (
              <CompactNoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={onNoteSelect}
                onPin={pinNote}
                onArchive={archiveNote}
                onAnalyze={analyzeNote}
                onDelete={deleteNote}
                getProgramName={getProgramName}
                getTagName={getTagName}
                viewMode="list"
              />
            ))
          )}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Notes</h2>
        <span className="text-sm text-muted-foreground">{displayNotes.length} notes</span>
      </div>

      {displayNotes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 opacity-50" />
          </div>
          <h3 className="font-medium mb-2">No notes found</h3>
          <p className="text-sm">Start writing in the editor below to create your first note</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayNotes.map((note) => (
            <CompactNoteCard
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={onNoteSelect}
              onPin={pinNote}
              onArchive={archiveNote}
              onAnalyze={analyzeNote}
              onDelete={deleteNote}
              getProgramName={getProgramName}
              getTagName={getTagName}
              viewMode="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesGrid;
