import { useState, useCallback, useMemo } from 'react';
import { StudyTask, Exam, UserStats, Difficulty, TaskStatus, Priority, FocusSession } from '@/types/study';
import { isAfter, isBefore, startOfDay, addDays, subDays, subHours } from 'date-fns';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialTasks: StudyTask[] = [
  {
    id: generateId(),
    title: 'Complete Chapter 5 Problems',
    subject: 'Mathematics',
    difficulty: 'medium',
    dueDate: addDays(new Date(), 1),
    estimatedMinutes: 45,
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    title: 'Review Biology Notes',
    subject: 'Biology',
    difficulty: 'easy',
    dueDate: addDays(new Date(), 2),
    estimatedMinutes: 30,
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    title: 'Essay Draft - History',
    subject: 'History',
    difficulty: 'hard',
    dueDate: addDays(new Date(), 3),
    estimatedMinutes: 90,
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
  },
];

const initialExams: Exam[] = [
  {
    id: generateId(),
    title: 'Calculus Midterm',
    subject: 'Mathematics',
    date: addDays(new Date(), 7),
    duration: 120,
    topics: ['Derivatives', 'Integrals', 'Limits'],
    difficulty: 'hard',
  },
  {
    id: generateId(),
    title: 'Biology Quiz',
    subject: 'Biology',
    date: addDays(new Date(), 3),
    duration: 45,
    topics: ['Cell Structure', 'Genetics'],
    difficulty: 'medium',
  },
];

// Generate sample historical focus sessions for the past week
const generateInitialSessions = (): FocusSession[] => {
  const sessions: FocusSession[] = [];
  const now = new Date();
  
  // Add sample sessions for the past 7 days
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
    for (let s = 0; s < sessionsPerDay; s++) {
      const startHour = 9 + Math.floor(Math.random() * 10);
      const startTime = new Date(subDays(now, daysAgo));
      startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
      
      const duration = [15, 25, 25, 25, 30, 45][Math.floor(Math.random() * 6)];
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      sessions.push({
        id: generateId(),
        startTime,
        endTime,
        durationMinutes: duration,
        completed: Math.random() > 0.15,
      });
    }
  }
  
  return sessions;
};

export function useStudyPlan() {
  const [tasks, setTasks] = useState<StudyTask[]>(initialTasks);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(generateInitialSessions);
  const [focusMinutes, setFocusMinutes] = useState(0);

  const stats: UserStats = useMemo(() => {
    const now = startOfDay(new Date());
    const pending = tasks.filter(t => t.status === 'pending' && !isBefore(t.dueDate, now)).length;
    const overdue = tasks.filter(t => t.status === 'pending' && isBefore(t.dueDate, now)).length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    // Calculate streak (simplified - consecutive days with completed tasks)
    let streak = 0;
    const completedDates = tasks
      .filter(t => t.completedAt)
      .map(t => startOfDay(t.completedAt!).getTime())
      .sort((a, b) => b - a);
    
    if (completedDates.length > 0) {
      const today = startOfDay(new Date()).getTime();
      const yesterday = startOfDay(addDays(new Date(), -1)).getTime();
      
      if (completedDates.includes(today) || completedDates.includes(yesterday)) {
        streak = 1;
        let checkDate = yesterday;
        while (completedDates.includes(checkDate)) {
          streak++;
          checkDate = startOfDay(addDays(new Date(checkDate), -1)).getTime();
        }
      }
    }
    
    return { pendingTasks: pending, overdueTasks: overdue, completedTasks: completed, streak, totalFocusMinutes: focusMinutes };
  }, [tasks, focusMinutes]);

  const addTask = useCallback((task: Omit<StudyTask, 'id' | 'createdAt' | 'status'>) => {
    const newTask: StudyTask = {
      ...task,
      id: generateId(),
      status: 'pending',
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<StudyTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'completed' as TaskStatus, completedAt: new Date() } : t
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addExam = useCallback((exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...exam, id: generateId() };
    setExams(prev => [...prev, newExam]);
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  }, []);

  const addFocusSession = useCallback((minutes: number, completed: boolean = true) => {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutes * 60000);
    
    const newSession: FocusSession = {
      id: generateId(),
      startTime,
      endTime,
      durationMinutes: minutes,
      completed,
    };
    
    setFocusSessions(prev => [...prev, newSession]);
    setFocusMinutes(prev => prev + minutes);
  }, []);

  // Get prioritized tasks based on difficulty, due date, and exams
  const prioritizedTasks = useMemo(() => {
    const now = new Date();
    return [...tasks]
      .filter(t => t.status === 'pending')
      .sort((a, b) => {
        // Overdue tasks first
        const aOverdue = isBefore(a.dueDate, now);
        const bOverdue = isBefore(b.dueDate, now);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        
        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        // Then by due date
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
  }, [tasks]);

  // Get upcoming exams sorted by date
  const upcomingExams = useMemo(() => {
    return [...exams]
      .filter(e => isAfter(e.date, new Date()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [exams]);

  return {
    tasks,
    exams,
    stats,
    focusSessions,
    prioritizedTasks,
    upcomingExams,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    addExam,
    deleteExam,
    addFocusSession,
  };
}
