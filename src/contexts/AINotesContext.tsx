
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AINote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  program_id?: string;
  tags: string[];
  ai_summary?: string;
  ai_categories: string[];
  ai_insights: Record<string, any>;
  priority_score: number;
  context_type: string;
  created_at: string;
  updated_at: string;
  last_ai_analysis?: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  content: string;
  related_notes: string[];
  related_programs: string[];
  confidence_score: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface SmartReminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: string;
  program_id?: string;
  due_date?: string;
  is_completed: boolean;
  ai_generated: boolean;
  priority: number;
  created_at: string;
}

interface AINotesContextType {
  notes: AINote[];
  insights: AIInsight[];
  reminders: SmartReminder[];
  addNote: (note: Omit<AINote, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'ai_categories' | 'ai_insights' | 'priority_score'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<AINote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  analyzeNote: (noteId: string) => Promise<void>;
  analyzeAllNotes: () => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  loading: boolean;
}

const AINotesContext = createContext<AINotesContextType | undefined>(undefined);

export const useAINotesContext = () => {
  const context = useContext(AINotesContext);
  if (!context) {
    throw new Error('useAINotesContext must be used within an AINotesProvider');
  }
  return context;
};

export const AINotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<AINote[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setNotes([]);
      setInsights([]);
      setReminders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('ai_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Fetch insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (insightsError) throw insightsError;
      setInsights(insightsData || []);

      // Fetch reminders
      const { data: remindersData, error: remindersError } = await supabase
        .from('smart_reminders')
        .select('*')
        .eq('is_completed', false)
        .order('due_date', { ascending: true, nullsLast: true });

      if (remindersError) throw remindersError;
      setReminders(remindersData || []);

    } catch (error) {
      console.error('Error fetching AI notes data:', error);
      toast.error('Failed to load notes data');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: Omit<AINote, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'ai_categories' | 'ai_insights' | 'priority_score'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_notes')
        .insert({
          user_id: user.id,
          title: noteData.title,
          content: noteData.content,
          program_id: noteData.program_id,
          tags: noteData.tags,
          context_type: noteData.context_type,
          ai_categories: [],
          ai_insights: {},
          priority_score: 0
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      toast.success('Note added successfully');

      // Automatically analyze the note
      await analyzeNote(data.id);

    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const updateNote = async (id: string, updates: Partial<AINote>) => {
    try {
      const { error } = await supabase
        .from('ai_notes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === id ? { ...note, ...updates } : note
      ));
      toast.success('Note updated successfully');

    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success('Note deleted successfully');

    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const analyzeNote = async (noteId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { noteId, action: 'analyze_single' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      // Refresh the specific note
      const { data: updatedNote } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (updatedNote) {
        setNotes(notes.map(note => 
          note.id === noteId ? updatedNote : note
        ));
      }

      toast.success('Note analyzed successfully');

    } catch (error) {
      console.error('Error analyzing note:', error);
      toast.error('Failed to analyze note');
    }
  };

  const analyzeAllNotes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      toast.info('Analyzing all notes... This may take a moment.');

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { action: 'analyze_all' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      // Refresh all data
      await fetchAllData();
      toast.success('Comprehensive analysis completed!');

    } catch (error) {
      console.error('Error analyzing all notes:', error);
      toast.error('Failed to analyze notes');
    }
  };

  const completeReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .update({ is_completed: true })
        .eq('id', id);

      if (error) throw error;

      setReminders(reminders.filter(reminder => reminder.id !== id));
      toast.success('Reminder completed');

    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  return (
    <AINotesContext.Provider value={{
      notes,
      insights,
      reminders,
      addNote,
      updateNote,
      deleteNote,
      analyzeNote,
      analyzeAllNotes,
      completeReminder,
      loading
    }}>
      {children}
    </AINotesContext.Provider>
  );
};
