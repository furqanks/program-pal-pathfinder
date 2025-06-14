
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getEnhancedAnalysisPrompt, getDailySummaryPrompt } from '@/utils/enhancedAIPrompts';
import { useProgramContext } from './ProgramContext';

interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  context_type: string;
  program_id?: string;
  folder_id?: string;
  tags?: string[];
  is_pinned: boolean;
  is_archived: boolean;
  ai_summary?: string;
  ai_insights?: any;
  priority_score?: number;
  is_generated?: boolean;
}

interface Folder {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  color?: string;
  parent_id?: string;
}

interface Insight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  confidence_score: number;
  created_at: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  reminder_type: string;
  ai_generated: boolean;
}

interface AINotesContextType {
  notes: Note[];
  folders: Folder[];
  insights: Insight[];
  reminders: Reminder[];
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'is_pinned' | 'is_archived'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  pinNote: (noteId: string, isPinned: boolean) => Promise<void>;
  archiveNote: (noteId: string, isArchived: boolean) => Promise<void>;
  analyzeNote: (noteId: string) => Promise<any>;
  summarizeAllNotes: () => Promise<any>;
  getTodaysSummary: () => Promise<any>;
  organizeNotes: () => Promise<any>;
  completeReminder: (reminderId: string) => Promise<void>;
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

export const AINotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  const { programs } = useProgramContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch notes from ai_notes table
        const { data: notesData, error: notesError } = await supabase
          .from('ai_notes')
          .select('*')
          .order('updated_at', { ascending: false });

        if (notesError) {
          console.error('Error fetching notes:', notesError);
        } else {
          setNotes(notesData || []);
        }

        // Fetch folders
        const { data: foldersData, error: foldersError } = await supabase
          .from('note_folders')
          .select('*')
          .order('updated_at', { ascending: false });

        if (foldersError) {
          console.error('Error fetching folders:', foldersError);
        } else {
          setFolders(foldersData || []);
        }

        // Fetch insights
        const { data: insightsData, error: insightsError } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (insightsError) {
          console.error('Error fetching insights:', insightsError);
        } else {
          setInsights(insightsData || []);
        }

        // Fetch reminders
        const { data: remindersData, error: remindersError } = await supabase
          .from('smart_reminders')
          .select('*')
          .eq('is_completed', false)
          .order('due_date', { ascending: true });

        if (remindersError) {
          console.error('Error fetching reminders:', remindersError);
        } else {
          setReminders(remindersData || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const notesSubscription = supabase
      .channel('ai_notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_notes' }, async (payload) => {
        console.log('Note change received!', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          fetchData();
        }
      })
      .subscribe();

    const foldersSubscription = supabase
      .channel('note_folders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'note_folders' }, async (payload) => {
        console.log('Folder change received!', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          fetchData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notesSubscription);
      supabase.removeChannel(foldersSubscription);
    };
  }, []);

  const addNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'is_pinned' | 'is_archived'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_notes')
        .insert([{ ...note, is_pinned: false, is_archived: false }])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => (note.id === id ? { ...note, ...data } : note)));
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ai_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async (folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('note_folders')
        .insert([folder])
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFolder = async (id: string, updates: Partial<Omit<Folder, 'id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('note_folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => prev.map(folder => (folder.id === id ? { ...folder, ...data } : folder)));
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('note_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const pinNote = async (noteId: string, isPinned: boolean) => {
    try {
      await updateNote(noteId, { is_pinned: isPinned });
    } catch (error) {
      console.error('Error pinning note:', error);
      throw error;
    }
  };

  const archiveNote = async (noteId: string, isArchived: boolean) => {
    try {
      await updateNote(noteId, { is_archived: isArchived });
    } catch (error) {
      console.error('Error archiving note:', error);
      throw error;
    }
  };

  const analyzeNote = async (noteId: string) => {
    try {
      const noteToAnalyze = notes.find(n => n.id === noteId);
      if (!noteToAnalyze) throw new Error('Note not found');

      const prompt = getEnhancedAnalysisPrompt(noteToAnalyze, notes, programs);

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { 
          prompt,
          noteId,
          includeContext: true
        }
      });

      if (error) throw error;

      // Update the note with AI insights
      const updatedNote = {
        ...noteToAnalyze,
        ai_summary: data.analysis.summary,
        ai_insights: {
          key_insights: data.analysis.key_insights,
          next_steps: data.analysis.next_steps,
          priority_score: data.analysis.priority_score,
          connections: data.analysis.connections,
          timeline_impact: data.analysis.timeline_impact
        }
      };

      setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing note:', error);
      throw error;
    }
  };

  const summarizeAllNotes = async () => {
    try {
      const prompt = getDailySummaryPrompt(notes, programs);

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { 
          prompt,
          type: 'daily_summary',
          includeAllNotes: true
        }
      });

      if (error) throw error;

      // Create a daily summary note
      const summaryNote = {
        title: `Daily Summary - ${new Date().toLocaleDateString()}`,
        content: `Generated comprehensive daily summary based on ${notes.length} notes and ${programs.length} programs.`,
        context_type: 'general',
        ai_summary: data.analysis.summary,
        ai_insights: {
          key_insights: data.analysis.key_insights,
          next_steps: data.analysis.next_steps,
          priority_score: data.analysis.priority_score,
          urgency_flags: data.analysis.urgency_flags,
          progress_indicators: data.analysis.progress_indicators
        },
        is_generated: true
      };

      await addNote(summaryNote);
      return data.analysis;
    } catch (error) {
      console.error('Error creating daily summary:', error);
      throw error;
    }
  };

  const getTodaysSummary = async () => {
    try {
      return await summarizeAllNotes();
    } catch (error) {
      console.error('Error getting today\'s summary:', error);
      throw error;
    }
  };

  const organizeNotes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('organize-notes', {
        body: { notes }
      });

      if (error) throw error;

      // Update notes with organization suggestions
      return data;
    } catch (error) {
      console.error('Error organizing notes:', error);
      throw error;
    }
  };

  const completeReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .update({ is_completed: true })
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  };

  const value = {
    notes,
    folders,
    insights,
    reminders,
    addNote,
    updateNote,
    deleteNote,
    addFolder,
    updateFolder,
    deleteFolder,
    pinNote,
    archiveNote,
    analyzeNote,
    summarizeAllNotes,
    getTodaysSummary,
    organizeNotes,
    completeReminder,
    loading
  };

  return (
    <AINotesContext.Provider value={value}>
      {children}
    </AINotesContext.Provider>
  );
};

export default AINotesContext;
