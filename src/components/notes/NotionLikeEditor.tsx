import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

import { 
  Save, 
  Sparkles,
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Hash,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";

interface NotionLikeEditorProps {
  selectedNote?: any;
  onNoteCreated?: () => void;
  onNoteUpdated?: () => void;
  onNoteSelect?: (note: any) => void;
  onBackToTimeline?: () => void;
}

const NotionLikeEditor = ({ selectedNote, onNoteCreated, onNoteUpdated, onNoteSelect, onBackToTimeline }: NotionLikeEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextType, setContextType] = useState("general");
  const [programId, setProgramId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const { addNote, updateNote, deleteNote } = useAINotesContext();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setContextType(selectedNote.context_type || "general");
      setProgramId(selectedNote.program_id || "");
      setSelectedTags(selectedNote.tags || []);
      
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
        const newNote = await addNote(noteData);
        onNoteCreated?.();
        toast.success("Note created");
        // Keep the new note in the editor
        if (onNoteSelect && newNote) {
          onNoteSelect(newNote);
        }
      }
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote?.id) return;
    
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await deleteNote(selectedNote.id);
        // Clear the editor
        setTitle("");
        setContent("");
        if (contentRef.current) {
          contentRef.current.innerHTML = "";
        }
        setContextType("general");
        setProgramId("");
        setSelectedTags([]);
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
      });

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
      {/* Compact toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getContextIcon(contextType)}
            <Select value={contextType} onValueChange={setContextType}>
              <SelectTrigger className="w-32 h-8 text-sm border-0 bg-accent/50 hover:bg-accent">
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
            <SelectTrigger className="w-48 h-8 text-sm border-0 bg-accent/50 hover:bg-accent">
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
        
        <div className="flex items-center gap-2">
          {selectedNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline ml-2">Delete</span>
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
      <div className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-3xl md:text-4xl lg:text-5xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 mb-6"
            style={{ 
              fontSize: 'clamp(1.875rem, 4vw, 3rem)', 
              lineHeight: '1.1', 
              fontWeight: '700' 
            }}
          />

          {/* Tags section */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.slice(0, 12).map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer text-sm px-3 py-1 hover:shadow-sm transition-all"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Content editor */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning={true}
            className="min-h-[500px] outline-none text-base leading-relaxed focus:outline-none prose prose-lg max-w-none"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', lineHeight: '1.7' }}
            onInput={(e) => {
              const target = e.target as HTMLDivElement;
              setContent(target.innerText);
            }}
            data-placeholder="Start writing your note..."
          />

          {/* Writing suggestions */}
          {!selectedNote && !title && !content && (
            <div className="mt-12 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-lg mb-2">Start writing your note</h3>
                <p className="text-muted-foreground mb-4">
                  I'll provide contextual AI assistance as you write.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Application essays</Badge>
                  <Badge variant="outline">Research notes</Badge>
                  <Badge variant="outline">Meeting summaries</Badge>
                  <Badge variant="outline">Project planning</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionLikeEditor;
