
import { Program, useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext, Tag } from "@/contexts/TagContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Calendar, DollarSign, Pencil, Trash2, Check, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format, isValid, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditProgramForm from "./EditProgramForm";
import TaskList from "./TaskList";

interface ProgramCardProps {
  program: Program;
}

const ProgramCard = ({ program }: ProgramCardProps) => {
  const { updateProgram, deleteProgram } = useProgramContext();
  const { tags, getTagById } = useTagContext();
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Get status tag if it exists
  const statusTag = getTagById(program.statusTagId);
  
  // Get custom tags
  const customTags = program.customTagIds
    .map((id) => getTagById(id))
    .filter((tag): tag is Tag => tag !== undefined);
  
  // Format deadline date
  const formattedDeadline = program.deadline && isValid(parseISO(program.deadline)) 
    ? format(parseISO(program.deadline), "MMM d, yyyy") 
    : "No deadline";
  
  // Handle delete program
  const handleDelete = () => {
    deleteProgram(program.id);
  };
  
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

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                {program.programName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {program.university}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  Edit program details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                  Delete program
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{program.degreeType}</Badge>
            {statusTag && (
              <Badge className={getStatusColor(program.statusTagId)}>
                {statusTag.name}
              </Badge>
            )}
            {customTags.map((tag) => (
              <Badge variant="outline" key={tag.id}>
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{program.country}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Deadline: {formattedDeadline}</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Tuition: {program.tuition || "Not specified"}</span>
            </div>
          </div>

          {program.notes && (
            <div className="mt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNotes(!showNotes)}
                className="h-8 px-2 text-xs"
              >
                {showNotes ? "Hide notes" : "Show notes"}
              </Button>
              {showNotes && (
                <div className="mt-1 text-sm p-2 bg-accent/50 rounded-md">
                  {program.notes}
                </div>
              )}
            </div>
          )}

          <Separator className="my-3" />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Tasks</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTaskInput(!showTaskInput)} 
                className="h-7 w-7 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <TaskList programId={program.id} />
            
            {showTaskInput && (
              <form 
                className="flex items-center gap-2 mt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newTask.trim()) {
                    const { addTask } = useProgramContext();
                    addTask(program.id, newTask);
                    setNewTask("");
                    setShowTaskInput(false);
                  }
                }}
              >
                <Input 
                  value={newTask} 
                  onChange={e => setNewTask(e.target.value)} 
                  placeholder="Add new task..." 
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-8">Add</Button>
              </form>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(`${program.programName} ${program.university}`)}`, "_blank");
            }}
          >
            Search on Google
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Make changes to your program details below.
            </DialogDescription>
          </DialogHeader>
          <EditProgramForm 
            program={program} 
            onClose={() => setEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProgramCard;
