
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Tag } from "@/contexts/TagContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onChange: (selectedIds: string[]) => void;
}

const TagSelector = ({
  availableTags,
  selectedTagIds,
  onChange,
}: TagSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Filter out tags with empty or invalid IDs
  const validTags = availableTags.filter(tag => tag.id && tag.id.trim() !== "");
  const validSelectedTagIds = selectedTagIds.filter(id => id && id.trim() !== "");

  const toggleTag = (tagId: string) => {
    if (validSelectedTagIds.includes(tagId)) {
      onChange(validSelectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...validSelectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(validSelectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[1.75rem]">
        {validSelectedTagIds.length > 0 ? (
          validSelectedTagIds.map((tagId) => {
            const tag = validTags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <Badge key={tag.id} variant="outline" className="px-2 py-1">
                {tag.name}
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => removeTag(tag.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground">No tags selected</span>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm"
            type="button"
          >
            Select tags
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tags..." className="h-9" />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {validTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => toggleTag(tag.id)}
                    className="flex items-center"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        validSelectedTagIds.includes(tag.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      )}
                    >
                      {validSelectedTagIds.includes(tag.id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagSelector;
