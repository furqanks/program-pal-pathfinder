
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Hash,
  Pin,
  Sparkles,
  FileText,
  Clock
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";

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
  const { notes } = useAINotesContext();
  const { programs } = useProgramContext();

  const getContextIcon = (context: string) => {
    switch (context) {
      case "academic": return <BookOpen className="h-3 w-3" />;
      case "application": return <Target className="h-3 w-3" />;
      case "financial": return <DollarSign className="h-3 w-3" />;
      case "research": return <Archive className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.programName} - ${program.university}` : null;
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

  const getContentPreview = (content: string) => {
    const maxLength = isCompact ? 80 : 120;
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  if (isCompact) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Recent Notes</h3>
          {displayNotes.map((note) => (
            <Card
              key={note.id}
              className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedNoteId === note.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => onNoteSelect(note)}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {note.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                  <h4 className="font-medium text-sm truncate">{note.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {getContentPreview(note.content)}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {getContextIcon(note.context_type)}
                    <span className="ml-1">{note.context_type}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
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
            <Card
              key={note.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                selectedNoteId === note.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => onNoteSelect(note)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {note.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      <h4 className="font-semibold text-base truncate">{note.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {getContentPreview(note.content)}
                    </p>
                  </div>
                </div>

                {note.program_id && (
                  <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    📚 {getProgramName(note.program_id)}
                  </div>
                )}

                {note.ai_summary && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg p-2 text-xs border border-purple-200">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                      <span className="font-medium text-purple-800">AI Summary</span>
                    </div>
                    <p className="text-purple-700 line-clamp-2">{note.ai_summary}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline" className="text-xs h-5 px-2">
                    {getContextIcon(note.context_type)}
                    <span className="ml-1">{note.context_type}</span>
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesGrid;
