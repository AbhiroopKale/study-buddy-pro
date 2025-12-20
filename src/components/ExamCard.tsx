import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, BookOpen, Trash2 } from 'lucide-react';
import { Exam, Difficulty } from '@/types/study';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  exam: Exam;
  onDelete: (id: string) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function ExamCard({ exam, onDelete }: ExamCardProps) {
  const daysUntil = differenceInDays(exam.date, new Date());
  const isUrgent = daysUntil <= 3;

  return (
    <div className={cn(
      "group rounded-xl bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover border-l-4",
      isUrgent ? "border-destructive" : "border-primary"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">{exam.title}</h4>
            <Badge variant="outline" className={cn("text-xs", difficultyColors[exam.difficulty])}>
              {exam.difficulty}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mt-0.5">{exam.subject}</p>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(exam.date, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{exam.duration} min</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <BookOpen className="h-3 w-3 text-muted-foreground" />
            {exam.topics.slice(0, 3).map(topic => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {exam.topics.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{exam.topics.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "text-right",
            isUrgent ? "text-destructive" : "text-primary"
          )}>
            <p className="text-2xl font-bold">{daysUntil}</p>
            <p className="text-xs">days left</p>
          </div>
          <Button
            onClick={() => onDelete(exam.id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
