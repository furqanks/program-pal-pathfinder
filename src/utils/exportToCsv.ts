
import { Program } from "@/contexts/ProgramContext";
import { format, isValid, parseISO } from "date-fns";

export const exportProgramsToCsv = (programs: Program[]) => {
  const headers = [
    'Program Name',
    'University',
    'Degree Type',
    'Country',
    'Tuition',
    'Deadline',
    'Status',
    'Notes',
    'Tasks'
  ];
  
  const rows = programs.map(program => {
    const formattedDeadline = program.deadline && isValid(parseISO(program.deadline)) 
      ? format(parseISO(program.deadline), "yyyy-MM-dd")
      : "";
    
    const tasks = program.tasks
      .map(task => `${task.completed ? '✓' : '□'} ${task.title}`)
      .join('; ');
    
    return [
      program.programName,
      program.university,
      program.degreeType,
      program.country,
      program.tuition,
      formattedDeadline,
      program.statusTagId,
      program.notes,
      tasks
    ];
  });
  
  const csvContent = [
    headers,
    ...rows
  ]
  .map(row => row.map(cell => {
    // Escape quotes and wrap in quotes if necessary
    const content = String(cell || '');
    return content.includes(',') || content.includes('\n') || content.includes('"')
      ? `"${content.replace(/"/g, '""')}"`
      : content;
  }).join(','))
  .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `program-shortlist-${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
