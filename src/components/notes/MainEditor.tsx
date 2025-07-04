
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { 
  Save, 
  Sparkles,
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Hash,
  Brain,
  Pin,
  Calendar
} from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";
import AISummaryDisplay from "./AISummaryDisplay";

interface MainEditorProps {
  selectedNote?: any;
  onNoteCreated?: () => void;
  onNoteUpdated?: () => void;
}

const MainEditor = ({ selectedNote, onNoteCreated, onNoteUpdated }: MainEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextType, setContextType] = useState("general");
  const [programId, setProgramId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const { addNote, updateNote, analyzeNote } = useAINotesContext();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setContextType(selectedNote.context_type || "general");
      setProgramId(selectedNote.program_id || "");
      setSelectedTags(selectedNote.tags || []);
    } else {
      // Don't clear when no note is selected - keep it as working space
      if (!title && !content) {
        setTimeout(() => titleRef.current?.focus(), 100);
      }
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

    setIsSaving(true);
    try {
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
        toast.success("Note updated");
      } else {
        await addNote(noteData);
        onNoteCreated?.();
        toast.success("Note created");
        // Clear form after creating
        setTitle("");
        setContent("");
        setContextType("general");
        setProgramId("");
        setSelectedTags([]);
      }
      setLastSaved(new Date());
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
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

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    return `Saved at ${lastSaved.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Toolbar */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {selectedNote 
                ? `Editing • Last saved ${new Date(selectedNote.updated_at).toLocaleDateString()}` 
                : "New note"
              }
            </span>
            {lastSaved && (
              <span className="text-green-600">• {formatLastSaved()}</span>
            )}
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
            <Button 
              onClick={handleSave} 
              size="sm"
              disabled={isSaving || (!title.trim() && !content.trim())}
              className="bg-primary text-primary-foreground"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Metadata Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {getContextIcon(contextType)}
            <Select value={contextType} onValueChange={setContextType}>
              <SelectTrigger className="w-32 h-8 text-xs border-0 bg-gray-50 shadow-sm">
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
            <SelectTrigger className="w-48 h-8 text-xs border-0 bg-gray-50 shadow-sm">
              <SelectValue placeholder="Link to program..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No program</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>
                  {program.programName} - {program.university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 6).map(tag => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer text-xs h-6 hover:shadow-sm transition-shadow"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto p-8">
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 mb-8"
            style={{ fontSize: '2.5rem', lineHeight: '3rem' }}
          />

          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            className="text-lg border-none shadow-none p-0 min-h-[500px] resize-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 leading-relaxed"
            style={{ fontSize: '1.125rem', lineHeight: '1.75' }}
          />

          {/* AI Insights Display */}
          <AISummaryDisplay note={selectedNote} />
        </div>
      </div>
    </div>
  );
};

export default MainEditor;
