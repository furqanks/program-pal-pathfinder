
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
  summarizeAllNotes: () => Promise<void>;
  getTodaysSummary: () => Promise<void>;
  organizeNotes: () => Promise<void>;
  convertExistingAIContent: () => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const { user } = useAuth();

  // Fetch data when user changes
  useEffect(() => {
    if (user && !hasFetchedData) {
      fetchAllData();
      setHasFetchedData(true);
    } else if (!user) {
      // Clear all data when user logs out
      setNotes([]);
      setFolders([]);
      setTemplates([]);
      setCollaborations([]);
      setInsights([]);
      setReminders([]);
      setLoading(false);
      setError(null);
      setHasFetchedData(false);
    }
  }, [user, hasFetchedData]);

  const fetchAllData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch notes (including shared ones)
      const { data: notesData, error: notesError } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        setError('Failed to load notes');
        return;
      }
      
      setNotes(notesData || []);

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('note_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (foldersError) {
        console.error('Error fetching folders:', foldersError);
      } else {
        setFolders(foldersData || []);
      }

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('note_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (templatesError) {
        console.error('Error fetching templates:', templatesError);
      } else {
        setTemplates(templatesData || []);
      }

      // Fetch collaborations
      const { data: collaborationsData, error: collaborationsError } = await supabase
        .from('note_collaborations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collaborationsError) {
        console.error('Error fetching collaborations:', collaborationsError);
      } else {
        setCollaborations(collaborationsData || []);
      }

      // Fetch insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
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
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('due_date', { ascending: true });

      if (remindersError) {
        console.error('Error fetching reminders:', remindersError);
      } else {
        setReminders(remindersData || []);
      }

      console.log('Successfully loaded notes data');

    } catch (error) {
      console.error('Error in fetchAllData:', error);
      setError('Failed to load notes data');
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

      toast.info('Analyzing your note... ✨');
      
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
      toast.error('Analysis failed. Please try again.');
    }
  };

  const summarizeAllNotes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      toast.info('Creating summary of all notes... 📝');

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { 
          action: 'summarize_all'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data?.summary) {
        const summaryNoteData = {
          title: `All Notes Summary - ${new Date().toLocaleDateString()}`,
          content: data.summary,
          context_type: 'general' as const,
          tags: ['summary', 'ai-generated']
        };

        await addNote(summaryNoteData);
        toast.success('Summary created as a new note! 📋✨');
      } else {
        toast.success('Summary complete! 📋✨');
      }

    } catch (error) {
      console.error('Error summarizing notes:', error);
      toast.error('Failed to create summary. Please try again!');
    }
  };

  const getTodaysSummary = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const today = new Date().toISOString().split('T')[0];
      const todaysNotes = notes.filter(note => 
        note.created_at.startsWith(today) || note.updated_at.startsWith(today)
      );

      if (todaysNotes.length === 0) {
        toast.info("No notes from today to summarize! 📅");
        return;
      }

      toast.info("Creating today's summary... 🌅");

      const summaryPrompt = `Create a summary of today's notes and activities. Focus on key insights, important updates, and action items from today's notes: ${todaysNotes.map(note => `${note.title}: ${note.content}`).join('\n\n')}`;

      const { data, error } = await supabase.functions.invoke('analyze-notes', {
        body: { 
          action: 'daily_summary',
          customPrompt: summaryPrompt,
          notes: todaysNotes
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data?.summary) {
        const dailySummaryNoteData = {
          title: `Daily Summary - ${new Date().toLocaleDateString()}`,
          content: data.summary,
          context_type: 'general' as const,
          tags: ['daily-summary', 'ai-generated']
        };

        await addNote(dailySummaryNoteData);
        toast.success("Today's summary created as a new note! 🎯");
      } else {
        toast.success("Today's summary is ready! 🎯");
      }

    } catch (error) {
      console.error('Error creating today\'s summary:', error);
      toast.error('Failed to create today\'s summary. Please try again!');
    }
  };

  const organizeNotes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const today = new Date().toISOString().split('T')[0];
      const todaysNotes = notes.filter(note => 
        note.created_at.startsWith(today) || note.updated_at.startsWith(today)
      );

      if (todaysNotes.length === 0) {
        toast.info("No notes from today to organize! 📅");
        return;
      }

      toast.info("Organizing today's notes with AI... 🤖✨");

      const { data, error } = await supabase.functions.invoke('organize-notes', {
        body: { 
          notes: todaysNotes
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data?.organization) {
        const organizationNoteData = {
          title: `Notes Organization - ${new Date().toLocaleDateString()}`,
          content: data.organization,
          context_type: 'general' as const,
          tags: ['organization', 'ai-generated']
        };

        await addNote(organizationNoteData);
        toast.success("Notes organized! 📋✨");
      } else {
        toast.success("Notes organized successfully! 📋✨");
      }

    } catch (error) {
      console.error('Error organizing notes:', error);
      toast.error('Failed to organize notes. Please try again!');
    }
  };

  const convertExistingAIContent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      toast.info('Converting existing AI content... 🔄');

      const { data, error } = await supabase.functions.invoke('convert-ai-content', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data?.processedCount > 0) {
        await fetchAllData();
        toast.success(`Successfully converted ${data.processedCount} notes! ✨`);
      } else {
        toast.success('All AI content is already in readable format! 👍');
      }

    } catch (error) {
      console.error('Error converting AI content:', error);
      toast.error('Failed to convert AI content. Please try again!');
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
      summarizeAllNotes,
      getTodaysSummary,
      organizeNotes,
      convertExistingAIContent,
      completeReminder,
      loading,
      error
    }}>
      {children}
    </AINotesContext.Provider>
  );
};

export default AINotesProvider;
