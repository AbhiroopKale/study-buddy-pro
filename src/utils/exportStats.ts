import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudyTask, FocusSession, UserStats } from '@/types/study';
import { format, subDays, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';

interface ExportData {
  tasks: StudyTask[];
  focusSessions: FocusSession[];
  stats: UserStats;
}

// Generate weekly data for export
function generateWeeklyData(tasks: StudyTask[], focusSessions: FocusSession[]) {
  const today = startOfDay(new Date());
  const days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  return days.map((day) => {
    const dayTasks = tasks.filter(task => 
      task.completedAt && 
      startOfDay(task.completedAt).getTime() === day.getTime()
    );
    
    const daySessions = focusSessions.filter(session => 
      isSameDay(session.startTime, day)
    );
    const focusMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    
    return {
      date: format(day, 'MMM d, yyyy'),
      completedTasks: dayTasks.length,
      focusMinutes,
      sessions: daySessions.length,
    };
  });
}

export function exportToCSV(data: ExportData) {
  const weeklyData = generateWeeklyData(data.tasks, data.focusSessions);
  
  // Weekly Summary
  let csv = 'WEEKLY PRODUCTIVITY SUMMARY\n';
  csv += 'Date,Completed Tasks,Focus Minutes,Sessions\n';
  weeklyData.forEach(row => {
    csv += `${row.date},${row.completedTasks},${row.focusMinutes},${row.sessions}\n`;
  });
  
  csv += '\n\nTASKS\n';
  csv += 'Title,Subject,Difficulty,Status,Due Date,Priority\n';
  data.tasks.forEach(task => {
    csv += `"${task.title}","${task.subject}",${task.difficulty},${task.status},${task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : 'N/A'},${task.priority}\n`;
  });
  
  csv += '\n\nFOCUS SESSIONS\n';
  csv += 'Date,Time,Duration (mins),Completed\n';
  data.focusSessions.forEach(session => {
    csv += `${format(session.startTime, 'MMM d, yyyy')},${format(session.startTime, 'h:mm a')},${session.durationMinutes},${session.completed ? 'Yes' : 'No'}\n`;
  });
  
  csv += '\n\nOVERALL STATS\n';
  csv += `Total Tasks Completed,${data.stats.completedTasks}\n`;
  csv += `Focus Time (minutes),${data.stats.totalFocusMinutes}\n`;
  csv += `Current Streak (days),${data.stats.streak}\n`;
  csv += `Pending Tasks,${data.stats.pendingTasks}\n`;
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `study-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToPDF(data: ExportData) {
  const doc = new jsPDF();
  const weeklyData = generateWeeklyData(data.tasks, data.focusSessions);
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('Study Statistics Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, 14, 28);
  
  // Overall Stats Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Overall Performance', 14, 40);
  
  autoTable(doc, {
    startY: 45,
    head: [['Metric', 'Value']],
    body: [
      ['Tasks Completed', data.stats.completedTasks.toString()],
      ['Focus Time', `${Math.floor(data.stats.totalFocusMinutes / 60)}h ${data.stats.totalFocusMinutes % 60}m`],
      ['Current Streak', `${data.stats.streak} days`],
      ['Pending Tasks', data.stats.pendingTasks.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
  });
  
  // Weekly Summary
  const finalY1 = (doc as any).lastAutoTable.finalY || 80;
  doc.setFontSize(14);
  doc.text('Weekly Productivity', 14, finalY1 + 15);
  
  autoTable(doc, {
    startY: finalY1 + 20,
    head: [['Date', 'Tasks Done', 'Focus (mins)', 'Sessions']],
    body: weeklyData.map(row => [
      row.date,
      row.completedTasks.toString(),
      row.focusMinutes.toString(),
      row.sessions.toString(),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
  });
  
  // Tasks Table
  const finalY2 = (doc as any).lastAutoTable.finalY || 150;
  
  if (finalY2 > 230) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Tasks Overview', 14, 20);
    
    autoTable(doc, {
      startY: 25,
      head: [['Title', 'Subject', 'Difficulty', 'Status']],
      body: data.tasks.slice(0, 15).map(task => [
        task.title.substring(0, 30),
        task.subject,
        task.difficulty,
        task.status,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });
  } else {
    doc.setFontSize(14);
    doc.text('Tasks Overview', 14, finalY2 + 15);
    
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Title', 'Subject', 'Difficulty', 'Status']],
      body: data.tasks.slice(0, 10).map(task => [
        task.title.substring(0, 30),
        task.subject,
        task.difficulty,
        task.status,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });
  }
  
  // Focus Sessions
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Recent Focus Sessions', 14, 20);
  
  autoTable(doc, {
    startY: 25,
    head: [['Date', 'Time', 'Duration', 'Status']],
    body: data.focusSessions.slice(0, 20).map(session => [
      format(session.startTime, 'MMM d, yyyy'),
      format(session.startTime, 'h:mm a'),
      `${session.durationMinutes} mins`,
      session.completed ? 'Completed' : 'Partial',
    ]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
  });
  
  // Save
  doc.save(`study-stats-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
