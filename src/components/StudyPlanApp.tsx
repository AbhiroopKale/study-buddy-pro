import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { AddNewDialog } from '@/components/AddNewDialog';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AddExamDialog } from '@/components/AddExamDialog';
import { useStudyPlan } from '@/hooks/useStudyPlan';
import { Helmet } from 'react-helmet-async';

export function StudyPlanApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addExamOpen, setAddExamOpen] = useState(false);

  const { addTask, addExam } = useStudyPlan();

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
            <Dashboard />
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
}
