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
  Pin,
  Archive,
  Folder,
  FolderPlus,
  FileText,
  Share2,
  Filter,
  SortAsc,
  Grid,
  List,
  PinOff,
  ArchiveRestore
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";

const EnhancedNotesSection = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState<string>("");
  const [folderFilter, setFolderFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showArchived, setShowArchived] = useState(false);
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    program_id: "",
    context_type: "general",
    folder_id: "",
    tags: [] as string[]
  });

  const [newFolder, setNewFolder] = useState({
    name: "",
    color: "#6366f1",
    parent_id: ""
  });

  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const { 
    notes, 
    folders,
    insights, 
    reminders, 
    addNote, 
    updateNote, 
    deleteNote,
    archiveNote,
    pinNote,
    addFolder,
    analyzeNote,
    analyzeAllNotes,
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
      folder_id: newNote.folder_id || undefined,
      tags: newNote.tags
    });

    setNewNote({ title: "", content: "", program_id: "", context_type: "general", folder_id: "", tags: [] });
    setIsAddDialogOpen(false);
  };

  const handleAddFolder = async () => {
    if (!newFolder.name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    await addFolder({
      name: newFolder.name.trim(),
      color: newFolder.color,
      parent_id: newFolder.parent_id || undefined
    });

    setNewFolder({ name: "", color: "#6366f1", parent_id: "" });
    setIsFolderDialogOpen(false);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      program_id: note.program_id || "",
      context_type: note.context_type,
      folder_id: note.folder_id || "",
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
      folder_id: newNote.folder_id || undefined,
      tags: newNote.tags
    });

    setEditingNote(null);
    setNewNote({ title: "", content: "", program_id: "", context_type: "general", folder_id: "", tags: [] });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNewNote({ title: "", content: "", program_id: "", context_type: "general", folder_id: "", tags: [] });
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      if (note.is_archived !== showArchived) return false;
      
      if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (contextFilter && contextFilter !== "all" && note.context_type !== contextFilter) {
        return false;
      }

      if (folderFilter && folderFilter !== "all") {
        if (folderFilter === "no-folder" && note.folder_id) return false;
        if (folderFilter !== "no-folder" && note.folder_id !== folderFilter) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "priority":
          return b.priority_score - a.priority_score;
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.programName} - ${program.university}` : "Unknown Program";
  };

  const getFolderName = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : "Unknown Folder";
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : "Unknown Tag";
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
    return <div className="flex justify-center p-8">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Notes Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Enhanced Notes ({filteredNotes.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={analyzeAllNotes} 
                variant="outline" 
                size="sm"
                disabled={notes.length === 0}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze All
              </Button>
              <Button onClick={() => setIsFolderDialogOpen(true)} variant="outline" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
          </div>
          
          {/* Enhanced Filters and Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
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
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Context" />
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
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  <SelectItem value="no-folder">No Folder</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant={showArchived ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {showArchived ? "Hide Archived" : "Show Archived"}
                </Button>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showArchived ? "No archived notes found" : "No notes found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {notes.length === 0 
                  ? "Start capturing your thoughts with AI-powered insights" 
                  : "Try adjusting your search or filters"}
              </p>
              {!showArchived && (
                <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Note
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" 
              : "space-y-3"
            }>
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow ${
                    note.is_pinned ? 'ring-2 ring-purple-200 bg-purple-50/50' : ''
                  } ${
                    note.is_archived ? 'opacity-75 bg-gray-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {note.is_pinned && <Pin className="h-3 w-3 text-purple-600" />}
                        {note.is_archived && <Archive className="h-3 w-3 text-gray-500" />}
                        <h4 className="font-medium text-sm line-clamp-2">{note.title}</h4>
                      </div>
                      {note.folder_id && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Folder className="h-3 w-3" />
                          {getFolderName(note.folder_id)}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <span className="h-4 w-4">⋮</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => analyzeNote(note.id)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Re-analyze
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditNote(note)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => pinNote(note.id, !note.is_pinned)}>
                          {note.is_pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                          {note.is_pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => archiveNote(note.id, !note.is_archived)}>
                          {note.is_archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                          {note.is_archived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteNote(note.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tagId => (
                        <Badge key={tagId} variant="outline" className="text-xs">
                          {getTagName(tagId)}
                        </Badge>
                      ))}
                    </div>
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
          setNewNote({ title: "", content: "", program_id: "", context_type: "general", folder_id: "", tags: [] });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {editingNote ? "Edit Note" : "Add New Note"}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="text-sm font-medium mb-2 block">Folder (Optional)</label>
                <Select 
                  value={newNote.folder_id} 
                  onValueChange={(value) => setNewNote({ ...newNote, folder_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Folder</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Program (Optional)</label>
                <Select 
                  value={newNote.program_id} 
                  onValueChange={(value) => setNewNote({ ...newNote, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program..." />
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

      {/* Add Folder Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-blue-600" />
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Folder Name</label>
              <Input
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Enter folder name..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <Input
                  type="color"
                  value={newFolder.color}
                  onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Parent Folder (Optional)</label>
                <Select 
                  value={newFolder.parent_id} 
                  onValueChange={(value) => setNewFolder({ ...newFolder, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No parent..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFolder}>
                <Save className="mr-2 h-4 w-4" />
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedNotesSection;
