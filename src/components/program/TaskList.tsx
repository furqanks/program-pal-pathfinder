
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProgramContext, ProgramTask } from '@/contexts/ProgramContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TrashIcon, PlusIcon } from 'lucide-react';

interface TaskListProps {
  programId: string;
}

const TaskList: React.FC<TaskListProps> = ({ programId }) => {
  const { programs, addTask, toggleTask, deleteTask } = useProgramContext();
  const [newTask, setNewTask] = useState('');
  
  const program = programs.find(p => p.id === programId);
  const tasks = program?.tasks || [];

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(programId, {
        title: newTask.trim(),
        completed: false
      });
      setNewTask('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <h3 className="font-medium">Application Tasks</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleAddTask} size="sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No tasks yet. Add some tasks to track your application progress.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-2 border rounded-md p-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(programId, task.id)}
                  id={`task-${task.id}`}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(programId, task.id)}
                className="h-7 w-7 p-0"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
