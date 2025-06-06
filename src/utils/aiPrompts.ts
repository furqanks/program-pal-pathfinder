
export const getAnalysisPrompt = (note: any, allNotes: any[], programs: any[]) => {
  const contextNotes = allNotes.filter(n => n.id !== note.id).slice(0, 10);
  const relatedProgram = programs.find(p => p.id === note.program_id);
  
  return `
Yo! 👋 I need you to analyze this note in a super casual, Gen Z way. Keep it real and helpful!

**Current Note:**
Title: ${note.title}
Content: ${note.content}
Context: ${note.context_type}
${relatedProgram ? `Program: ${relatedProgram.programName} at ${relatedProgram.university}` : ''}

**Previous Notes Context:**
${contextNotes.map(n => `- ${n.title}: ${n.content.substring(0, 100)}...`).join('\n')}

**What I need from you:**
1. **Vibe Check** - What's the overall mood/energy of this note? (anxious, excited, confused, etc.)
2. **Key Insights** - Break down the main points but make it digestible 
3. **Next Steps** - Give me 2-3 SPECIFIC actionable things I can do right now
4. **Categories** - Tag this with relevant categories (academic, financial, application, research, personal, etc.)
5. **Priority Level** - Rate urgency 1-10 (1 = chill, 10 = DROP EVERYTHING NOW)
6. **Connections** - How does this relate to my other notes/goals?

Keep it conversational but helpful - like advice from a smart friend who actually gets it! Use emojis where it makes sense but don't go overboard.

Response format (JSON):
{
  "vibe_check": "string",
  "key_insights": ["insight1", "insight2", "insight3"],
  "next_steps": ["action1", "action2", "action3"],
  "categories": ["category1", "category2"],
  "priority_score": number,
  "connections": "string",
  "summary": "brief casual summary"
}
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
