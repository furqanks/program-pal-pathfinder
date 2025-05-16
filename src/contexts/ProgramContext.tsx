
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { toast } from "sonner";

export type ChecklistTask = {
  id: string;
  description: string;
  completed: boolean;
};

export type Program = {
  id: string;
  programName: string;
  university: string;
  degreeType: string;
  country: string;
  tuition: string;
  deadline: string;
  notes: string;
  statusTagId: string;
  customTagIds: string[];
  tasks: ChecklistTask[];
  createdAt: string;
  updatedAt: string;
};

type ProgramContextType = {
  programs: Program[];
  addProgram: (program: Omit<Program, "id" | "createdAt" | "updatedAt" | "tasks">) => void;
  updateProgram: (id: string, updates: Partial<Omit<Program, "id" | "createdAt" | "updatedAt">>) => void;
  deleteProgram: (id: string) => void;
  getProgram: (id: string) => Program | undefined;
  addTask: (programId: string, description: string) => void;
  updateTask: (programId: string, taskId: string, updates: Partial<ChecklistTask>) => void;
  deleteTask: (programId: string, taskId: string) => void;
};

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const useProgramContext = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error("useProgramContext must be used within a ProgramProvider");
  }
  return context;
};

// Sample programs for testing
const samplePrograms: Program[] = [
  {
    id: "1",
    programName: "Computer Science",
    university: "Stanford University",
    degreeType: "Masters",
    country: "USA",
    tuition: "$52,000",
    deadline: "2025-12-01",
    notes: "Need TOEFL score of 100+",
    statusTagId: "status-considering",
    customTagIds: ["tag-priority"],
    tasks: [
      { id: "task-1-1", description: "Upload transcripts", completed: false },
      { id: "task-1-2", description: "Complete SOP", completed: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    programName: "Data Science",
    university: "University of Toronto",
    degreeType: "Masters",
    country: "Canada",
    tuition: "$30,000 CAD",
    deadline: "2026-01-15",
    notes: "Rolling admissions",
    statusTagId: "status-applied",
    customTagIds: ["tag-scholarship"],
    tasks: [
      { id: "task-2-1", description: "Request recommendation letters", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ProgramProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>(samplePrograms);

  const addProgram = (program: Omit<Program, "id" | "createdAt" | "updatedAt" | "tasks">) => {
    const now = new Date().toISOString();
    const newProgram: Program = {
      ...program,
      id: `prog-${Date.now()}`,
      tasks: [],
      createdAt: now,
      updatedAt: now,
    };
    setPrograms([...programs, newProgram]);
    toast.success("Program saved to shortlist");
  };

  const updateProgram = (id: string, updates: Partial<Omit<Program, "id" | "createdAt" | "updatedAt">>) => {
    setPrograms(
      programs.map((program) =>
        program.id === id
          ? { ...program, ...updates, updatedAt: new Date().toISOString() }
          : program
      )
    );
  };

  const deleteProgram = (id: string) => {
    setPrograms(programs.filter((program) => program.id !== id));
    toast.success("Program removed from shortlist");
  };

  const getProgram = (id: string) => {
    return programs.find((program) => program.id === id);
  };

  // Task management
  const addTask = (programId: string, description: string) => {
    setPrograms(
      programs.map((program) =>
        program.id === programId
          ? {
              ...program,
              tasks: [
                ...program.tasks,
                {
                  id: `task-${programId}-${Date.now()}`,
                  description,
                  completed: false,
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : program
      )
    );
  };

  const updateTask = (programId: string, taskId: string, updates: Partial<ChecklistTask>) => {
    setPrograms(
      programs.map((program) =>
        program.id === programId
          ? {
              ...program,
              tasks: program.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
              updatedAt: new Date().toISOString(),
            }
          : program
      )
    );
  };

  const deleteTask = (programId: string, taskId: string) => {
    setPrograms(
      programs.map((program) =>
        program.id === programId
          ? {
              ...program,
              tasks: program.tasks.filter((task) => task.id !== taskId),
              updatedAt: new Date().toISOString(),
            }
          : program
      )
    );
  };

  return (
    <ProgramContext.Provider
      value={{
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        getProgram,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
};
