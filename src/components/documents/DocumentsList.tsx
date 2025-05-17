
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, PlusCircle } from "lucide-react";
import { Document } from "@/types/document.types";
import { format } from "date-fns";
import { useDocumentContext } from "@/contexts/DocumentContext";

interface DocumentsListProps {
  activeDocumentType: string;
  selectedProgramId: string | null;
  selectedDocumentId: string | null;
  onSelectDocument: (docId: string | null) => void;
}

const DocumentsList = ({
  activeDocumentType,
  selectedProgramId,
  selectedDocumentId,
  onSelectDocument
}: DocumentsListProps) => {
  const { getVersions } = useDocumentContext();
  const { programs } = useProgramContext();
  
  // Get versions for the current document type
  const documentVersions = getVersions(activeDocumentType, selectedProgramId);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Versions</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onSelectDocument(null)}
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
              <Button
                key={doc.id}
                variant={selectedDocumentId === doc.id ? "default" : "outline"}
                className="w-full justify-start h-auto py-2 px-3"
                onClick={() => onSelectDocument(doc.id)}
              >
                <div className="flex flex-col items-start text-left">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>v{doc.versionNumber}</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

// Import at the top
import { useProgramContext } from "@/contexts/ProgramContext";

export default DocumentsList;
