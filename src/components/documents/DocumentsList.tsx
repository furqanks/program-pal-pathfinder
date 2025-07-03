
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Document } from "@/types/document.types";
import { format } from "date-fns";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface DocumentsListProps {
  activeDocumentType: string;
  selectedProgramId: string | null;
  selectedDocumentId: string | null;
  onSelectDocument: (docId: string | null) => void;
  onCreateNew?: () => void;
}

const DocumentsList = ({
  activeDocumentType,
  selectedProgramId,
  selectedDocumentId,
  onSelectDocument,
  onCreateNew
}: DocumentsListProps) => {
  const { getVersions, deleteDocument, updateDocument } = useDocumentContext();
  const { programs } = useProgramContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  // Get versions for the current document type
  const documentVersions = getVersions(activeDocumentType, selectedProgramId);
  
  const handleDelete = async () => {
    if (documentToDelete) {
      try {
        await deleteDocument(documentToDelete);
        if (selectedDocumentId === documentToDelete) {
          onSelectDocument(null);
        }
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleRename = async (docId: string) => {
    console.log("handleRename called with:", { docId, editName });
    if (editName.trim()) {
      try {
        console.log("Updating document with new name:", editName.trim());
        await updateDocument(docId, { fileName: editName.trim() });
        setEditingDocument(null);
        setEditName("");
        console.log("Document renamed successfully");
      } catch (error) {
        console.error("Error renaming document:", error);
      }
    } else {
      console.log("editName is empty, canceling rename");
      setEditingDocument(null);
      setEditName("");
    }
  };

  const startEdit = (doc: Document) => {
    console.log("Starting edit for document:", doc.id, doc.fileName);
    setEditingDocument(doc.id);
    setEditName(doc.fileName || `Version ${doc.versionNumber}`);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Versions</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCreateNew || (() => onSelectDocument(null))}
          className="h-8 px-2"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
      
      {documentVersions.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          No documents yet
        </div>
      ) : (
        <div className="space-y-2 max-h-[40vh] md:max-h-[50vh] overflow-y-auto pr-1">
          {documentVersions.map((doc) => {
            const program = doc.linkedProgramId 
              ? programs.find(p => p.id === doc.linkedProgramId) 
              : null;
            
            return (
              <div key={doc.id} className="relative group">
                <Button
                  variant={selectedDocumentId === doc.id ? "default" : "outline"}
                  className="w-full justify-start h-auto py-2 px-3 pr-10"
                  onClick={() => onSelectDocument(doc.id)}
                >
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {editingDocument === doc.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleRename(doc.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(doc.id);
                            if (e.key === 'Escape') {
                              setEditingDocument(null);
                              setEditName("");
                            }
                          }}
                          className="h-4 text-xs p-0 border-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        <span>{doc.fileName || `v${doc.versionNumber}`}</span>
                      )}
                      {doc.score && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {doc.score}/10
                        </Badge>
                      )}
                    </div>
                    {program && (
                      <span className="text-xs text-muted-foreground mt-1 truncate w-full">
                        {program.programName}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground mt-1">
                      {format(new Date(doc.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Dropdown button clicked for document:", doc.id);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50 bg-background border shadow-md">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Rename clicked for document:", doc.id);
                        startEdit(doc);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Delete clicked for document:", doc.id);
                        setDocumentToDelete(doc.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentsList;
