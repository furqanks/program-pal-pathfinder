
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  BookOpen,
  Target,
  DollarSign,
  Archive,
  Hash,
  Pin,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
  Folder,
  PinOff,
  ArchiveRestore
} from "lucide-react";
import CompactAISummary from "./CompactAISummary";

interface CompactNoteCardProps {
  note: any;
  isSelected?: boolean;
  onSelect: (note: any) => void;
  onEdit?: (note: any) => void;
  onDelete?: (noteId: string) => void;
  onPin?: (noteId: string, isPinned: boolean) => void;
  onArchive?: (noteId: string, isArchived: boolean) => void;
  onAnalyze?: (noteId: string) => void;
  getProgramName?: (programId: string) => string;
  getFolderName?: (folderId: string) => string;
  getTagName?: (tagId: string) => string;
  viewMode?: 'grid' | 'list';
}

const CompactNoteCard = ({ 
  note, 
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onPin,
  onArchive,
  onAnalyze,
  getProgramName,
  getFolderName,
  getTagName,
  viewMode = 'grid'
}: CompactNoteCardProps) => {
  const getContextIcon = (context: string) => {
    switch (context) {
      case "academic": return <BookOpen className="h-3 w-3" />;
      case "application": return <Target className="h-3 w-3" />;
      case "financial": return <DollarSign className="h-3 w-3" />;
      case "research": return <Archive className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const getContentPreview = (content: string) => {
    const maxLength = viewMode === 'grid' ? 120 : 200;
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
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

  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isSelected 
          ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
          : 'hover:bg-muted/30 border-border/50'
      } ${
        note.is_pinned ? 'ring-2 ring-purple-200 bg-purple-50/50' : ''
      } ${
        note.is_archived ? 'opacity-75 bg-gray-50' : ''
      }`}
      onClick={() => onSelect(note)}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {note.is_pinned && <Pin className="h-3 w-3 text-purple-600 flex-shrink-0" />}
              {note.is_archived && <Archive className="h-3 w-3 text-gray-500 flex-shrink-0" />}
              <h4 className="font-medium text-sm line-clamp-2">{note.title}</h4>
            </div>
            {note.folder_id && getFolderName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Folder className="h-3 w-3" />
                {getFolderName(note.folder_id)}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Open menu</span>
                <span className="h-4 w-4">⋮</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAnalyze && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAnalyze(note.id); }}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Re-analyze
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(note); }}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onPin && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(note.id, !note.is_pinned); }}>
                  {note.is_pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                  {note.is_pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(note.id, !note.is_archived); }}>
                  {note.is_archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                  {note.is_archived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3">{getContentPreview(note.content)}</p>
        
        {/* Enhanced AI Summary Display */}
        {(note.ai_summary || note.ai_insights) && (
          <CompactAISummary
            summary={note.ai_summary}
            insights={note.ai_insights}
          />
        )}
        
        {note.program_id && getProgramName && (
          <p className="text-xs text-blue-600 font-medium">
            📚 {getProgramName(note.program_id)}
          </p>
        )}
        
        {note.tags && note.tags.length > 0 && getTagName && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tagId: string) => (
              <Badge key={tagId} variant="outline" className="text-xs">
                {getTagName(tagId)}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {getContextIcon(note.context_type)}
              <span className="ml-1">{note.context_type}</span>
            </Badge>
            {note.priority_score > 0 && (
              <Badge className={`text-xs ${getPriorityColor(note.priority_score)}`}>
                {getPriorityLabel(note.priority_score)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(note.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompactNoteCard;
