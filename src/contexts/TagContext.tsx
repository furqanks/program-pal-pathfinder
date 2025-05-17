
import { createContext, useState, useContext, ReactNode } from "react";

export type Tag = {
  id: string;
  name: string;
  type: "status" | "custom";
  color?: string;
  label?: string;
};

type TagContextType = {
  tags: Tag[];
  addTag: (tag: Omit<Tag, "id">) => void;
  updateTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  getStatusTag: (id: string) => { label: string; color: string } | undefined;
  getCustomTag: (id: string) => { label: string; color: string } | undefined;
};

const TagContext = createContext<TagContextType | undefined>(undefined);

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider");
  }
  return context;
};

// Default tags with colors
const defaultTags: Tag[] = [
  { id: "status-considering", name: "Considering", type: "status", color: "#6366F1" },
  { id: "status-applied", name: "Applied", type: "status", color: "#F59E0B" },
  { id: "status-accepted", name: "Accepted", type: "status", color: "#10B981" },
  { id: "status-rejected", name: "Rejected", type: "status", color: "#EF4444" },
  { id: "status-waitlisted", name: "Waitlisted", type: "status", color: "#8B5CF6" },
  { id: "tag-priority", name: "Priority", type: "custom", color: "#EC4899" },
  { id: "tag-scholarship", name: "Scholarship", type: "custom", color: "#6366F1" },
  { id: "tag-safe", name: "Safe Option", type: "custom", color: "#10B981" },
];

export const TagProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>(defaultTags);

  const addTag = ({ name, type, color }: Omit<Tag, "id">) => {
    const id = `${type === "status" ? "status" : "tag"}-${Date.now()}`;
    setTags([...tags, { id, name, type, color }]);
  };

  const updateTag = (id: string, name: string) => {
    setTags(tags.map((tag) => (tag.id === id ? { ...tag, name } : tag)));
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const getTagById = (id: string) => {
    return tags.find((tag) => tag.id === id);
  };

  const getStatusTag = (id: string) => {
    const tag = tags.find((tag) => tag.id === id && tag.type === "status");
    if (tag) {
      return { label: tag.name, color: tag.color || "#6366F1" };
    }
    return undefined;
  };

  const getCustomTag = (id: string) => {
    const tag = tags.find((tag) => tag.id === id && tag.type === "custom");
    if (tag) {
      return { label: tag.name, color: tag.color || "#6366F1" };
    }
    return undefined;
  };

  return (
    <TagContext.Provider value={{ 
      tags, 
      addTag, 
      updateTag, 
      deleteTag, 
      getTagById,
      getStatusTag,
      getCustomTag
    }}>
      {children}
    </TagContext.Provider>
  );
};
