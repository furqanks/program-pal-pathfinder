import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Plus, 
  Sparkles,
  Save,
  Lightbulb,
  Target,
  FolderPlus,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";
import CompactNoteCard from "../notes/CompactNoteCard";
import FilterBar from "../notes/FilterBar";

const EnhancedNotesSection = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
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
      program_id: newNote.program_id === "none" ? undefined : newNote.program_id,
      context_type: newNote.context_type,
      folder_id: newNote.folder_id === "none" ? undefined : newNote.folder_id,
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
      parent_id: newFolder.parent_id === "none" ? undefined : newFolder.parent_id
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
      program_id: newNote.program_id === "none" ? undefined : newNote.program_id,
      context_type: newNote.context_type,
      folder_id: newNote.folder_id === "none" ? undefined : newNote.folder_id,
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
                onClick={summarizeAllNotes} 
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
          
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            contextFilter={contextFilter}
            onContextFilterChange={setContextFilter}
            folderFilter={folderFilter}
            onFolderFilterChange={setFolderFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
            folders={folders}
          />
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
                <CompactNoteCard
                  key={note.id}
                  note={note}
                  onSelect={() => {}} // You can implement note selection here
                  onEdit={handleEditNote}
                  onDelete={deleteNote}
                  onPin={pinNote}
                  onArchive={archiveNote}
                  onAnalyze={analyzeNote}
                  getProgramName={getProgramName}
                  getFolderName={getFolderName}
                  getTagName={getTagName}
                  viewMode={viewMode}
                />
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
                    <SelectItem value="none">No Folder</SelectItem>
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
                    <SelectItem value="none">No Program</SelectItem>
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
                    <SelectItem value="none">No Parent</SelectItem>
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
