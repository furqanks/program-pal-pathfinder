
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getAnalysisPrompt, getTimelinePrompt, getInsightPrompt } from '@/utils/aiPrompts';

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
  rich_content?: Record<string, any>;
  attachments: any[];
  is_archived: boolean;
  is_pinned: boolean;
  shared_with?: string[];
  folder_id?: string;
  last_viewed_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  last_ai_analysis?: string;
}

export interface NoteFolder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NoteTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  template_content: Record<string, any>;
  is_public: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCollaboration {
  id: string;
  note_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'admin';
  invited_by?: string;
  accepted_at?: string;
  created_at: string;
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
  folders: NoteFolder[];
  templates: NoteTemplate[];
  collaborations: NoteCollaboration[];
  insights: AIInsight[];
  reminders: SmartReminder[];
  addNote: (note: Omit<AINote, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'ai_categories' | 'ai_insights' | 'priority_score' | 'attachments' | 'is_archived' | 'is_pinned' | 'view_count'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<AINote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  addFolder: (folder: Omit<NoteFolder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<NoteFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addTemplate: (template: Omit<NoteTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  analyzeNote: (noteId: string) => Promise<void>;
  analyzeAllNotes: () => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  loading: boolean;
}

const AINotesContext = createContext<AINotesContextType | undefined>(undefined);

export const useAINotesContext = () => {
  const context = useContext(AINotesContext);
  if (!context) {
    throw new Error('use AINotesContext must be used within an AINotesProvider');
  }
  return context;
};

export const AINotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<AINote[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [collaborations, setCollaborations] = useState<NoteCollaboration[]>([]);
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
      setFolders([]);
      setTemplates([]);
      setCollaborations([]);
      setInsights([]);
      setReminders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch notes (including shared ones)
      const { data: notesData, error: notesError } = await supabase
        .from('ai_notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('note_folders')
        .select('*')
        .order('name');

      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('note_templates')
        .select('*')
        .order('name');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Fetch collaborations
      const { data: collaborationsData, error: collaborationsError } = await supabase
        .from('note_collaborations')
        .select('*')
        .order('created_at', { ascending: false });

      if (collaborationsError) throw collaborationsError;
      setCollaborations(collaborationsData || []);

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
        .order('due_date', { ascending: true });

      if (remindersError) throw remindersError;
      setReminders(remindersData || []);

    } catch (error) {
      console.error('Error fetching AI notes data:', error);
      toast.error('Failed to load notes data');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: Omit<AINote, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'ai_categories' | 'ai_insights' | 'priority_score' | 'attachments' | 'is_archived' | 'is_pinned' | 'view_count'>) => {
    if (!user) return;

    try {
      // Clean the data to ensure proper null values for UUIDs
      const cleanedNoteData = {
        user_id: user.id,
        title: noteData.title,
        content: noteData.content,
        program_id: noteData.program_id || null,
        tags: noteData.tags,
        context_type: noteData.context_type,
        rich_content: noteData.rich_content,
        folder_id: noteData.folder_id || null,
        ai_categories: [],
        ai_insights: {},
        priority_score: 0,
        attachments: [],
        is_archived: false,
        is_pinned: false,
        view_count: 0
      };

      const { data, error } = await supabase
        .from('ai_notes')
        .insert(cleanedNoteData)
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

  const archiveNote = async (id: string, archived: boolean) => {
    await updateNote(id, { is_archived: archived });
    toast.success(archived ? 'Note archived' : 'Note unarchived');
  };

  const pinNote = async (id: string, pinned: boolean) => {
    await updateNote(id, { is_pinned: pinned });
    toast.success(pinned ? 'Note pinned' : 'Note unpinned');
  };

  const addFolder = async (folderData: Omit<NoteFolder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_folders')
        .insert({
          user_id: user.id,
          ...folderData
        })
        .select()
        .single();

      if (error) throw error;

      setFolders([...folders, data]);
      toast.success('Folder created successfully');

    } catch (error) {
      console.error('Error adding folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const updateFolder = async (id: string, updates: Partial<NoteFolder>) => {
    try {
      const { error } = await supabase
        .from('note_folders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setFolders(folders.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      ));
      toast.success('Folder updated successfully');

    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('note_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(folders.filter(folder => folder.id !== id));
      toast.success('Folder deleted successfully');

    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const addTemplate = async (templateData: Omit<NoteTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_templates')
        .insert({
          user_id: user.id,
          ...templateData
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates([...templates, data]);
      toast.success('Template created successfully');

    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Failed to create template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter(template => template.id !== id));
      toast.success('Template deleted successfully');

    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const analyzeNote = async (noteId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      toast.info('Analyzing your note... ✨ Gimme a sec!');
      
      const noteToAnalyze = notes.find(note => note.id === noteId);
      if (!noteToAnalyze) throw new Error('Note not found');
      
      const analysisPrompt = getAnalysisPrompt(noteToAnalyze, notes, []);
      
      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { 
          noteId, 
          action: 'analyze_single',
          customPrompt: analysisPrompt
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

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

      toast.success('Note analyzed successfully! 🧠✨');

    } catch (error) {
      console.error('Error analyzing note:', error);
      toast.error('Oops! Analysis failed. Try again?');
    }
  };

  const analyzeAllNotes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      toast.info('Analyzing all notes... This might take a minute! ⏳');

      const insightsPrompt = getInsightPrompt(notes, []);
      const timelinePrompt = getTimelinePrompt(notes, []);

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { 
          action: 'analyze_all',
          insightsPrompt, 
          timelinePrompt
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      await fetchAllData();
      toast.success('All done! Your notes are now super-charged with insights! 💪');

    } catch (error) {
      console.error('Error analyzing all notes:', error);
      toast.error('Failed to analyze notes. Please try again later!');
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
      toast.success('Reminder completed! 🎉');

    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  return (
    <AINotesContext.Provider value={{
      notes,
      folders,
      templates,
      collaborations,
      insights,
      reminders,
      addNote,
      updateNote,
      deleteNote,
      archiveNote,
      pinNote,
      addFolder,
      updateFolder,
      deleteFolder,
      addTemplate,
      deleteTemplate,
      analyzeNote,
      analyzeAllNotes,
      completeReminder,
      loading
    }}>
      {children}
    </AINotesContext.Provider>
  );
};
