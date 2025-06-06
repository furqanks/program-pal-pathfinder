
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Plus, Search, Sparkles, Brain, Tag, BookOpen, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const isMobile = useIsMobile();

  // Sample notes data with pastel color themes
  const sampleNotes = [
    {
      id: 1,
      title: "Stanford Application Strategy",
      content: "Focus on AI research experience and leadership in coding club. Highlight the machine learning project that won the regional competition...",
      createdAt: "2025-01-15",
      tags: ["Stanford", "CS", "Research"],
      color: "bg-blue-50 border-blue-200",
      tagColor: "bg-blue-100 text-blue-800",
      type: "application"
    },
    {
      id: 2,
      title: "Personal Statement Ideas",
      content: "The impact of technology on education and my passion for making CS accessible to underrepresented communities...",
      createdAt: "2025-01-14",
      tags: ["Personal Statement", "Essays"],
      color: "bg-purple-50 border-purple-200",
      tagColor: "bg-purple-100 text-purple-800",
      type: "general"
    },
    {
      id: 3,
      title: "MIT Interview Preparation",
      content: "Key points: robotics project, leadership experience, passion for innovation. Practice questions about technical challenges...",
      createdAt: "2025-01-13",
      tags: ["MIT", "Interview", "Preparation"],
      color: "bg-green-50 border-green-200",
      tagColor: "bg-green-100 text-green-800",
      type: "application"
    },
    {
      id: 4,
      title: "Research Ideas",
      content: "Exploring the intersection of AI and healthcare. Potential research directions for graduate school applications...",
      createdAt: "2025-01-12",
      tags: ["Research", "AI", "Healthcare"],
      color: "bg-rose-50 border-rose-200",
      tagColor: "bg-rose-100 text-rose-800",
      type: "program"
    }
  ];

  const filteredGeneralNotes = sampleNotes.filter(note =>
    note.type === "general" &&
    (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredProgramNotes = sampleNotes.filter(note =>
    (note.type === "application" || note.type === "program") &&
    (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleCreateNote = () => {
    if (!currentNote.trim()) {
      toast.error("Please write something first!");
      return;
    }
    
    toast.success("Note created successfully!");
    // Here you would integrate with your notes context/database
    setCurrentNote("");
    setNoteTitle("");
  };

  const handleAIAction = (action: string) => {
    if (!currentNote.trim()) {
      toast.error("Please write a note first to use AI features!");
      return;
    }
    
    toast.info(`AI ${action} feature coming soon!`);
    // Here you would integrate with your AI analysis functions
  };

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
              Quick Note
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
            
            {/* AI Action Buttons */}
            <div className={cn(
              "flex gap-2 pt-4",
              isMobile ? "flex-col" : "flex-row flex-wrap"
            )}>
              <Button onClick={handleCreateNote} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Save Note
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("summarize")}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("analyze")}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Brain className="mr-2 h-4 w-4" />
                Analyze
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("enhance")}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Enhance
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAction("tag")}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Tag className="mr-2 h-4 w-4" />
                Auto-Tag
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
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              General Notes ({filteredGeneralNotes.length})
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Program Notes ({filteredProgramNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            {filteredGeneralNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGeneralNotes.map((note) => (
                  <Card key={note.id} className={cn(
                    "hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105",
                    note.color
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 text-gray-800">
                        {note.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className={cn("text-xs", note.tagColor)}
                            variant="secondary"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
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
                    note.color
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 text-gray-800">
                        {note.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className={cn("text-xs", note.tagColor)}
                            variant="secondary"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState type="programs" />
            )}
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
