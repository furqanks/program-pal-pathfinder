
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
  onBackToTimeline?: () => void;
}

const NotionLikeEditor = ({ selectedNote, onNoteCreated, onNoteUpdated }: NotionLikeEditorProps) => {
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
    <div className="h-full flex flex-col bg-white">
      {/* Simple top bar with actions */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getContextIcon(contextType)}
            <Select value={contextType} onValueChange={setContextType}>
              <SelectTrigger className="w-32 h-8 text-sm border-0 bg-gray-50 hover:bg-gray-100">
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
            <SelectTrigger className="w-48 h-8 text-sm border-0 bg-gray-50 hover:bg-gray-100">
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
        </div>
        
        <div className="flex items-center gap-2">
          {selectedNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="h-8"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            size="sm"
            disabled={isSaving}
            className="h-8 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main editor area - Notion style */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-24 py-16">
          {/* Title */}
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-5xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-gray-300 mb-4"
            style={{ fontSize: '3rem', lineHeight: '1.1', fontWeight: '700' }}
          />

          {/* Tags section */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.slice(0, 8).map(tag => (
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

          {/* Content */}
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="text-base border-none shadow-none p-0 min-h-[600px] resize-none focus-visible:ring-0 bg-transparent placeholder:text-gray-400 leading-relaxed"
            style={{ fontSize: '1rem', lineHeight: '1.6' }}
          />

          {/* AI Summary Display */}
          {selectedNote?.ai_summary && (
            <Card className="mt-16 border border-purple-200 bg-purple-50/30">
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

          {selectedNote?.ai_insights && Object.keys(selectedNote.ai_insights).length > 0 && (
            <Card className="mt-6 border border-amber-200 bg-amber-50/30">
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
