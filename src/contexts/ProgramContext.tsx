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
  createdAt?: string;
}

interface AnalysisResult {
  summary: string;
  suggestions: string[];
  countryAnalysis: string;
  degreeTypeAnalysis: string;
  timelineInsight: string;
  financialInsight: string;
}

type ProgramContextType = {
  programs: Program[];
  addProgram: (program: Omit<Program, "id" | "tasks" | "createdAt">) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  addTask: (programId: string, task: Omit<ProgramTask, "id">) => void;
  toggleTask: (programId: string, taskId: string) => void;
  deleteTask: (programId: string, taskId: string) => void;
  analyzeShortlist: () => Promise<AnalysisResult | undefined>;
  isLocalMode: boolean;
  isAuthenticated: boolean;
};

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const useProgramContext = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error("useProgramContext must be used within a ProgramProvider");
  }
  return context;
};

// Helper for local storage
const LOCAL_STORAGE_KEY = 'lovable_programs';

const saveToLocalStorage = (programs: Program[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(programs));
};

const loadFromLocalStorage = (): Program[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error loading programs from local storage:", e);
    return [];
  }
};

export const ProgramProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setIsAuthenticated(!!session);
          if (session) {
            // Reload programs when user logs in
            fetchPrograms();
          } else {
            // Clear programs when user logs out
            setPrograms([]);
            setIsLocalMode(true);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch programs from Supabase
  const fetchPrograms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // User not authenticated, use local storage
        setIsLocalMode(true);
        const localPrograms = loadFromLocalStorage();
        setPrograms(localPrograms);
        return;
      }

      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('programs_saved')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Supabase error, using local storage mode:", error);
        setIsLocalMode(true);
        const localPrograms = loadFromLocalStorage();
        setPrograms(localPrograms);
        return;
      }

      if (data) {
        setIsLocalMode(false);
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
          tasks: []
        }));

        setPrograms(formattedPrograms);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs, using local storage');
      
      // Fallback to local storage
      setIsLocalMode(true);
      const localPrograms = loadFromLocalStorage();
      setPrograms(localPrograms);
    } finally {
      setLoading(false);
    }
  };

  // Fetch programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Save to local storage whenever programs change if in local mode
  useEffect(() => {
    if (isLocalMode && programs.length > 0) {
      saveToLocalStorage(programs);
    }
  }, [programs, isLocalMode]);

  const addProgram = async (program: Omit<Program, "id" | "tasks" | "createdAt">) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && !isLocalMode) {
        // Try to add to Supabase
        try {
          const { data, error } = await supabase
            .from('programs_saved')
            .insert({
              user_id: session.user.id,
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
          
          if (error) {
            console.error("Supabase error, falling back to local storage:", error);
            throw error;
          }

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
          return;
        } catch (error) {
          // If Supabase fails, switch to local storage mode
          setIsLocalMode(true);
          console.error("Switching to local storage mode due to error:", error);
          toast.warning("Unable to save to database, using local storage instead");
        }
      }
      
      // Local storage fallback
      const newProgram: Program = {
        id: uuidv4(),
        ...program,
        tasks: [],
        createdAt: new Date().toISOString()
      };
      
      const updatedPrograms = [newProgram, ...programs];
      setPrograms(updatedPrograms);
      saveToLocalStorage(updatedPrograms);
      toast.success("Program added to shortlist (local mode)");
      
    } catch (error) {
      console.error("Error adding program:", error);
      toast.error("Failed to add program");
    }
  };

  const updateProgram = async (id: string, updates: Partial<Program>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && !isLocalMode) {
        // Try to update in Supabase
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
          return;
        } catch (error) {
          console.error("Supabase update error, falling back to local storage:", error);
          setIsLocalMode(true);
          toast.warning("Unable to update in database, using local storage instead");
        }
      }
      
      // Local storage fallback
      const updatedPrograms = programs.map((program) => 
        program.id === id ? { ...program, ...updates } : program
      );
      setPrograms(updatedPrograms);
      saveToLocalStorage(updatedPrograms);
      toast.success("Program updated (local mode)");
      
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && !isLocalMode) {
        // Try to delete from Supabase
        try {
          const { error } = await supabase
            .from('programs_saved')
            .delete()
            .eq('id', id);
          
          if (error) throw error;

          // Delete from local state
          setPrograms(programs.filter((program) => program.id !== id));
          toast.success("Program deleted");
          return;
        } catch (error) {
          console.error("Supabase delete error, falling back to local storage:", error);
          setIsLocalMode(true);
          toast.warning("Unable to delete from database, using local storage instead");
        }
      }
      
      // Local storage fallback
      const updatedPrograms = programs.filter((program) => program.id !== id);
      setPrograms(updatedPrograms);
      saveToLocalStorage(updatedPrograms);
      toast.success("Program deleted (local mode)");
      
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  // These methods are placeholders for task management
  const addTask = (programId: string, task: Omit<ProgramTask, "id">) => {
    const newTask = {
      id: uuidv4(),
      ...task,
    };
    
    const updatedPrograms = programs.map((program) => 
      program.id === programId
        ? { ...program, tasks: [...program.tasks, newTask] }
        : program
    );
    
    setPrograms(updatedPrograms);
    
    if (isLocalMode) {
      saveToLocalStorage(updatedPrograms);
    }
  };

  const toggleTask = (programId: string, taskId: string) => {
    const updatedPrograms = programs.map((program) => 
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
    );
    
    setPrograms(updatedPrograms);
    
    if (isLocalMode) {
      saveToLocalStorage(updatedPrograms);
    }
  };

  const deleteTask = (programId: string, taskId: string) => {
    const updatedPrograms = programs.map((program) => 
      program.id === programId
        ? {
            ...program,
            tasks: program.tasks.filter((task) => task.id !== taskId),
          }
        : program
    );
    
    setPrograms(updatedPrograms);
    
    if (isLocalMode) {
      saveToLocalStorage(updatedPrograms);
    }
  };

  // Analyze shortlist using the edge function
  const analyzeShortlist = async (): Promise<AnalysisResult | undefined> => {
    if (programs.length < 3) {
      toast.error("Please add at least 3 programs to analyze your shortlist");
      return undefined;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to analyze your shortlist");
      return undefined;
    }

    toast.info("Analyzing your shortlist...", { duration: 2000 });

    try {
      // Call the shortlist-analysis edge function
      const { data, error } = await supabase.functions.invoke('shortlist-analysis', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (data) {
        toast.success("Shortlist analysis complete");
        return data as AnalysisResult;
      } else {
        throw new Error("Failed to analyze shortlist");
      }
    } catch (error) {
      console.error("Error analyzing shortlist:", error);
      toast.error("Failed to analyze shortlist. Please try again.");
      return undefined;
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
        analyzeShortlist,
        isLocalMode,
        isAuthenticated
      }}
    >
      {loading ? <div>Loading programs...</div> : children}
    </ProgramContext.Provider>
  );
};
