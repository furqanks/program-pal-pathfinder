import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, documentId, timeframe = '30d', ...params } = await req.json();
    
    let result;
    
    switch (action) {
      case 'get_writing_progress':
        result = await getWritingProgress(userId, timeframe);
        break;
      case 'get_document_analytics':
        result = await getDocumentAnalytics(documentId, userId);
        break;
      case 'get_productivity_insights':
        result = await getProductivityInsights(userId, timeframe);
        break;
      case 'get_score_progression':
        result = await getScoreProgression(userId, documentId);
        break;
      case 'get_portfolio_overview':
        result = await getPortfolioOverview(userId);
        break;
      case 'track_event':
        result = await trackEvent(userId, documentId, params.eventType, params.metadata);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getWritingProgress(userId: string, timeframe: string) {
  const days = parseInt(timeframe.replace('d', ''));
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Get writing sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('writing_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startDate)
    .order('started_at', { ascending: true });

  if (sessionsError) {
    throw new Error(`Failed to fetch writing sessions: ${sessionsError.message}`);
  }

  // Get document analytics
  const { data: analytics, error: analyticsError } = await supabase
    .from('document_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate);

  if (analyticsError) {
    throw new Error(`Failed to fetch analytics: ${analyticsError.message}`);
  }

  // Calculate progress metrics
  const totalSessions = sessions?.length || 0;
  const totalTimeSpent = sessions?.reduce((sum, session) => sum + (session.time_spent_seconds || 0), 0) || 0;
  const totalWords = sessions?.reduce((sum, session) => sum + (session.word_count_end - session.word_count_start), 0) || 0;
  const avgWordsPerSession = totalSessions > 0 ? Math.round(totalWords / totalSessions) : 0;
  const avgTimePerSession = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions / 60) : 0; // minutes

  // Group sessions by day for chart data
  const dailyProgress = sessions?.reduce((acc, session) => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { words: 0, time: 0, sessions: 0 };
    }
    acc[date].words += session.word_count_end - session.word_count_start;
    acc[date].time += session.time_spent_seconds || 0;
    acc[date].sessions += 1;
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    totalSessions,
    totalTimeSpent: Math.round(totalTimeSpent / 60), // minutes
    totalWords,
    avgWordsPerSession,
    avgTimePerSession,
    dailyProgress,
    streak: calculateWritingStreak(sessions || [])
  };
}

async function getDocumentAnalytics(documentId: string, userId: string) {
  // Get document details
  const { data: document, error: docError } = await supabase
    .from('user_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (docError || !document) {
    throw new Error('Document not found or access denied');
  }

  // Get document versions
  const { data: versions, error: versionsError } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: true });

  // Get writing sessions for this document
  const { data: sessions, error: sessionsError } = await supabase
    .from('writing_sessions')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', userId)
    .order('started_at', { ascending: true });

  // Get comments
  const { data: comments, error: commentsError } = await supabase
    .from('document_comments')
    .select('*')
    .eq('document_id', documentId);

  const wordCount = document.original_text.split(/\s+/).length;
  const sessionCount = sessions?.length || 0;
  const versionCount = (versions?.length || 0) + 1; // Include original
  const commentCount = comments?.length || 0;
  
  const scoreHistory = versions?.map(v => ({
    version: v.version_number,
    score: Math.floor(Math.random() * 40) + 60, // Placeholder
    date: v.created_at
  })) || [];

  return {
    document,
    wordCount,
    sessionCount,
    versionCount,
    commentCount,
    scoreHistory,
    lastModified: document.updated_at || document.created_at,
    timeSpent: sessions?.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) || 0
  };
}

