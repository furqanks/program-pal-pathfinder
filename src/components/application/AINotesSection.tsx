import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Plus, 
  Search, 
  Sparkles,
  Edit2,
  Trash2,
  Save,
  X,
  Lightbulb,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { toast } from "sonner";

const AINotesSection = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState<string>("");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    program_id: "",
    context_type: "general",
    tags: [] as string[]
  });

  const { programs } = useProgramContext();
  const { 
    notes, 
    insights, 
    reminders, 
    addNote, 
    updateNote, 
    deleteNote, 
    analyzeNote,
    summarizeAllNotes,
    completeReminder,
    loading 
  } = useAINotesContext();

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    await addNote({
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      program_id: newNote.program_id || undefined,
      context_type: newNote.context_type,
      tags: newNote.tags
    });

    setNewNote({ title: "", content: "", program_id: "", context_type: "general", tags: [] });
    setIsAddDialogOpen(false);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      program_id: note.program_id || "",
      context_type: note.context_type,
      tags: note.tags
    });
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    await updateNote(editingNote.id, {
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      program_id: newNote.program_id || undefined,
      context_type: newNote.context_type,
      tags: newNote.tags
    });

    setEditingNote(null);
    setNewNote({ title: "", content: "", program_id: "", context_type: "general", tags: [] });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNewNote({ title: "", content: "", program_id: "", context_type: "general", tags: [] });
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (contextFilter && contextFilter !== "all" && note.context_type !== contextFilter) {
      return false;
    }
    
    return true;
  });

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.programName} - ${program.university}` : "Unknown Program";
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return "bg-red-100 text-red-800";
    if (score >= 6) return "bg-orange-100 text-orange-800";
    if (score >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return "High Priority";
    if (score >= 6) return "Medium Priority";
    if (score >= 4) return "Low Priority";
    return "Info";
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading AI notes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Notes Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Notes ({filteredNotes.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={summarizeAllNotes} 
                variant="outline" 
                size="sm"
                disabled={notes.length === 0}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze All
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={contextFilter} onValueChange={setContextFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contexts</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI notes found</h3>
              <p className="text-gray-500 mb-6">
                {notes.length === 0 
                  ? "Start capturing your thoughts with AI-powered insights" 
                  : "Try adjusting your search or filters"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First AI Note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <div key={note.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm line-clamp-2">{note.title}</h4>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => analyzeNote(note.id)}
                        className="h-8 w-8 p-0"
                        title="Re-analyze with AI"
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
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
                        onClick={() => deleteNote(note.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                  
                  {note.ai_summary && (
                    <div className="bg-purple-50 p-2 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <Brain className="h-3 w-3 text-purple-600" />
                        <span className="font-medium text-purple-800">AI Summary</span>
                      </div>
                      <p className="text-purple-700">{note.ai_summary}</p>
                    </div>
                  )}
                  
                  {note.program_id && (
                    <p className="text-xs text-blue-600 font-medium">
                      📚 {getProgramName(note.program_id)}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {note.context_type}
                      </Badge>
                      {note.priority_score > 0 && (
                        <Badge className={`text-xs ${getPriorityColor(note.priority_score)}`}>
                          {getPriorityLabel(note.priority_score)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.slice(0, 3).map(insight => (
                <div key={insight.id} className="border-l-4 border-amber-400 pl-4 py-2">
                  <h4 className="font-medium text-sm mb-2">{insight.title}</h4>
                  <div className="text-sm text-muted-foreground">
                    {typeof insight.content === 'string' 
                      ? insight.content 
                      : JSON.stringify(insight.content).slice(0, 200) + '...'
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.insight_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(insight.confidence_score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Reminders Card */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Smart Reminders & Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders.slice(0, 5).map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{reminder.title}</h4>
                    {reminder.description && (
                      <p className="text-xs text-muted-foreground mt-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {reminder.reminder_type}
                      </Badge>
                      {reminder.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(reminder.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {reminder.ai_generated && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => completeReminder(reminder.id)}
                  >
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Note Dialog */}
      <Dialog open={isAddDialogOpen || !!editingNote} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingNote(null);
          setNewNote({ title: "", content: "", program_id: "", context_type: "general", tags: [] });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {editingNote ? "Edit AI Note" : "Add New AI Note"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note content... AI will analyze and provide insights automatically."
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Context Type</label>
                <Select 
                  value={newNote.context_type} 
                  onValueChange={(value) => setNewNote({ ...newNote, context_type: value })}
                >
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium mb-2 block">Link to Program (Optional)</label>
                <Select 
                  value={newNote.program_id} 
                  onValueChange={(value) => setNewNote({ ...newNote, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Program</SelectItem>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.programName} - {program.university}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={editingNote ? handleUpdateNote : handleAddNote}>
                <Save className="mr-2 h-4 w-4" />
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AINotesSection;
