
export const getAnalysisPrompt = (note: any, allNotes: any[], programs: any[]) => {
  const contextNotes = allNotes.filter(n => n.id !== note.id).slice(0, 10);
  const relatedProgram = programs.find(p => p.id === note.program_id);
  
  return `
Analyze this note and provide insights in a clear, readable format:

**Current Note:**
Title: ${note.title}
Content: ${note.content}
Context: ${note.context_type}
${relatedProgram ? `Program: ${relatedProgram.programName} at ${relatedProgram.university}` : ''}

**Related Notes Context:**
${contextNotes.map(n => `- ${n.title}: ${n.content.substring(0, 100)}...`).join('\n')}

Please structure your analysis like this:

## Quick Overview
Brief summary of what this note is about and its overall theme

## Key Insights
• First important insight or observation
• Second key point or pattern you notice
• Third valuable insight

## Recommended Next Steps
• Specific actionable step you can take right now
• Second concrete action item
• Third recommended step

## Priority & Context
Brief note about how urgent this is and how it connects to your other goals or notes

Keep your response conversational and helpful, like advice from a knowledgeable friend. Use clear formatting but keep the tone friendly and accessible.
`;
};

export const getTimelinePrompt = (notes: any[], programs: any[]) => {
  return `
Hey! 📅 I need you to create a timeline of events and milestones based on all these notes and programs. Make it practical and motivating!

**All Notes:**
${notes.map(n => `${n.created_at}: ${n.title} - ${n.content.substring(0, 150)}...`).join('\n\n')}

**Programs:**
${programs.map(p => `${p.programName} at ${p.university} - Deadline: ${p.applicationDeadline}`).join('\n')}

**Create a timeline that includes:**
1. **Past Events** - What's already happened based on the notes
2. **Current Phase** - Where they are right now in their journey
3. **Upcoming Milestones** - Key dates and deadlines coming up
4. **Suggested Actions** - What they should focus on each month

Make it encouraging and realistic. Use casual language but keep it organized.

Response format (JSON):
{
  "timeline_events": [
    {
      "date": "YYYY-MM-DD",
      "title": "Event Title",
      "description": "What happened/will happen",
      "type": "past|current|future",
      "category": "academic|application|financial|personal",
      "importance": "high|medium|low"
    }
  ],
  "current_phase": "string describing where they are now",
  "next_focus_areas": ["area1", "area2", "area3"],
  "motivation_message": "encouraging message about their progress"
}
`;
};

export const getInsightPrompt = (notes: any[], programs: any[]) => {
  return `
Time for some real talk! 💯 Analyze all these notes and give me insights that actually matter.

**All Notes Data:**
${notes.map(n => `${n.title} (${n.context_type}): ${n.content.substring(0, 100)}...`).join('\n')}

**Programs:**
${programs.map(p => `${p.programName} at ${p.university}`).join('\n')}

**Give me:**
1. **Patterns** - What themes/patterns do you see across all notes?
2. **Strengths** - What's going well based on their notes?
3. **Areas to Improve** - What needs attention (be honest but kind)?
4. **Recommendations** - Specific advice for their application journey
5. **Red Flags** - Anything concerning that needs immediate attention?

Be supportive but honest. Think like a mentor who wants to see them succeed!

Response format (JSON):
{
  "patterns": ["pattern1", "pattern2"],
  "strengths": ["strength1", "strength2"],
  "improvement_areas": ["area1", "area2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "red_flags": ["flag1", "flag2"],
  "overall_assessment": "string"
}
`;
};
