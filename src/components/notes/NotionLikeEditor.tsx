
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
  BookOpen,
  Target,
  DollarSign,
  Archive,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";
import AISummaryDisplay from "./AISummaryDisplay";

interface NotionLikeEditorProps {
  selectedNote?: any;
  onNoteCreated?: () => void;
  onNoteUpdated?: () => void;
  onBackToTimeline?: () => void;
}

const NotionLikeEditor = ({ selectedNote, onNoteCreated, onNoteUpdated, onBackToTimeline }: NotionLikeEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextType, setContextType] = useState("general");
  const [programId, setProgramId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
      setTitle("");
      setContent("");
      setContextType("general");
      setProgramId("");
      setSelectedTags([]);
      setTimeout(() => titleRef.current?.focus(), 100);
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
        program_id: programId === "none" ? undefined : programId || undefined,
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
        setTitle("");
        setContent("");
        setContextType("general");
        setProgramId("");
        setSelectedTags([]);
      }
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top bar with actions */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-border bg-card/50">
        {/* First row - Context and Program selectors */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            {getContextIcon(contextType)}
            <Select value={contextType} onValueChange={setContextType}>
              <SelectTrigger className="w-full sm:w-32 h-8 text-sm border-0 bg-accent/50 hover:bg-accent">
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
            <SelectTrigger className="w-full sm:w-64 h-8 text-sm border-0 bg-accent/50 hover:bg-accent">
              <SelectValue placeholder="Link to program..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No program</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>
                  <span className="truncate">{program.programName} - {program.university}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Second row - Action buttons */}
        <div className="flex items-center gap-2 justify-end">
          {onBackToTimeline && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToTimeline}
              className="h-8 text-sm border-border hover:bg-accent md:hidden"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back
            </Button>
          )}
          
          {selectedNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="h-8 text-sm"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              <span className="hidden sm:inline">{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
              <span className="sm:hidden">{isAnalyzing ? "..." : "AI"}</span>
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            size="sm"
            disabled={isSaving}
            className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          >
            <Save className="mr-2 h-3 w-3" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 py-8 sm:py-12 md:py-16">
          {/* Title */}
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 mb-4"
            style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 3rem)', 
              lineHeight: '1.1', 
              fontWeight: '700' 
            }}
          />

          {/* Tags section */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 sm:mb-8">
              {tags.slice(0, 8).map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1 hover:shadow-sm transition-all"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Content */}
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="text-sm sm:text-base border-none shadow-none p-0 min-h-[400px] sm:min-h-[600px] resize-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/70 leading-relaxed"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', lineHeight: '1.6' }}
          />

          {/* AI Summary and Insights Display */}
          <AISummaryDisplay note={selectedNote} />
        </div>
      </div>
    </div>
  );
};

export default NotionLikeEditor;
