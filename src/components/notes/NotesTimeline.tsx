
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
  Plus,
  FileText,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotesTimelineProps {
  selectedNoteId?: string;
  onNoteSelect: (note: any) => void;
  searchTerm?: string;
  contextFilter?: string;
}

const NotesTimeline = ({ selectedNoteId, onNoteSelect, searchTerm = "", contextFilter = "" }: NotesTimelineProps) => {
  const { notes, deleteNote, pinNote, archiveNote } = useAINotesContext();
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

  const getContentPreview = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + "..." : content;
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const handlePinNote = async (e: React.MouseEvent, noteId: string, currentlyPinned: boolean) => {
    e.stopPropagation();
    await pinNote(noteId, !currentlyPinned);
  };

  const handleArchiveNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    await archiveNote(noteId, true);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {Object.entries(groupedNotes).map(([dateString, dateNotes]) => (
          <div key={dateString} className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <Calendar className="h-4 w-4" />
              {formatDate(dateString)}
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs">{dateNotes.length} notes</span>
            </div>
            
            <div className="space-y-3">
              {dateNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    selectedNoteId === note.id 
                      ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                      : 'hover:bg-muted/30 border-border/50'
                  }`}
                  onClick={() => onNoteSelect(note)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {note.is_pinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-semibold text-base truncate text-foreground">{note.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {getContentPreview(note.content)}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => handlePinNote(e, note.id, note.is_pinned)}>
                              <Pin className="mr-2 h-4 w-4" />
                              {note.is_pinned ? 'Unpin note' : 'Pin note'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleArchiveNote(e, note.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive note
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteNote(e, note.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Program association */}
                    {note.program_id && (
                      <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full inline-block">
                        📚 {getProgramName(note.program_id)}
                      </div>
                    )}

                    {/* AI Summary preview */}
                    {note.ai_summary && (
                      <div className="bg-muted rounded-lg p-3 text-xs border">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-foreground">AI Summary</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">{note.ai_summary}</p>
                      </div>
                    )}

                    {/* Footer with metadata */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs h-5 px-2">
                          {getContextIcon(note.context_type)}
                          <span className="ml-1">{note.context_type}</span>
                        </Badge>
                        {note.priority_score > 6 && (
                          <Badge variant="secondary" className="text-xs h-5 px-2">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(note.updated_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            {(searchTerm || contextFilter !== "all") ? (
              <p className="text-sm">Try adjusting your search or filters</p>
            ) : (
              <p className="text-sm">Start by creating your first note</p>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default NotesTimeline;
