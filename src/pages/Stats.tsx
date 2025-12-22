import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StudyAnalytics } from '@/components/StudyAnalytics';
import { useStudyPlan } from '@/hooks/useStudyPlan';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddNewDialog } from '@/components/AddNewDialog';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AddExamDialog } from '@/components/AddExamDialog';

const Stats = () => {
  const navigate = useNavigate();
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addExamOpen, setAddExamOpen] = useState(false);
  
  const { tasks, stats, focusSessions, addTask, addExam } = useStudyPlan();

  const handleTabChange = (tab: string) => {
    if (tab === 'stats') return;
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Your Stats - StudyPlan</title>
        <meta name="description" content="View your study statistics, productivity trends, focus time analytics, and completed tasks over time." />
      </Helmet>
      
      <div className="flex min-h-screen bg-background">
        <Sidebar 
          activeTab="stats" 
          onTabChange={handleTabChange}
          onAddNew={() => setAddNewOpen(true)}
        />
        
        <main className="flex-1 ml-64">
          <Header />
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Your Stats</h1>
              <p className="text-muted-foreground mt-1">Track your study progress and productivity trends</p>
            </div>
            <StudyAnalytics tasks={tasks} stats={stats} focusSessions={focusSessions} />
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

export default Stats;