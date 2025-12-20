export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  difficulty: Difficulty;
  dueDate: Date;
  estimatedMinutes: number;
  status: TaskStatus;
  priority: Priority;
  createdAt: Date;
  completedAt?: Date;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: Date;
  duration: number; // in minutes
  topics: string[];
  difficulty: Difficulty;
}

export interface StudySession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  focusMinutes: number;
  breakMinutes: number;
}

export interface UserStats {
  pendingTasks: number;
  overdueTasks: number;
  completedTasks: number;
  streak: number;
  totalFocusMinutes: number;
}
