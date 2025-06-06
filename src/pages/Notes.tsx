import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Plus, Search, Sparkles, Brain, Tag, BookOpen, Wand2, Trash2, Edit2, BarChart3, TrendingUp, Zap, Star, Flame } from "lucide-react";
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
import NotesTimeline from "@/components/notes/NotesTimeline";
import EnhancedInsights from "@/components/notes/EnhancedInsights";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("no-program");
  const [editingNote, setEditingNote] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
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
      setAnalyzing("all");
      try {
        await analyzeAllNotes();
        toast.success("All notes analyzed successfully!");
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error("Failed to analyze notes");
      } finally {
        setAnalyzing(null);
      }
      return;
    }
    
    if (noteId) {
      setAnalyzing(noteId);
      try {
        await analyzeNote(noteId);
        toast.success("Note analyzed successfully!");
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error("Failed to analyze note");
      } finally {
        setAnalyzing(null);
      }
    } else {
      // For current note, save it first then analyze
      await handleCreateNote();
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

  const getPriorityColor = (score: number) => {
    if (score >= 8) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 6) return "bg-orange-100 text-orange-800 border-orange-200";
    if (score >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return "High Priority";
    if (score >= 6) return "Medium Priority";
    if (score >= 4) return "Low Priority";
    return "Normal";
  };

  if (loading) {
    return (
      <div className="min-h-screen gen-z-gradient-lavender p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-border mx-auto mb-6">
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
            <Sparkles className="absolute top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-gen-z-neon-pink animate-pulse" />
          </div>
          <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gen-z-gradient-lavender p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-gen-z-electric animate-pulse" />
            <Sparkles className="h-8 w-8 text-gen-z-neon-pink animate-bounce" />
            <Star className="h-6 w-6 text-gen-z-cyber-yellow animate-pulse delay-300" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            AI-Powered Notes ✨
          </h1>
          <p className="text-gray-700 text-xl font-medium">
            Capture your thoughts, let AI work its magic 🧠💫
          </p>
        </div>

        {/* Writing Area */}
        <Card className="border-4 border-transparent gen-z-gradient-electric p-[3px] rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-white rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="relative">
                  <StickyNote className="h-7 w-7 text-gen-z-electric" />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-gen-z-neon-pink animate-bounce" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-black">
                  {editingNote ? "Edit Note ✏️" : "Quick Note 📝"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Input
                placeholder="Give your note a catchy title... ✨"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="border-2 border-purple-200 focus:border-gen-z-electric text-lg font-medium rounded-xl"
              />
              <Textarea
                placeholder="Spill your thoughts here... 💭"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                rows={6}
                className="border-2 border-purple-200 focus:border-gen-z-electric resize-none text-lg rounded-xl"
              />
              
              {/* Program Selection */}
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger className="border-2 border-purple-200 focus:border-gen-z-electric rounded-xl">
                  <SelectValue placeholder="Link to a program (optional) 📚" />
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
                "flex gap-3 pt-4",
                isMobile ? "flex-col" : "flex-row flex-wrap"
              )}>
                <Button 
                  onClick={editingNote ? handleUpdateNote : handleCreateNote} 
                  className="gen-z-gradient-electric text-white border-0 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  disabled={!currentNote.trim()}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {editingNote ? "Update Note 🔄" : "Save Note 💾"}
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
                    className="border-2 border-gray-300 font-bold rounded-xl"
                  >
                    Cancel ❌
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => handleAIAction("summarize")}
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold rounded-xl"
                  disabled={!currentNote.trim() || analyzing === "current"}
                >
                  {analyzing === "current" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                  )}
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summarize ✨
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAIAction("analyze")}
                  className="border-2 border-green-300 text-green-700 hover:bg-green-50 font-bold rounded-xl"
                  disabled={!currentNote.trim() || analyzing === "current"}
                >
                  {analyzing === "current" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  )}
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze 🧠
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAIAction("enhance")}
                  className="border-2 border-pink-300 text-pink-700 hover:bg-pink-50 font-bold rounded-xl"
                  disabled={!currentNote.trim() || analyzing === "current"}
                >
                  {analyzing === "current" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
                  )}
                  <Wand2 className="mr-2 h-4 w-4" />
                  Enhance 🪄
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAIAction("analyze_all")}
                  className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-bold rounded-xl"
                  disabled={notes.length === 0 || analyzing === "all"}
                >
                  {analyzing === "all" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                  )}
                  <Flame className="mr-2 h-4 w-4" />
                  Analyze All Notes 🔥
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Search Bar */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-xl shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gen-z-electric" />
              <Input
                placeholder="Search through your genius notes... 🔍"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 border-0 bg-transparent text-lg font-medium focus:ring-2 focus:ring-gen-z-electric"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-xl p-2 shadow-lg">
            <TabsTrigger value="general" className="flex items-center gap-2 font-bold rounded-lg data-[state=active]:gen-z-gradient-electric data-[state=active]:text-white">
              <StickyNote className="h-4 w-4" />
              General ({filteredGeneralNotes.length})
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2 font-bold rounded-lg data-[state=active]:gen-z-gradient-mint data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              Programs ({filteredProgramNotes.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2 font-bold rounded-lg data-[state=active]:gen-z-gradient-sunset data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 font-bold rounded-lg data-[state=active]:gen-z-gradient-lavender data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            {filteredGeneralNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGeneralNotes.map((note) => (
                  <Card key={note.id} className={cn(
                    "hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-3 rounded-xl overflow-hidden group",
                    "bg-gradient-to-br from-white to-purple-50 border-purple-200 hover:border-gen-z-electric"
                  )}>
                    <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2 font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {note.title}
                        </CardTitle>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAIAction("analyze", note.id)}
                            className="h-8 w-8 p-0 hover:bg-purple-100 rounded-lg"
                            disabled={analyzing === note.id}
                            title="Analyze with AI"
                          >
                            {analyzing === note.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                            ) : (
                              <Brain className="h-4 w-4 text-gen-z-electric" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4 text-gen-z-mint" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-gen-z-coral" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4 font-medium">
                        {note.content}
                      </p>
                      
                      {/* AI Summary */}
                      {note.ai_summary && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-gen-z-electric" />
                            <span className="text-sm font-bold text-purple-800">AI Summary ✨</span>
                          </div>
                          <p className="text-sm text-purple-700 font-medium">{note.ai_summary}</p>
                        </div>
                      )}
                      
                      {/* AI Categories */}
                      {note.ai_categories && note.ai_categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {note.ai_categories.map((category: string, index: number) => (
                            <Badge
                              key={index}
                              className={cn("text-xs font-bold rounded-lg border-2", getTagColor([category]))}
                              variant="secondary"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Priority Score */}
                      {note.priority_score > 0 && (
                        <div className="mb-3">
                          <Badge 
                            className={cn("text-xs font-bold border-2 rounded-lg", getPriorityColor(note.priority_score))}
                            variant="outline"
                          >
                            {getPriorityLabel(note.priority_score)} ({note.priority_score}/10)
                          </Badge>
                        </div>
                      )}

                      {/* AI Insights */}
                      {note.ai_insights && Array.isArray(note.ai_insights) && note.ai_insights.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-gen-z-electric" />
                            <span className="text-sm font-bold text-blue-800">AI Insights 🧠</span>
                          </div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {note.ai_insights.slice(0, 2).map((insight: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 font-medium">
                                <span className="text-gen-z-electric mt-1 flex-shrink-0">✨</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(note.created_at).toLocaleDateString()}
                          {note.last_ai_analysis && (
                            <span className="ml-2 text-gen-z-electric font-bold">• AI Analyzed ✨</span>
                          )}
                        </p>
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
                    "hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-3 rounded-xl overflow-hidden group",
                    "bg-gradient-to-br from-white to-green-50 border-green-200 hover:border-gen-z-mint"
                  )}>
                    <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2 font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          {note.title}
                        </CardTitle>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAIAction("analyze", note.id)}
                            className="h-8 w-8 p-0 hover:bg-green-100 rounded-lg"
                            disabled={analyzing === note.id}
                            title="Analyze with AI"
                          >
                            {analyzing === note.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                            ) : (
                              <Brain className="h-4 w-4 text-gen-z-mint" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4 text-gen-z-electric" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-gen-z-coral" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4 font-medium">
                        {note.content}
                      </p>
                      
                      {note.program_id && (
                        <p className="text-sm text-gen-z-mint font-bold mb-2 flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {getProgramName(note.program_id)}
                        </p>
                      )}
                      
                      {/* AI Summary */}
                      {note.ai_summary && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-gen-z-mint" />
                            <span className="text-sm font-bold text-green-800">AI Summary ✨</span>
                          </div>
                          <p className="text-sm text-green-700 font-medium">{note.ai_summary}</p>
                        </div>
                      )}
                      
                      {/* AI Categories */}
                      {note.ai_categories && note.ai_categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {note.ai_categories.map((category: string, index: number) => (
                            <Badge
                              key={index}
                              className={cn("text-xs font-bold rounded-lg border-2", getTagColor([category]))}
                              variant="secondary"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Priority Score */}
                      {note.priority_score > 0 && (
                        <div className="mb-3">
                          <Badge 
                            className={cn("text-xs font-bold border-2 rounded-lg", getPriorityColor(note.priority_score))}
                            variant="outline"
                          >
                            {getPriorityLabel(note.priority_score)} ({note.priority_score}/10)
                          </Badge>
                        </div>
                      )}

                      {/* AI Insights */}
                      {note.ai_insights && Array.isArray(note.ai_insights) && note.ai_insights.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-gen-z-electric" />
                            <span className="text-sm font-bold text-blue-800">AI Insights 🧠</span>
                          </div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {note.ai_insights.slice(0, 2).map((insight: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 font-medium">
                                <span className="text-gen-z-electric mt-1 flex-shrink-0">✨</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(note.created_at).toLocaleDateString()}
                          {note.last_ai_analysis && (
                            <span className="ml-2 text-gen-z-mint font-bold">• AI Analyzed ✨</span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState type="programs" />
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="space-y-6">
              <NotesTimeline />
              <EnhancedInsights />
            </div>
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
  <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-xl shadow-lg">
    <CardContent className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <StickyNote className="h-16 w-16 text-gen-z-electric mx-auto animate-pulse" />
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gen-z-neon-pink animate-bounce" />
      </div>
      <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
        No {type} notes found 📝
      </h3>
      <p className="text-gray-600 text-center mb-6 text-lg font-medium max-w-md">
        {type === "general" 
          ? "Time to start capturing those brilliant thoughts! Your future self will thank you ✨" 
          : "Create notes about your dream programs and application journey 🎯"
        }
      </p>
      <div className="gen-z-gradient-electric text-white px-6 py-3 rounded-xl font-bold shadow-lg">
        Start writing your story! 🚀
      </div>
    </CardContent>
  </Card>
);

export default Notes;