async function getProductivityInsights(userId: string, timeframe: string) {
  const days = parseInt(timeframe.replace('d', ''));
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions, error } = await supabase
    .from('writing_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startDate);

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  // Analyze patterns
  const hourlyActivity = sessions?.reduce((acc, session) => {
    const hour = new Date(session.started_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  const mostProductiveHour = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '10';

  const weeklyActivity = sessions?.reduce((acc, session) => {
    const day = new Date(session.started_at).getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[day];
    acc[dayName] = (acc[dayName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const bestDay = Object.entries(weeklyActivity)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Monday';

  return {
    mostProductiveHour: `${mostProductiveHour}:00`,
    bestDay,
    hourlyActivity,
    weeklyActivity,
    insights: [
      `You're most productive at ${mostProductiveHour}:00`,
      `${bestDay}s are your most active writing days`,
      `You've written for ${sessions?.length || 0} sessions in the last ${days} days`
    ]
  };
}

async function getScoreProgression(userId: string, documentId?: string) {
  let query = supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .not('score', 'is', null)
    .order('created_at', { ascending: true });

  if (documentId) {
    query = query.eq('id', documentId);
  }

  const { data: documents, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch score progression: ${error.message}`);
  }

  const scoreData = documents?.map(doc => ({
    documentType: doc.document_type,
    score: doc.score,
    date: doc.created_at,
    documentId: doc.id,
    version: doc.version_number
  })) || [];

  const averageScores = documents?.reduce((acc, doc) => {
    const type = doc.document_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc.score);
    return acc;
  }, {} as Record<string, number[]>) || {};

  const avgByType = Object.entries(averageScores).reduce((acc, [type, scores]) => {
    acc[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return acc;
  }, {} as Record<string, number>);

  return {
    scoreData,
    averageByType: avgByType,
    overallAverage: scoreData.length > 0 
      ? scoreData.reduce((sum, item) => sum + item.score, 0) / scoreData.length 
      : 0,
    improvement: calculateImprovement(scoreData)
  };
}

async function getPortfolioOverview(userId: string) {
  // Get all documents
  const { data: documents, error: docsError } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (docsError) {
    throw new Error(`Failed to fetch documents: ${docsError.message}`);
  }

  // Get user programs
  const { data: programs, error: programsError } = await supabase
    .from('programs_saved')
    .select('*')
    .eq('user_id', userId);

  const documentsByType = documents?.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const completedDocuments = documents?.filter(doc => doc.score && doc.score >= 7).length || 0;
  const totalDocuments = documents?.length || 0;
  const completionRate = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;

  const applicationReadiness = programs?.map(program => {
    const programDocs = documents?.filter(doc => doc.program_id === program.id) || [];
    const requiredDocs = ['SOP', 'CV', 'LOR']; // Basic requirements
    const completedRequired = requiredDocs.filter(type => 
      programDocs.some(doc => doc.document_type === type && doc.score && doc.score >= 7)
    ).length;
    
    return {
      programName: program.program_name,
      university: program.university,
      readinessScore: (completedRequired / requiredDocs.length) * 100,
      missingDocuments: requiredDocs.filter(type => 
        !programDocs.some(doc => doc.document_type === type && doc.score && doc.score >= 7)
      )
    };
  }) || [];

  return {
    totalDocuments,
    completedDocuments,
    completionRate,
    documentsByType,
    programs: programs?.length || 0,
    applicationReadiness,
    recentActivity: documents?.slice(0, 5) || []
  };
}

async function trackEvent(userId: string, documentId: string, eventType: string, metadata: any) {
  const { data, error } = await supabase
    .from('document_analytics')
    .insert({
      user_id: userId,
      document_id: documentId,
      event_type: eventType,
      metadata: metadata || {}
    });

  if (error) {
    throw new Error(`Failed to track event: ${error.message}`);
  }

  return { success: true, eventType };
}

function calculateWritingStreak(sessions: any[]) {
  if (!sessions.length) return 0;
  
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check if user wrote today or yesterday
  const sessionDates = sessions.map(s => new Date(s.started_at).toDateString());
  const uniqueDates = [...new Set(sessionDates)].sort();
  
  if (uniqueDates.includes(today.toDateString()) || 
      uniqueDates.includes(new Date(today.getTime() - 24*60*60*1000).toDateString())) {
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const sessionDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (24*60*60*1000));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }
  }
  
  return streak;
}

function calculateImprovement(scoreData: any[]) {
  if (scoreData.length < 2) return 0;
  
  const firstScore = scoreData[0].score;
  const lastScore = scoreData[scoreData.length - 1].score;
  
  return ((lastScore - firstScore) / firstScore) * 100;
}