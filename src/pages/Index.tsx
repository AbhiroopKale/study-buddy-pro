import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WelcomeCard } from '@/components/WelcomeCard';
import { StatsCards } from '@/components/StatsCards';
import { FocusTimer } from '@/components/FocusTimer';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { TasksList } from '@/components/TasksList';
import { ExamsList } from '@/components/ExamsList';
import { AIRecommendations } from '@/components/AIRecommendations';
import { AddNewDialog } from '@/components/AddNewDialog';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AddExamDialog } from '@/components/AddExamDialog';
import { useStudyPlan } from '@/hooks/useStudyPlan';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addExamOpen, setAddExamOpen] = useState(false);

  const { 
    tasks, 
    stats, 
    prioritizedTasks, 
    upcomingExams, 
    addTask,
    addExam,
    completeTask, 
    deleteTask, 
    deleteExam,
    addFocusTime 
  } = useStudyPlan();

  return (
    <>
      <Helmet>
        <title>StudyPlan - Personalized Study Plan Generator</title>
        <meta name="description" content="Create dynamic study plans that adjust based on difficulty, available time, upcoming exams, and task progress. Stay organized and achieve your academic goals." />
      </Helmet>
      
      <div className="flex min-h-screen bg-background">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onAddNew={() => setAddNewOpen(true)}
        />
        
        <main className="flex-1 ml-64">
          <Header />
          <div className="p-6">
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

                {/* AI Recommendations - Full Width */}
                <AIRecommendations tasks={tasks} exams={upcomingExams} />
              </div>

              {/* Right Column - Calendar and Timer */}
              <div className="space-y-6">
                <FocusTimer onSessionComplete={addFocusTime} />
                <WeeklyCalendar tasks={tasks} />
              </div>
            </div>
          </div>
        </main>

        <AddNewDialog
          open={addNewOpen}
          onOpenChange={setAddNewOpen}
          onSelectTask={() => setAddTaskOpen(true)}
          onSelectExam={() => setAddExamOpen(true)}
        />

        <AddTaskDialog
          open={addTaskOpen}
          onOpenChange={setAddTaskOpen}
          onAdd={addTask}
        />

        <AddExamDialog
          open={addExamOpen}
          onOpenChange={setAddExamOpen}
          onAdd={addExam}
        />
      </div>
    </>
  );
};

export default Index;
