
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Pencil, 
  Trash2,
  ChevronDown, 
  ChevronUp,
  GraduationCap,
  MapPin,
  Plus,
  Download
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useProgramContext, Program } from '@/contexts/ProgramContext';
import { useTagContext } from '@/contexts/TagContext';
import { toast } from 'sonner';
import TaskList from './TaskList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditProgramForm from './EditProgramForm';
import DeadlineCountdown from './DeadlineCountdown';
import ProgramProgress from './ProgramProgress';
import { exportProgramsToCsv } from '@/utils/exportToCsv';

interface ProgramCardProps {
  program: Program;
}

const ProgramCard = ({ program }: ProgramCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { deleteProgram, addTask, programs } = useProgramContext();
  const { getStatusTag, getCustomTag } = useTagContext();
  
  const handleDelete = () => {
    toast.warning(
      'Are you sure you want to delete this program?',
      {
        action: {
          label: "Delete",
          onClick: () => {
            deleteProgram(program.id);
            toast.success("Program deleted successfully");
          },
        },
      }
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }
    
    addTask(program.id, {
      title: newTaskTitle.trim(),
      completed: false
    });
    
    toast.success("Task added successfully");
    setNewTaskTitle('');
    setIsAddTaskDialogOpen(false);
  };

  const handleExportCsv = () => {
    exportProgramsToCsv([program]);
    toast.success("Program exported to CSV");
  };

  const handleExportAllCsv = () => {
    exportProgramsToCsv(programs);
    toast.success("All programs exported to CSV");
  };

  // Get the status tag data
  const statusTag = getStatusTag(program.statusTagId);
  
  return (
    <Card className="w-full border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {program.programName}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>{program.university}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{program.country}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Program
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Program
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            {program.degreeType}
          </Badge>
          
          {statusTag && (
            <Badge 
              style={{
                backgroundColor: statusTag.color,
                color: '#fff'
              }}
            >
              {statusTag.label}
            </Badge>
          )}
          
          {program.customTagIds.map(tagId => {
            const tag = getCustomTag(tagId);
            if (!tag) return null;
            return (
              <Badge 
                key={tagId} 
                variant="outline"
                style={{
                  borderColor: tag.color,
                  color: tag.color
                }}
              >
                {tag.label}
              </Badge>
            );
          })}
        </div>
        
        {/* Add deadline countdown outside of expanded section */}
        <DeadlineCountdown deadline={program.deadline} className="mt-2" />
        
        {/* Add progress bar */}
        <div className="mt-3">
          <ProgramProgress program={program} />
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pb-3 pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Tuition</p>
              <p>{program.tuition || 'Not specified'}</p>
            </div>
          </div>
          
          {program.notes && (
            <div className="mt-3">
              <p className="text-muted-foreground text-sm">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{program.notes}</p>
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Tasks</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAddTaskDialogOpen(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Task
              </Button>
            </div>
            <TaskList programId={program.id} />
          </div>
        </CardContent>
      )}
      
      <CardFooter className="pt-1 pb-2 flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center text-muted-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </Button>
      </CardFooter>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
          </DialogHeader>
          <EditProgramForm 
            program={program}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid w-full gap-2">
              <label htmlFor="task-title" className="text-sm font-medium">Task Title</label>
              <input 
                id="task-title"
                type="text" 
                className="border rounded-md p-2"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTask}>
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProgramCard;
