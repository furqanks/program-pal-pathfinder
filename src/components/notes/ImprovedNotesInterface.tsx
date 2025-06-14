
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search,
  Plus,
  FileText,
  Clock,
  Pin,
  Filter,
  Brain,
  Sparkles,
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Hash
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AISummaryCard from "./AISummaryCard";
import NotionLikeEditor from "./NotionLikeEditor";

const ImprovedNotesInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { notes, analyzeNote } = useAINotesContext();
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

  const handleNoteSelect = (note: any) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
  };

  const handleBackToList = () => {
    setShowEditor(false);
    setSelectedNote(null);
  };

  const handleAnalyzeNote = async (noteId: string) => {
    await analyzeNote(noteId);
  };

  if (showEditor) {
    return (
      <NotionLikeEditor
        selectedNote={selectedNote}
        onNoteCreated={handleBackToList}
        onNoteUpdated={handleBackToList}
        onBackToTimeline={handleBackToList}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Notes</h1>
            <p className="text-sm text-muted-foreground">
              Capture ideas with AI-powered insights
            </p>
          </div>
          <Button onClick={handleNewNote} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={contextFilter} onValueChange={setContextFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All contexts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contexts</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-hidden">
        {filteredNotes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-6">
                Start capturing your thoughts and get AI-powered insights automatically.
              </p>
              <Button onClick={handleNewNote} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create your first note
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="space-y-3">
                  {/* Main Note Card */}
                  <Card 
                    className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      note.is_pinned ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                    onClick={() => handleNoteSelect(note)}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {note.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                            <h3 className="font-semibold text-lg truncate">{note.title}</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed line-clamp-3">
                            {note.content}
                          </p>
                        </div>
                      </div>

                      {/* Program Link */}
                      {note.program_id && (
                        <div className="inline-flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          <BookOpen className="h-3 w-3" />
                          {getProgramName(note.program_id)}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {getContextIcon(note.context_type)}
                            <span className="ml-1">{note.context_type}</span>
                          </Badge>
                          {note.priority_score > 6 && (
                            <Badge variant="secondary" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(note.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI Summary - Displayed separately for better visibility */}
                  {note.ai_summary && (
                    <AISummaryCard
                      summary={note.ai_summary}
                      insights={note.ai_insights}
                      confidence={note.confidence_score}
                      onRegenerate={() => handleAnalyzeNote(note.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ImprovedNotesInterface;
