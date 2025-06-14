
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Archive, Grid, List } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  contextFilter: string;
  onContextFilterChange: (value: string) => void;
  folderFilter?: string;
  onFolderFilterChange?: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  folders?: Array<{ id: string; name: string; }>;
  className?: string;
}

const FilterBar = ({
  searchTerm,
  onSearchChange,
  contextFilter,
  onContextFilterChange,
  folderFilter,
  onFolderFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  showArchived,
  onShowArchivedChange,
  folders = [],
  className = ""
}: FilterBarProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={contextFilter} onValueChange={onContextFilterChange}>
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
        {onFolderFilterChange && (
          <Select value={folderFilter} onValueChange={onFolderFilterChange}>
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
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={onSortByChange}>
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
            onClick={() => onShowArchivedChange(!showArchived)}
          >
            <Archive className="mr-2 h-4 w-4" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
