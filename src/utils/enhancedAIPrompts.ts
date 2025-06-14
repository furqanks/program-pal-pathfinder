
export const getEnhancedAnalysisPrompt = (note: any, allNotes: any[], programs: any[]) => {
  const contextNotes = allNotes.filter(n => n.id !== note.id).slice(0, 15);
  const relatedProgram = programs.find(p => p.id === note.program_id);
  
  // Create a comprehensive context from all notes
  const notesContext = contextNotes.map(n => ({
    title: n.title,
    content: n.content.substring(0, 200),
    context_type: n.context_type,
    created_at: n.created_at,
    updated_at: n.updated_at
  }));

  const userJourney = contextNotes
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(n => `${new Date(n.created_at).toLocaleDateString()}: ${n.title}`)
    .join('\n');

  return `
As an AI study abroad advisor, analyze this note within the complete context of the user's journey. Provide structured, actionable insights.

**CURRENT NOTE:**
Title: ${note.title}
Content: ${note.content}
Context: ${note.context_type}
Date: ${new Date(note.created_at).toLocaleDateString()}
${relatedProgram ? `Program: ${relatedProgram.programName} at ${relatedProgram.university}` : ''}

**USER'S COMPLETE JOURNEY (${contextNotes.length} previous notes):**
${userJourney}

**RECENT NOTES CONTEXT:**
${notesContext.map(n => `• ${n.title} (${n.context_type}): ${n.content}`).join('\n')}

**PROGRAMS IN CONSIDERATION:**
${programs.map(p => `• ${p.programName} at ${p.university} - Deadline: ${p.applicationDeadline}`).join('\n')}

**ANALYSIS REQUIREMENTS:**

1. **EXECUTIVE SUMMARY** (2-3 sentences)
   - Current status and main focus
   - Key developments since last note

2. **KEY INSIGHTS** (3-5 points)
   - Pattern analysis across all notes
   - Progress indicators
   - Emerging concerns or opportunities
   - Alignment with stated goals

3. **STRATEGIC NEXT STEPS** (3-4 actionable items with timeline)
   - Immediate actions (this week)
   - Short-term goals (next 2-4 weeks)
   - Medium-term planning (1-3 months)
   - Include specific deadlines and resources

4. **CONTEXTUAL ANALYSIS**
   - How this note fits into their overall journey
   - Connections to previous notes and decisions
   - Impact on program applications

5. **PRIORITY ASSESSMENT** (1-10 scale)
   - Urgency level based on deadlines and importance
   - Risk factors if action is delayed

Provide insights that show deep understanding of their academic journey, financial considerations, application timeline, and personal goals. Be encouraging yet realistic about challenges ahead.

Response format (JSON):
{
  "summary": "Comprehensive markdown-formatted summary with ### headings for Key Insights, Important Updates, Current Focus, and Timeline",
  "key_insights": ["insight1", "insight2", "insight3", "insight4"],
  "next_steps": ["action1 with timeline", "action2 with timeline", "action3 with timeline"],
  "priority_score": number,
  "connections": "How this relates to their overall journey and previous notes",
  "timeline_impact": "Effects on application deadlines and milestones"
}
`;
};

export const getDailySummaryPrompt = (allNotes: any[], programs: any[]) => {
  const todaysNotes = allNotes.filter(note => {
    const noteDate = new Date(note.created_at).toDateString();
    const today = new Date().toDateString();
    return noteDate === today;
  });

  const recentNotes = allNotes
    .filter(note => {
      const noteDate = new Date(note.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return noteDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);

  const upcomingDeadlines = programs
    .filter(p => new Date(p.applicationDeadline) > new Date())
    .sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime())
    .slice(0, 5);

  return `
Create a comprehensive daily summary for a study abroad applicant based on their complete note history and program timeline.

**TODAY'S ACTIVITY (${todaysNotes.length} notes):**
${todaysNotes.map(n => `• ${n.title}: ${n.content.substring(0, 150)}...`).join('\n')}

**RECENT CONTEXT (Past 7 days - ${recentNotes.length} notes):**
${recentNotes.map(n => `${new Date(n.created_at).toLocaleDateString()}: ${n.title} (${n.context_type})`).join('\n')}

**FULL NOTE HISTORY FOR CONTEXT:**
${allNotes.map(n => `${new Date(n.created_at).toLocaleDateString()}: ${n.title} - ${n.content.substring(0, 100)}...`).join('\n')}

**PROGRAM DEADLINES:**
${upcomingDeadlines.map(p => `• ${p.programName} at ${p.university} - Due: ${new Date(p.applicationDeadline).toLocaleDateString()}`).join('\n')}

Generate a daily summary that:

1. **Provides context-aware insights** based on their complete journey
2. **Identifies patterns** across all notes, not just today's
3. **Connects activities** to their overall application strategy
4. **Highlights progress** made toward goals
5. **Flags urgent items** based on deadlines and note content
6. **Suggests concrete next steps** with realistic timelines

Structure the summary with clear sections using markdown formatting:
- ### Daily Highlights
- ### Key Insights (from comprehensive note analysis)
- ### Important Updates (recent developments)
- ### Action Items (with timelines)
- ### Deadline Alerts

Make it encouraging and actionable, showing how today's work fits into their bigger picture.

Response format (JSON):
{
  "summary": "Comprehensive markdown-formatted daily summary with clear sections and actionable insights",
  "key_insights": ["pattern-based insight1", "progress insight2", "strategic insight3"],
  "next_steps": ["immediate action with deadline", "short-term goal with timeline", "strategic preparation step"],
  "priority_score": number,
  "urgency_flags": ["deadline-based urgency1", "opportunity-based urgency2"],
  "progress_indicators": ["positive development1", "area needing attention2"]
}
`;
};
