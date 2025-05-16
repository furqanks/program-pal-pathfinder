
import { useState } from "react";
import { Program, useProgramContext, ChecklistTask } from "@/contexts/ProgramContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TaskListProps {
  programId: string;
}

const TaskList = ({ programId }: TaskListProps) => {
  const { getProgram, updateTask, deleteTask } = useProgramContext();
  const program = getProgram(programId);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskText, setEditedTaskText] = useState("");

  if (!program) return null;

  const startEditing = (task: ChecklistTask) => {
    setEditingTaskId(task.id);
    setEditedTaskText(task.description);
  };

  const saveEditing = () => {
    if (editingTaskId && editedTaskText.trim()) {
      updateTask(programId, editingTaskId, { description: editedTaskText });
    }
    setEditingTaskId(null);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-1">
      {program.tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No tasks added yet</p>
      ) : (
        program.tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 group">
            {editingTaskId === task.id ? (
              <>
                <Input
                  value={editedTaskText}
                  onChange={(e) => setEditedTaskText(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                />
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveEditing}
                    className="h-7 w-7 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    updateTask(programId, task.id, {
                      completed: checked === true,
                    })
                  }
                />
                <label
                  htmlFor={task.id}
                  className={`text-sm flex-1 ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.description}
                </label>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(task)}
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(programId, task.id)}
                    className="h-7 w-7 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;
