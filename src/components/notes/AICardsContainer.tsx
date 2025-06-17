
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Timeline, 
  Target, 
  Lightbulb, 
  FileText, 
  TrendingUp,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAINotesContext } from "@/contexts/AINotesContext";

interface AICard {
  id: string;
  type: 'insight' | 'action' | 'timeline' | 'comparison' | 'summary';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

interface AICardsContainerProps {
  selectedNote?: any;
}

const AICardsContainer = ({ selectedNote }: AICardsContainerProps) => {
  const [cards, setCards] = useState<AICard[]>([]);
  const [visibleCards, setVisibleCards] = useState<AICard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
  const { analyzeNote, notes } = useAINotesContext();

  const maxVisibleCards = 3;

  useEffect(() => {
    if (selectedNote) {
      generateContextualCards();
    } else {
      generateGeneralCards();
    }
  }, [selectedNote, notes]);

  useEffect(() => {
    updateVisibleCards();
  }, [cards, currentIndex, dismissedCards]);

  const detectNoteContext = (note: any) => {
    if (!note) return 'general';
    
    const content = (note.title + ' ' + note.content).toLowerCase();
    
    if (content.includes('deadline') || content.includes('due') || content.includes('urgent')) {
      return 'urgent';
    }
    if (content.includes('application') || content.includes('essay') || content.includes('statement')) {
      return 'application';
    }
    if (content.includes('research') || content.includes('thesis') || content.includes('study')) {
      return 'research';
    }
    if (content.includes('meeting') || content.includes('interview') || content.includes('call')) {
      return 'meeting';
    }
    return 'general';
  };

  const generateContextualCards = () => {
    if (!selectedNote) return;
    
    const context = detectNoteContext(selectedNote);
    const newCards: AICard[] = [];

    // Context-specific cards
    switch (context) {
      case 'urgent':
        newCards.push({
          id: 'emergency-plan',
          type: 'action',
          title: 'Emergency Action Plan',
          content: 'This note mentions urgent deadlines. Let me create a prioritized action plan.',
          priority: 'high',
          icon: <Target className="h-4 w-4" />,
          actionLabel: 'Create Plan',
          onAction: () => createEmergencyPlan()
        });
        break;
        
      case 'application':
        newCards.push({
          id: 'application-timeline',
          type: 'timeline',
          title: 'Application Timeline',
          content: 'I can create a timeline for your application process with key milestones.',
          priority: 'high',
          icon: <Timeline className="h-4 w-4" />,
          actionLabel: 'Build Timeline',
          onAction: () => createApplicationTimeline()
        });
        break;
        
      case 'research':
        newCards.push({
          id: 'research-structure',
          type: 'insight',
          title: 'Research Structure',
          content: 'I notice this is research-related. I can help organize your findings and suggest next steps.',
          priority: 'medium',
          icon: <FileText className="h-4 w-4" />,
          actionLabel: 'Organize',
          onAction: () => organizeResearch()
        });
        break;
    }

    // Always available cards based on note content
    if (selectedNote.content && selectedNote.content.length > 200) {
      newCards.push({
        id: 'smart-summary',
        type: 'summary',
        title: 'Smart Summary',
        content: 'This note has substantial content. I can create a concise summary with key points.',
        priority: 'medium',
        icon: <Sparkles className="h-4 w-4" />,
        actionLabel: 'Summarize',
        onAction: () => createSmartSummary()
      });
    }

    // Cross-note connections
    const relatedNotes = findRelatedNotes(selectedNote);
    if (relatedNotes.length > 0) {
      newCards.push({
        id: 'note-connections',
        type: 'comparison',
        title: 'Related Notes Found',
        content: `Found ${relatedNotes.length} related notes. I can show connections and patterns.`,
        priority: 'low',
        icon: <TrendingUp className="h-4 w-4" />,
        actionLabel: 'Show Connections',
        onAction: () => showConnections(relatedNotes)
      });
    }

    setCards(newCards);
  };

  const generateGeneralCards = () => {
    const newCards: AICard[] = [];

    // General productivity cards when no note is selected
    newCards.push({
      id: 'daily-overview',
      type: 'insight',
      title: 'Daily Overview',
      content: `You have ${notes.length} notes. I can create a summary of today's activity.`,
      priority: 'medium',
      icon: <Calendar className="h-4 w-4" />,
      actionLabel: 'View Today',
      onAction: () => createDailyOverview()
    });

    if (notes.length >= 5) {
      newCards.push({
        id: 'notes-organization',
        type: 'action',
        title: 'Organize Notes',
        content: 'Your notes collection is growing. I can help organize and categorize them.',
        priority: 'low',
        icon: <FileText className="h-4 w-4" />,
        actionLabel: 'Organize',
        onAction: () => organizeAllNotes()
      });
    }

    setCards(newCards);
  };

  const findRelatedNotes = (note: any) => {
    if (!note) return [];
    
    const noteWords = (note.title + ' ' + note.content).toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const keywords = noteWords.filter(word => word.length > 3 && !commonWords.has(word));
    
    return notes.filter(n => {
      if (n.id === note.id) return false;
      const content = (n.title + ' ' + n.content).toLowerCase();
      return keywords.some(keyword => content.includes(keyword));
    }).slice(0, 3);
  };

  const updateVisibleCards = () => {
    const filteredCards = cards.filter(card => !dismissedCards.has(card.id));
    const endIndex = Math.min(currentIndex + maxVisibleCards, filteredCards.length);
    setVisibleCards(filteredCards.slice(currentIndex, endIndex));
  };

  const dismissCard = (cardId: string) => {
    setDismissedCards(prev => new Set([...prev, cardId]));
  };

  const navigateCards = (direction: 'prev' | 'next') => {
    const filteredCards = cards.filter(card => !dismissedCards.has(card.id));
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else if (direction === 'next' && currentIndex + maxVisibleCards < filteredCards.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Action handlers
  const createEmergencyPlan = async () => {
    try {
      await analyzeNote(selectedNote.id);
      // Additional emergency plan logic
    } catch (error) {
      console.error('Failed to create emergency plan:', error);
    }
  };

  const createApplicationTimeline = async () => {
    try {
      await analyzeNote(selectedNote.id);
      // Additional timeline creation logic
    } catch (error) {
      console.error('Failed to create timeline:', error);
    }
  };

  const organizeResearch = async () => {
    try {
      await analyzeNote(selectedNote.id);
      // Additional research organization logic
    } catch (error) {
      console.error('Failed to organize research:', error);
    }
  };

  const createSmartSummary = async () => {
    try {
      await analyzeNote(selectedNote.id);
    } catch (error) {
      console.error('Failed to create summary:', error);
    }
  };

  const showConnections = (relatedNotes: any[]) => {
    // Logic to show note connections
    console.log('Showing connections:', relatedNotes);
  };

  const createDailyOverview = () => {
    // Logic to create daily overview
    console.log('Creating daily overview');
  };

  const organizeAllNotes = () => {
    // Logic to organize all notes
    console.log('Organizing all notes');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (visibleCards.length === 0) return null;

  const filteredCards = cards.filter(card => !dismissedCards.has(card.id));
  const hasMoreCards = filteredCards.length > maxVisibleCards;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Assistance</h3>
          <Badge variant="outline" className="text-xs">
            {filteredCards.length} suggestions
          </Badge>
        </div>
        
        {hasMoreCards && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCards('prev')}
              disabled={currentIndex === 0}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentIndex + 1}-{Math.min(currentIndex + maxVisibleCards, filteredCards.length)} of {filteredCards.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCards('next')}
              disabled={currentIndex + maxVisibleCards >= filteredCards.length}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleCards.map((card, index) => (
          <Card 
            key={card.id} 
            className={cn(
              "relative p-4 hover:shadow-md transition-all duration-200 border",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissCard(card.id)}
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                {card.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm truncate">{card.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs border", getPriorityColor(card.priority))}
                  >
                    {card.priority}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {card.content}
                </p>
                
                {card.onAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={card.onAction}
                    className="h-7 text-xs"
                  >
                    {card.actionLabel || 'Action'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AICardsContainer;
