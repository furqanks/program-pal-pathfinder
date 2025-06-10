
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
  ArrowLeft,
  MoreHorizontal,
  Pin,
  Share
} from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
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
      // Focus title input for new notes
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
    <div className="h-full flex flex-col bg-white">
      {/* Top Action Bar */}
      <div className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToTimeline}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {selectedNote 
                  ? `Last edited ${new Date(selectedNote.updated_at).toLocaleDateString()}` 
                  : "New note"
                }
              </span>
              {lastSaved && (
                <span className="text-green-600">• {formatLastSaved()}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedNote && (
              <>
                <Button variant="ghost" size="sm">
                  <Pin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </>
            )}
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
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="border-b bg-gray-50/50 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {getContextIcon(contextType)}
            <Select value={contextType} onValueChange={setContextType}>
              <SelectTrigger className="w-32 h-8 text-xs border-0 bg-white shadow-sm">
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
            <SelectTrigger className="w-48 h-8 text-xs border-0 bg-white shadow-sm">
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

      {/* Main editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Title */}
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 mb-8"
            style={{ fontSize: '2.5rem', lineHeight: '3rem' }}
          />

          {/* Content */}
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="text-lg border-none shadow-none p-0 min-h-[500px] resize-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 leading-relaxed"
            style={{ fontSize: '1.125rem', lineHeight: '1.75' }}
          />

          {/* AI Summary Display */}
          {selectedNote?.ai_summary && (
            <Card className="mt-12 border-l-4 border-l-purple-500 shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800">AI Summary</h3>
                    <p className="text-sm text-purple-600">Generated insights from your note</p>
                  </div>
                </div>
                <p className="text-purple-700 leading-relaxed">{selectedNote.ai_summary}</p>
              </div>
            </Card>
          )}

          {/* AI Insights */}
          {selectedNote?.ai_insights && Object.keys(selectedNote.ai_insights).length > 0 && (
            <Card className="mt-6 border-l-4 border-l-amber-500 shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">Key Insights</h3>
                    <p className="text-sm text-amber-600">AI-powered analysis and recommendations</p>
                  </div>
                </div>
                <div className="space-y-4 text-amber-700">
                  {selectedNote.ai_insights.key_insights && (
                    <div>
                      <h4 className="font-medium mb-2">Key Insights:</h4>
                      <ul className="space-y-1">
                        {selectedNote.ai_insights.key_insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedNote.ai_insights.next_steps && (
                    <div>
                      <h4 className="font-medium mb-2">Recommended Next Steps:</h4>
                      <ul className="space-y-1">
                        {selectedNote.ai_insights.next_steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{step}</span>
                          </li>
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
