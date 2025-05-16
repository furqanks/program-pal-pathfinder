
import { createContext, useState, useContext, ReactNode } from "react";

export type Tag = {
  id: string;
  name: string;
  type: "status" | "custom";
};

type TagContextType = {
  tags: Tag[];
  addTag: (tag: Omit<Tag, "id">) => void;
  updateTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
};

const TagContext = createContext<TagContextType | undefined>(undefined);

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider");
  }
  return context;
};

// Default tags
const defaultTags: Tag[] = [
  { id: "status-considering", name: "Considering", type: "status" },
  { id: "status-applied", name: "Applied", type: "status" },
  { id: "status-accepted", name: "Accepted", type: "status" },
  { id: "status-rejected", name: "Rejected", type: "status" },
  { id: "status-waitlisted", name: "Waitlisted", type: "status" },
  { id: "tag-priority", name: "Priority", type: "custom" },
  { id: "tag-scholarship", name: "Scholarship", type: "custom" },
  { id: "tag-safe", name: "Safe Option", type: "custom" },
];

export const TagProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>(defaultTags);

  const addTag = ({ name, type }: Omit<Tag, "id">) => {
    const id = `${type === "status" ? "status" : "tag"}-${Date.now()}`;
    setTags([...tags, { id, name, type }]);
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

  return (
    <TagContext.Provider value={{ tags, addTag, updateTag, deleteTag, getTagById }}>
      {children}
    </TagContext.Provider>
  );
};
