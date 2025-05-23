
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Program, useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditProgramForm from "./EditProgramForm";
import DeadlineCountdown from "./DeadlineCountdown";
import { exportProgramsToCsv } from "@/utils/exportToCsv";
import { toast } from "sonner";

interface ProgramTableViewProps {
  programs: Program[];
}

const ProgramTableView = ({ programs }: ProgramTableViewProps) => {
  const { deleteProgram } = useProgramContext();
  const { getTagById } = useTagContext();
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  const getStatusColor = (statusTagId: string) => {
    switch (statusTagId) {
      case "status-considering":
        return "bg-blue-100 text-blue-800";
      case "status-applied":
        return "bg-orange-100 text-orange-800";
      case "status-accepted":
        return "bg-green-100 text-green-800";
      case "status-rejected":
        return "bg-red-100 text-red-800";
      case "status-waitlisted":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleExportCsv = () => {
    exportProgramsToCsv(programs);
    toast.success(`${programs.length} programs exported to CSV`);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>
    
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Program & University</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Tuition</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No programs found
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{program.programName}</div>
                      <div className="text-sm text-muted-foreground">
                        {program.university}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(program.statusTagId)}
                    >
                      {getTagById(program.statusTagId)?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{program.country}</TableCell>
                  <TableCell>
                    {program.deadline && isValid(parseISO(program.deadline)) ? (
                      <DeadlineCountdown deadline={program.deadline} />
                    ) : (
                      "No deadline"
                    )}
                  </TableCell>
                  <TableCell>{program.tuition || "Not specified"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {program.customTagIds.map((tagId) => (
                        <Badge key={tagId} variant="outline" className="text-xs">
                          {getTagById(tagId)?.name || ""}
                        </Badge>
                      ))}
                      {program.customTagIds.length === 0 && (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditProgram(program)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteProgram(program.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editProgram} onOpenChange={(open) => !open && setEditProgram(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Make changes to your program details below.
            </DialogDescription>
          </DialogHeader>
          {editProgram && (
            <EditProgramForm
              program={editProgram}
              onClose={() => setEditProgram(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProgramTableView;
