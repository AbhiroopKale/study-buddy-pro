import { useStudyPlan } from '@/hooks/useStudyPlan';
import { WelcomeCard } from './WelcomeCard';
import { StatsCards } from './StatsCards';
import { FocusTimer } from './FocusTimer';
import { WeeklyCalendar } from './WeeklyCalendar';
import { TasksList } from './TasksList';
import { ExamsList } from './ExamsList';

export function Dashboard() {
  const { 
    tasks, 
    stats, 
    prioritizedTasks, 
    upcomingExams, 
    completeTask, 
    deleteTask, 
    deleteExam,
    addFocusSession 
  } = useStudyPlan();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Content - Left 2 columns */}
      <div className="xl:col-span-2 space-y-6">
        <WelcomeCard stats={stats} userName="John" />
        <StatsCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TasksList 
            tasks={prioritizedTasks} 
            onComplete={completeTask} 
            onDelete={deleteTask} 
          />
          <ExamsList exams={upcomingExams} onDelete={deleteExam} />
        </div>
      </div>

      {/* Right Column - Calendar and Timer */}
      <div className="space-y-6">
        <FocusTimer onSessionComplete={addFocusSession} />
        <WeeklyCalendar tasks={tasks} />
      </div>
    </div>
  );
}
