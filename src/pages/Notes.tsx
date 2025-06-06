import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Plus, Search, Sparkles, Brain, Tag, BookOpen, Wand2, Trash2, Edit2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InsightsDashboard from "@/components/notes/InsightsDashboard";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("no-program");
  const [editingNote, setEditingNote] = useState<any>(null);
  const isMobile = useIsMobile();

  const { notes, addNote, updateNote, deleteNote, analyzeNote, analyzeAllNotes, loading } = useAINotesContext();
  const { programs } = useProgramContext();

  const filteredGeneralNotes = notes.filter(note =>
    note.context_type === "general" &&
    (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredProgramNotes = notes.filter(note =>
    (note.context_type === "application" || note.context_type === "academic" || note.program_id) &&
    (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleCreateNote = async () => {
    if (!currentNote.trim()) {
      toast.error("Please write something first!");
      return;
    }
    
    const title = noteTitle.trim() || "Untitled Note";
    const contextType = selectedProgramId !== "no-program" ? "application" : "general";
    
    await addNote({
      title,
      content: currentNote.trim(),
      program_id: selectedProgramId !== "no-program" ? selectedProgramId : undefined,
      tags: [],
      context_type: contextType,
      ai_summary: undefined,
      last_ai_analysis: undefined
    });
    
    setCurrentNote("");
    setNoteTitle("");
    setSelectedProgramId("no-program");
  };

  const handleAIAction = async (action: string, noteId?: string) => {
    if (!currentNote.trim() && !noteId) {
      toast.error("Please write a note first to use AI features!");
      return;
    }
    
    if (action === "analyze_all") {
      await analyzeAllNotes();
      return;
    }
    
    if (noteId) {
      await analyzeNote(noteId);
    } else {
      // For current note, save it first then analyze
      await handleCreateNote();
      // The newly created note will be analyzed automatically
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setCurrentNote(note.content);
    setSelectedProgramId(note.program_id || "no-program");
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !currentNote.trim()) {
      toast.error("Please write something first!");
      return;
    }
    
    await updateNote(editingNote.id, {
      title: noteTitle.trim() || "Untitled Note",
      content: currentNote.trim(),
      program_id: selectedProgramId !== "no-program" ? selectedProgramId : undefined,
      updated_at: new Date().toISOString()
    });
    
    setEditingNote(null);
    setCurrentNote("");
    setNoteTitle("");
    setSelectedProgramId("no-program");
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
  };

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.programName} - ${program.university}` : "Unknown Program";
  };

  const getInsightColor = (categories: string[]) => {
    if (categories.includes("academic")) return "bg-blue-50 border-blue-200";
    if (categories.includes("financial")) return "bg-green-50 border-green-200";
    if (categories.includes("application")) return "bg-purple-50 border-purple-200";
    if (categories.includes("research")) return "bg-rose-50 border-rose-200";
    return "bg-gray-50 border-gray-200";
  };

  const getTagColor = (categories: string[]) => {
    if (categories.includes("academic")) return "bg-blue-100 text-blue-800";
    if (categories.includes("financial")) return "bg-green-100 text-green-800";
    if (categories.includes("application")) return "bg-purple-100 text-purple-800";
    if (categories.includes("research")) return "bg-rose-100 text-rose-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI-Powered Notes
          </h1>
          <p className="text-gray-600 text-lg">
            Capture, analyze, and enhance your thoughts with intelligent assistance
          </p>
        </div>

        {/* Writing Area */}
        <Card className="border-2 border-dashed border-blue-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-blue-700">
              <StickyNote className="h-6 w-6" />
              {editingNote ? "Edit Note" : "Quick Note"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Give your note a title (optional)..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
            <Textarea
              placeholder="Start writing your thoughts..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              rows={6}
              className="border-blue-200 focus:border-blue-400 resize-none"
            />
            
            {/* Program Selection */}
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Link to a program (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-program">No Program</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.programName} - {program.university}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Action Buttons */}
            <div className={cn(
              "flex gap-2 pt-4",
              isMobile ? "flex-col" : "flex-row flex-wrap"
            )}>
              <Button 
                onClick={editingNote ? handleUpdateNote : handleCreateNote} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!currentNote.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
              
              {editingNote && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingNote(null);
                    setCurrentNote("");
                    setNoteTitle("");
                    setSelectedProgramId("no-program");
                  }}
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("summarize")}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                disabled={!currentNote.trim()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("analyze")}
                className="border-green-200 text-green-700 hover:bg-green-50"
                disabled={!currentNote.trim()}
              >
                <Brain className="mr-2 h-4 w-4" />
                Analyze
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("enhance")}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                disabled={!currentNote.trim()}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Enhance
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("analyze_all")}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled={notes.length === 0}
              >
                <Tag className="mr-2 h-4 w-4" />
                Analyze All Notes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search through your notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              General Notes ({filteredGeneralNotes.length})
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Program Notes ({filteredProgramNotes.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            {filteredGeneralNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGeneralNotes.map((note) => (
                  <Card key={note.id} className={cn(
                    "hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105",
                    getInsightColor(note.ai_categories || [])
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2 text-gray-800">
                          {note.title}
                        </CardTitle>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {note.ai_summary || note.content}
                      </p>
                      
                      {note.ai_categories && note.ai_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.ai_categories.map((category: string, index: number) => (
                            <Badge
                              key={index}
                              className={cn("text-xs", getTagColor(note.ai_categories || []))}
                              variant="secondary"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {note.priority_score > 0 && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs">
                            Priority: {note.priority_score}/10
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAIAction("analyze", note.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Brain className="mr-1 h-3 w-3" />
                          Re-analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState type="general" />
            )}
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            {filteredProgramNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProgramNotes.map((note) => (
                  <Card key={note.id} className={cn(
                    "hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105",
                    getInsightColor(note.ai_categories || [])
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2 text-gray-800">
                          {note.title}
                        </CardTitle>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {note.ai_summary || note.content}
                      </p>
                      
                      {note.program_id && (
                        <p className="text-xs text-blue-600 font-medium mb-2">
                          📚 {getProgramName(note.program_id)}
                        </p>
                      )}
                      
                      {note.ai_categories && note.ai_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.ai_categories.map((category: string, index: number) => (
                            <Badge
                              key={index}
                              className={cn("text-xs", getTagColor(note.ai_categories || []))}
                              variant="secondary"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {note.priority_score > 0 && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs">
                            Priority: {note.priority_score}/10
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAIAction("analyze", note.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Brain className="mr-1 h-3 w-3" />
                          Re-analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState type="programs" />
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <InsightsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const EmptyState = ({ type }: { type: "general" | "programs" }) => (
  <Card className="bg-white/70 backdrop-blur-sm">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <StickyNote className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No {type} notes found</h3>
      <p className="text-gray-600 text-center mb-4">
        {type === "general" 
          ? "Start capturing your thoughts and ideas in the writing area above."
          : "Create notes related to specific programs and applications."
        }
      </p>
    </CardContent>
  </Card>
);

export default Notes;
