
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  StickyNote, 
  Plus, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  Save,
  X,
  Tag
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface Note {
  id: string;
  title: string;
  content: string;
  programId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState<string | undefined>();
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    programId: "",
    tags: [] as string[]
  });

  const { programs } = useProgramContext();
  const { tags } = useTagContext();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('uniapp-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('uniapp-notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    const note: Note = {
      id: uuidv4(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      programId: newNote.programId || undefined,
      tags: newNote.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "", programId: "", tags: [] });
    setIsAddDialogOpen(false);
    toast.success("Note added successfully");
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      programId: note.programId || "",
      tags: note.tags
    });
  };

  const handleUpdateNote = () => {
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    const updatedNote: Note = {
      ...editingNote,
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      programId: newNote.programId || undefined,
      tags: newNote.tags,
      updatedAt: new Date().toISOString()
    };

    setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
    setEditingNote(null);
    setNewNote({ title: "", content: "", programId: "", tags: [] });
    toast.success("Note updated successfully");
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast.success("Note deleted successfully");
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNewNote({ title: "", content: "", programId: "", tags: [] });
  };

  const handleAddTag = (tagId: string) => {
    if (!newNote.tags.includes(tagId)) {
      setNewNote({ ...newNote, tags: [...newNote.tags, tagId] });
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setNewNote({ ...newNote, tags: newNote.tags.filter(id => id !== tagId) });
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (programFilter && programFilter !== "all" && note.programId !== programFilter) {
      return false;
    }
    
    if (tagFilter && tagFilter !== "all" && !note.tags.includes(tagFilter)) {
      return false;
    }
    
    return true;
  });

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.programName} - ${program.university}` : "Unknown Program";
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : "Unknown Tag";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notes & Ideas ({filteredNotes.length})
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
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
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="no-program">General Notes</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>
                  {program.programName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.filter(tag => tag.type === "custom").map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500 mb-6">
              {notes.length === 0 
                ? "Start capturing your thoughts and ideas about your applications" 
                : "Try adjusting your search or filters"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <div key={note.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-clamp-2">{note.title}</h4>
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
                
                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                
                {note.programId && (
                  <p className="text-xs text-blue-600 font-medium">
                    📚 {getProgramName(note.programId)}
                  </p>
                )}
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(tagId => (
                      <Badge key={tagId} variant="outline" className="text-xs">
                        {getTagName(tagId)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Note Dialog */}
      <Dialog open={isAddDialogOpen || !!editingNote} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingNote(null);
          setNewNote({ title: "", content: "", programId: "", tags: [] });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
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
                placeholder="Write your note content..."
                rows={6}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Link to Program (Optional)</label>
              <Select value={newNote.programId} onValueChange={(value) => setNewNote({ ...newNote, programId: value })}>
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
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="space-y-2">
                <Select onValueChange={handleAddTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tags..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.filter(tag => tag.type === "custom" && !newNote.tags.includes(tag.id)).map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {newNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newNote.tags.map(tagId => (
                      <Badge key={tagId} variant="outline" className="flex items-center gap-1">
                        {getTagName(tagId)}
                        <button
                          onClick={() => handleRemoveTag(tagId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
    </Card>
  );
};

export default NotesSection;
