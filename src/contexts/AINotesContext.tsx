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
}

interface AINotesContextType {
  notes: Note[];
  folders: Folder[];
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
  const [loading, setLoading] = useState(false);

  const { programs } = useProgramContext();

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });

        if (notesError) {
          console.error('Error fetching notes:', notesError);
          return;
        }

        setNotes(notesData || []);

        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .order('updated_at', { ascending: false });

        if (foldersError) {
          console.error('Error fetching folders:', foldersError);
          return;
        }

        setFolders(foldersData || []);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();

    const notesSubscription = supabase
      .channel('notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, async (payload) => {
        console.log('Note change received!', payload);
        const { data, event } = payload;
        if (event === 'INSERT' || event === 'UPDATE' || event === 'DELETE') {
          fetchNotes();
        }
      })
      .subscribe();

    const foldersSubscription = supabase
      .channel('folders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'folders' }, async (payload) => {
        console.log('Folder change received!', payload);
        const { data, event } = payload;
        if (event === 'INSERT' || event === 'UPDATE' || event === 'DELETE') {
          fetchNotes();
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
        .from('notes')
        .insert([{ ...note, is_pinned: false, is_archived: false }])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => (note.id === id ? { ...note, ...data } : note)));
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async (folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([folder])
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFolder = async (id: string, updates: Partial<Omit<Folder, 'id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => prev.map(folder => (folder.id === id ? { ...folder, ...data } : folder)));
    } catch (error) {
      console.error('Error updating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error) {
      console.error('Error deleting folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const pinNote = async (noteId: string, isPinned: boolean) => {
    try {
      await updateNote(noteId, { is_pinned: isPinned });
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const archiveNote = async (noteId: string, isArchived: boolean) => {
    try {
      await updateNote(noteId, { is_archived: isArchived });
    } catch (error) {
      console.error('Error archiving note:', error);
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

  const value = {
    notes,
    folders,
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
    loading
  };

  return (
    <AINotesContext.Provider value={value}>
      {children}
    </AINotesContext.Provider>
  );
};

export default AINotesContext;
