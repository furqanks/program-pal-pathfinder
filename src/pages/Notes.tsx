
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  // Placeholder notes data - this would eventually come from your context/database
  const sampleNotes = [
    {
      id: 1,
      title: "Stanford Application Notes",
      content: "Remember to highlight my research experience in AI and machine learning...",
      createdAt: "2025-01-15",
      tags: ["Stanford", "CS", "Research"]
    },
    {
      id: 2,
      title: "Personal Statement Ideas",
      content: "Focus on the impact of technology on education and my passion for...",
      createdAt: "2025-01-14",
      tags: ["Personal Statement", "Essays"]
    },
    {
      id: 3,
      title: "MIT Interview Prep",
      content: "Key points to mention: robotics project, leadership in coding club...",
      createdAt: "2025-01-13",
      tags: ["MIT", "Interview", "Preparation"]
    }
  ];

  const filteredNotes = sampleNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-600 mt-2">
              Organize your thoughts, ideas, and application insights
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className={cn(
              "flex gap-4",
              isMobile ? "flex-col" : "flex-row items-center"
            )}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <StickyNote className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{note.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <StickyNote className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Found</h3>
              <p className="text-gray-600 text-center mb-4">
                {searchTerm
                  ? `No notes match "${searchTerm}". Try adjusting your search.`
                  : "Start capturing your thoughts and ideas for your applications."
                }
              </p>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notes;
