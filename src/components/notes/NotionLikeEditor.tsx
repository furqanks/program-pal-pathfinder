
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

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
  ArrowLeft,
  Trash2
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
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const { addNote, updateNote, analyzeNote, deleteNote } = useAINotesContext();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setContextType(selectedNote.context_type || "general");
      setProgramId(selectedNote.program_id || "");
      setSelectedTags(selectedNote.tags || []);
      
      // Set formatted content in the contentRef
      if (contentRef.current && selectedNote.content) {
        contentRef.current.innerHTML = processMarkdownContent(selectedNote.content);
      }
    } else {
      setTitle("");
      setContent("");
      setContextType("general");
      setProgramId("");
      setSelectedTags([]);
      if (contentRef.current) {
        contentRef.current.innerHTML = "";
      }
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
    // Get content from the contentEditable div
    const contentFromDiv = contentRef.current?.innerText || "";
    
    if (!title.trim() || !contentFromDiv.trim()) {
      toast.error("Please add both a title and content");
      return;
    }

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: contentFromDiv.trim(),
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
        if (contentRef.current) {
          contentRef.current.innerHTML = "";
        }
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

  const handleDelete = async () => {
    if (!selectedNote?.id) return;
    
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await deleteNote(selectedNote.id);
        onBackToTimeline?.();
        toast.success('Note deleted successfully');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Process markdown for preview
  const processMarkdownContent = (text: string) => {
    if (!text) return "";
    
    let processed = text
      .replace(/^#+\s+(.+)$/gm, (match, content) => {
        const level = match.match(/^#+/)?.[0].length || 3;
        const className = level === 1 ? 'text-3xl font-bold mb-4 mt-6' : 
                         level === 2 ? 'text-2xl font-bold mb-3 mt-5' : 
                         level === 3 ? 'text-xl font-semibold mb-3 mt-4' :
                         'text-lg font-semibold mb-2 mt-3';
        return `<h${Math.min(level, 6)} class="${className}">${content.trim()}</h${Math.min(level, 6)}>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      .replace(/^[\s]*-[\s]+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
        return `<ul class="list-disc mb-4 space-y-1">${match}</ul>`;
      })
      .replace(/^[\s]*\d+\.[\s]+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
        if (!match.includes('list-disc')) {
          return `<ol class="list-decimal mb-4 space-y-1">${match}</ol>`;
        }
        return match;
      });

    // Split into paragraphs and wrap them
    const paragraphs = processed.split(/\n\s*\n/);
    processed = paragraphs.map(para => {
      para = para.trim();
      if (para && !para.includes('<h') && !para.includes('<ul') && !para.includes('<ol')) {
        return `<p class="mb-4 leading-relaxed">${para.replace(/\n/g, '<br>')}</p>`;
      }
      return para;
    }).join('\n');
    
    return processed;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top bar with actions - hidden on mobile */}
      {!isMobile && (
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
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
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
            </div>
            
            <div className="flex items-center gap-2">
              {selectedNote && (
                <>
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </>
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
        </div>
      )}

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

          {/* Content - WYSIWYG Editor */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning={true}
            className="min-h-[400px] sm:min-h-[600px] outline-none text-sm sm:text-base leading-relaxed focus:outline-none"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', lineHeight: '1.6' }}
            onInput={(e) => {
              const target = e.target as HTMLDivElement;
              setContent(target.innerText);
            }}
            data-placeholder="Start writing..."
          />

          {/* AI Summary and Insights Display */}
          <AISummaryDisplay note={selectedNote} />
        </div>
      </div>
    </div>
  );
};

export default NotionLikeEditor;
