import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { StudyTask } from '@/types/study';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TasksListProps {
  tasks: StudyTask[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TasksList({ tasks, onComplete, onDelete }: TasksListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const subjects = [...new Set(tasks.map(t => t.subject))];
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.status !== 'pending') return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
    return true;
  });

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h3 className="font-semibold text-foreground">Tasks</h3>
        <div className="flex items-center gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <div 
              key={task.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
