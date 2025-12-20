import { format, isPast, isToday } from 'date-fns';
import { Check, Trash2, Clock, AlertCircle } from 'lucide-react';
import { StudyTask, Difficulty } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: StudyTask;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-destructive/10 text-destructive',
};

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const isOverdue = isPast(task.dueDate) && !isToday(task.dueDate) && task.status !== 'completed';
  const isDueToday = isToday(task.dueDate);

  return (
    <div
      className={cn(
        "group rounded-xl bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover border-l-4",
        task.status === 'completed' 
          ? "border-success opacity-60" 
          : isOverdue 
            ? "border-destructive" 
            : isDueToday 
              ? "border-warning" 
              : "border-primary"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "font-medium text-foreground truncate",
              task.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
            {isOverdue && task.status !== 'completed' && (
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-0.5">{task.subject}</p>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", difficultyColors[task.difficulty])}>
              {task.difficulty}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedMinutes} min</span>
            </div>
          </div>
          
          <p className={cn(
            "text-xs mt-2",
            isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {format(task.dueDate, 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'completed' && (
            <Button
              onClick={() => onComplete(task.id)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => onDelete(task.id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
