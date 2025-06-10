
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar,
  Clock, 
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Hash,
  Pin,
  Sparkles,
  Edit2
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";

interface NotesTimelineProps {
  selectedNoteId?: string;
  onNoteSelect: (note: any) => void;
  searchTerm?: string;
  contextFilter?: string;
}

const NotesTimeline = ({ selectedNoteId, onNoteSelect, searchTerm = "", contextFilter = "" }: NotesTimelineProps) => {
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
      // Pinned notes first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then by update time
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  // Group notes by date
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const date = new Date(note.updated_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(note);
    return groups;
  }, {} as Record<string, any[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {Object.entries(groupedNotes).map(([dateString, dateNotes]) => (
          <div key={dateString} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(dateString)}
            </div>
            
            <div className="space-y-2 ml-6">
              {dateNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedNoteId === note.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onNoteSelect(note)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {note.is_pinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                          <h4 className="font-medium text-sm truncate">{note.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {getContextIcon(note.context_type)}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(note.updated_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Program association */}
                    {note.program_id && (
                      <div className="text-xs text-blue-600 font-medium">
                        📚 {getProgramName(note.program_id)}
                      </div>
                    )}

                    {/* AI Summary preview */}
                    {note.ai_summary && (
                      <div className="bg-purple-50 rounded p-2 text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          <span className="font-medium text-purple-800">AI Summary</span>
                        </div>
                        <p className="text-purple-700 line-clamp-2">{note.ai_summary}</p>
                      </div>
                    )}

                    {/* Priority and context badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {note.context_type}
                        </Badge>
                        {note.priority_score > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes found</p>
            {(searchTerm || contextFilter) && (
              <p className="text-sm">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default NotesTimeline;
