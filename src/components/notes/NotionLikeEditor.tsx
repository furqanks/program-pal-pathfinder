
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Calendar, 
  Hash, 
  Save, 
  Sparkles,
  Clock,
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Plus
} from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";

interface NotionLikeEditorProps {
  selectedNote?: any;
  onNoteCreated?: () => void;
  onNoteUpdated?: () => void;
}

const NotionLikeEditor = ({ selectedNote, onNoteCreated, onNoteUpdated }: NotionLikeEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextType, setContextType] = useState("general");
  const [programId, setProgramId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const { addNote, updateNote, analyzeNote } = useAINotesContext();

  // Load selected note data
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setContextType(selectedNote.context_type || "general");
      setProgramId(selectedNote.program_id || "");
      setSelectedTags(selectedNote.tags || []);
    } else {
      // Clear form for new note
      setTitle("");
      setContent("");
      setContextType("general");
      setProgramId("");
      setSelectedTags([]);
    }
  }, [selectedNote]);

  const getContextIcon = (context: string) => {
    switch (context) {
      case "academic": return <BookOpen className="h-4 w-4" />;
      case "application": return <Target className="h-4 w-4" />;
      case "financial": return <DollarSign className="h-4 w-4" />;
      case "research": return <Archive className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please add both a title and content");
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      context_type: contextType,
      program_id: programId || undefined,
      tags: selectedTags
    };

    if (selectedNote) {
      await updateNote(selectedNote.id, noteData);
      onNoteUpdated?.();
      toast.success("Note updated successfully");
    } else {
      await addNote(noteData);
      onNoteCreated?.();
      toast.success("Note created successfully");
      // Clear form after creating
      setTitle("");
      setContent("");
      setContextType("general");
      setProgramId("");
      setSelectedTags([]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedNote?.id) {
      toast.error("Please save the note first to analyze it");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      await analyzeNote(selectedNote.id);
      toast.success("Note analyzed successfully");
    } catch (error) {
      toast.error("Failed to analyze note");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with metadata */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedNote ? `Updated ${new Date(selectedNote.updated_at).toLocaleDateString()}` : "New note"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedNote && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "AI Analyze"}
              </Button>
            )}
            <Button onClick={handleSave} size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {getContextIcon(contextType)}
            <Select value={contextType} onValueChange={setContextType}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Link to program..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No program</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>
                  {program.programName} - {program.university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 5).map(tag => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer text-xs h-6"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Title */}
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-3xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
            style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
          />

          {/* Content */}
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="mt-6 text-base border-none shadow-none p-0 min-h-96 resize-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
            style={{ fontSize: '1rem', lineHeight: '1.6' }}
          />

          {/* AI Summary Display */}
          {selectedNote?.ai_summary && (
            <Card className="mt-8 border-l-4 border-l-purple-500">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm text-purple-800">AI Summary</span>
                </div>
                <p className="text-sm text-purple-700">{selectedNote.ai_summary}</p>
              </div>
            </Card>
          )}

          {/* AI Insights */}
          {selectedNote?.ai_insights && Object.keys(selectedNote.ai_insights).length > 0 && (
            <Card className="mt-4 border-l-4 border-l-amber-500">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-sm text-amber-800">AI Insights</span>
                </div>
                <div className="space-y-2 text-sm text-amber-700">
                  {selectedNote.ai_insights.key_insights && (
                    <div>
                      <strong>Key Insights:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {selectedNote.ai_insights.key_insights.map((insight: string, index: number) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedNote.ai_insights.next_steps && (
                    <div>
                      <strong>Next Steps:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {selectedNote.ai_insights.next_steps.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionLikeEditor;
