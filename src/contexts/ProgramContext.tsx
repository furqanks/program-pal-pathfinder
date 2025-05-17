
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ProgramTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Program {
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
  tasks: ProgramTask[];
}

type ProgramContextType = {
  programs: Program[];
  addProgram: (program: Omit<Program, "id" | "tasks">) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  addTask: (programId: string, task: Omit<ProgramTask, "id">) => void;
  toggleTask: (programId: string, taskId: string) => void;
  deleteTask: (programId: string, taskId: string) => void;
  analyzeShortlist: () => Promise<void>;
};

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const useProgramContext = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error("useProgramContext must be used within a ProgramProvider");
  }
  return context;
};

export const ProgramProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Fetch programs from Supabase on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('programs_saved')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Convert Supabase format to our Program interface
          const formattedPrograms: Program[] = data.map((program: any) => ({
            id: program.id,
            programName: program.program_name,
            university: program.university,
            degreeType: program.degree_type,
            country: program.country,
            tuition: program.tuition || '',
            deadline: program.deadline || '',
            notes: program.notes || '',
            statusTagId: program.status_tag || 'status-considering',
            customTagIds: program.custom_tags || [],
            // We'll handle tasks separately or initialize empty for now
            tasks: []
          }));

          setPrograms(formattedPrograms);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        toast.error('Failed to load your programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const addProgram = async (program: Omit<Program, "id" | "tasks">) => {
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('programs_saved')
        .insert({
          program_name: program.programName,
          university: program.university,
          degree_type: program.degreeType,
          country: program.country,
          tuition: program.tuition,
          deadline: program.deadline,
          notes: program.notes,
          status_tag: program.statusTagId,
          custom_tags: program.customTagIds
        })
        .select()
        .single();
      
      if (error) throw error;

      // Add to local state
      const newProgram: Program = {
        id: data.id,
        programName: data.program_name,
        university: data.university,
        degreeType: data.degree_type,
        country: data.country,
        tuition: data.tuition || '',
        deadline: data.deadline || '',
        notes: data.notes || '',
        statusTagId: data.status_tag,
        customTagIds: data.custom_tags || [],
        tasks: []
      };

      setPrograms([newProgram, ...programs]);
      toast.success("Program added to shortlist");
    } catch (error) {
      console.error("Error adding program:", error);
      toast.error("Failed to add program");
    }
  };

  const updateProgram = async (id: string, updates: Partial<Program>) => {
    try {
      // Prepare updates for Supabase format
      const supabaseUpdates: any = {};
      if (updates.programName !== undefined) supabaseUpdates.program_name = updates.programName;
      if (updates.university !== undefined) supabaseUpdates.university = updates.university;
      if (updates.degreeType !== undefined) supabaseUpdates.degree_type = updates.degreeType;
      if (updates.country !== undefined) supabaseUpdates.country = updates.country;
      if (updates.tuition !== undefined) supabaseUpdates.tuition = updates.tuition;
      if (updates.deadline !== undefined) supabaseUpdates.deadline = updates.deadline;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.statusTagId !== undefined) supabaseUpdates.status_tag = updates.statusTagId;
      if (updates.customTagIds !== undefined) supabaseUpdates.custom_tags = updates.customTagIds;
      supabaseUpdates.updated_at = new Date().toISOString();

      // Update in Supabase
      const { error } = await supabase
        .from('programs_saved')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (error) throw error;

      // Update local state
      setPrograms(programs.map((program) => 
        program.id === id ? { ...program, ...updates } : program
      ));
      
      toast.success("Program updated");
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('programs_saved')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Delete from local state
      setPrograms(programs.filter((program) => program.id !== id));
      toast.success("Program deleted");
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  // These methods are placeholders for task management
  // In a real implementation, these would be stored in a separate table
  const addTask = (programId: string, task: Omit<ProgramTask, "id">) => {
    const newTask = {
      id: uuidv4(),
      ...task,
    };
    
    setPrograms(programs.map((program) => 
      program.id === programId
        ? { ...program, tasks: [...program.tasks, newTask] }
        : program
    ));
  };

  const toggleTask = (programId: string, taskId: string) => {
    setPrograms(programs.map((program) => 
      program.id === programId
        ? {
            ...program,
            tasks: program.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          }
        : program
    ));
  };

  const deleteTask = (programId: string, taskId: string) => {
    setPrograms(programs.map((program) => 
      program.id === programId
        ? {
            ...program,
            tasks: program.tasks.filter((task) => task.id !== taskId),
          }
        : program
    ));
  };

  // Analyze shortlist using the edge function
  const analyzeShortlist = async () => {
    if (programs.length < 3) {
      toast.error("Please add at least 3 programs to analyze your shortlist");
      return;
    }

    toast.info("Analyzing your shortlist...", { duration: 2000 });

    try {
      // Call the shortlist-analysis edge function
      const { data, error } = await supabase.functions.invoke('shortlist-analysis');

      if (error) throw error;

      if (data) {
        setAnalysisResults(data);
        // This is where we could store the analysis in state
        // For now we'll just toast a success
        toast.success("Shortlist analysis complete");
        return data;
      } else {
        throw new Error("Failed to analyze shortlist");
      }
    } catch (error) {
      console.error("Error analyzing shortlist:", error);
      toast.error("Failed to analyze shortlist");
      
      // For development, generate mock analysis
      const mockAnalysis = {
        summary: "Your shortlist shows a good mix of programs but could benefit from more geographical diversity. Consider adding programs from different regions to broaden your options.",
        suggestions: [
          "Consider adding 1-2 programs from Asia to diversify your geographical options.",
          "Your shortlist is heavy on Computer Science programs. Consider related fields like Data Science or AI.",
          "Add programs with varying tuition costs to provide financial flexibility.",
          "Consider including programs with earlier application deadlines as backups.",
          "Balance research-focused and industry-oriented programs for broader career prospects."
        ],
        countryAnalysis: "Your programs are concentrated in North America and Europe. Consider adding options from Asia or Australia.",
        degreeTypeAnalysis: "You have a good balance of Master's and PhD programs.",
        timelineInsight: "Many of your application deadlines are clustered in December. Consider programs with earlier or later deadlines to spread out your application workload.",
        financialInsight: "The average tuition for your selected programs is high. Consider adding some programs with lower tuition fees or better financial aid options."
      };
      
      setAnalysisResults(mockAnalysis);
      toast.success("Simulated analysis generated for testing");
      return mockAnalysis;
    }
  };

  return (
    <ProgramContext.Provider
      value={{
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        addTask,
        toggleTask,
        deleteTask,
        analyzeShortlist
      }}
    >
      {loading ? <div>Loading programs...</div> : children}
    </ProgramContext.Provider>
  );
};
