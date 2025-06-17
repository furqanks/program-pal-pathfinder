
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Save, 
  FileText,
  Hash,
  Calendar,
  Sparkles
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SimpleNotesEditorProps {
  selectedNote?: any;
  onNoteCreated?: () => void;
  onNoteUpdated?: () => void;
}

const SimpleNotesEditor = ({ selectedNote, onNoteCreated, onNoteUpdated }: SimpleNotesEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [organizedOutput, setOrganizedOutput] = useState("");
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const { addNote, updateNote } = useAINotesContext();
  const { tags } = useTagContext();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setSelectedTags(selectedNote.tags || []);
      setOrganizedOutput(selectedNote.ai_summary || "");
    } else {
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setOrganizedOutput("");
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [selectedNote]);

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
        context_type: "general",
        tags: selectedTags,
        ai_summary: organizedOutput || undefined
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
        setSelectedTags([]);
        setOrganizedOutput("");
      }
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrganize = async () => {
    if (!content.trim()) {
      toast.error("Please add some content to organize");
      return;
    }

    setIsOrganizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('organize-notes', {
        body: {
          rawNotes: content.trim(),
          noteTitle: title.trim() || "Untitled Note"
        }
      });

      if (error) throw error;

      if (data?.organizedOutput) {
        setOrganizedOutput(data.organizedOutput);
        toast.success("Notes organized successfully!");
      } else {
        throw new Error("No organized output received");
      }
    } catch (error) {
      console.error("Error organizing notes:", error);
      toast.error("Failed to organize notes. Please try again.");
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Render markdown content
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Simple markdown rendering for headers, tables, and lists
    const lines = text.split('\n');
    const rendered: JSX.Element[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: JSX.Element[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('### ')) {
        rendered.push(<h3 key={i} className="text-lg font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('## ')) {
        rendered.push(<h2 key={i} className="text-xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('# ')) {
        rendered.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>);
      }
      // Table detection
      else if (line.includes('|') && line.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableHeaders = line.split('|').map(h => h.trim()).filter(h => h);
          tableRows = [];
        } else if (!line.includes('---')) {
          const cells = line.split('|').map(c => c.trim()).filter(c => c);
          if (cells.length > 0) {
            tableRows.push(
              <tr key={`row-${i}`}>
                {cells.map((cell, idx) => (
                  <td key={idx} className="border border-border px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            );
          }
        }
      } else if (inTable && (!line.includes('|') || line.trim() === '')) {
        // End table and render it
        rendered.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className="border border-border px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
      // Bullet points
      else if (line.startsWith('* ')) {
        rendered.push(
          <li key={i} className="ml-4 mb-1 list-disc">
            {line.replace('* ', '')}
          </li>
        );
      }
      // Regular paragraphs
      else if (line.trim() && !line.includes('---')) {
        rendered.push(<p key={i} className="mb-2">{line}</p>);
      }
    }
    
    // Close any open table
    if (inTable && tableHeaders.length > 0) {
      rendered.push(
        <div key="final-table" className="my-4 overflow-x-auto">
          <table className="w-full border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="border border-border px-3 py-2 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </div>
      );
    }
    
    return <div className="prose prose-sm max-w-none">{rendered}</div>;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {selectedNote 
                ? `Editing • Last saved ${new Date(selectedNote.updated_at).toLocaleDateString()}` 
                : "New note"
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOrganize}
              disabled={isOrganizing || !content.trim()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isOrganizing ? "Organizing..." : "Organize"}
            </Button>
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

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 8).map(tag => (
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
        )}
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-3xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 mb-6"
          />

          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your notes here...

You can write about:
• Universities and programs you're researching
• Application requirements and deadlines  
• Scholarship opportunities
• Personal preferences and criteria
• Tasks and next steps

Click 'Organize' when you're ready to structure your notes!"
            className="w-full text-lg border-none shadow-none p-0 min-h-[400px] resize-none focus:outline-none bg-transparent placeholder:text-muted-foreground/40 leading-relaxed font-mono"
          />

          {/* Organized Output */}
          {organizedOutput && (
            <Card className="mt-8 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Organized Notes</h3>
              </div>
              <div className="border-t pt-4">
                {renderMarkdown(organizedOutput)}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleNotesEditor;
