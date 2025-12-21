import { useState, useMemo, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, GripVertical } from 'lucide-react';
import { StudyTask, Exam } from '@/types/study';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MonthlyCalendarProps {
  tasks: StudyTask[];
  exams: Exam[];
  onUpdateTask: (id: string, updates: Partial<StudyTask>) => void;
}

export function MonthlyCalendar({ tasks, exams, onUpdateTask }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<StudyTask | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(task.dueDate, day));
  };

  const getExamsForDay = (day: Date) => {
    return exams.filter(exam => isSameDay(exam.date, day));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: StudyTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(day);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, day: Date) => {
    e.preventDefault();
    if (draggedTask) {
      onUpdateTask(draggedTask.id, { dueDate: day });
      toast.success(`Task rescheduled to ${format(day, 'MMM d')}`);
    }
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'hard': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Monthly Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Drag and drop tasks to reschedule them
        </p>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const dayExams = getExamsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDragOver = dragOverDate && isSameDay(day, dragOverDate);
            const isPast = isBefore(startOfDay(day), startOfDay(new Date())) && !isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-1 border rounded-lg transition-all duration-200",
                  isCurrentMonth ? "bg-card" : "bg-muted/30",
                  isToday(day) && "ring-2 ring-primary ring-offset-1",
                  isDragOver && "ring-2 ring-primary bg-primary/5",
                  isPast && "opacity-60"
                )}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className={cn(
                  "text-xs font-medium mb-1 px-1",
                  isToday(day) ? "text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1 max-h-[70px] overflow-y-auto">
                  {/* Exams */}
                  {dayExams.map(exam => (
                    <div
                      key={exam.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium truncate"
                      title={exam.title}
                    >
                      📝 {exam.title}
                    </div>
                  ))}

                  {/* Tasks */}
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded border cursor-grab active:cursor-grabbing flex items-center gap-1 group transition-all",
                        task.status === 'completed' 
                          ? "bg-success/10 text-success/70 line-through" 
                          : getDifficultyColor(task.difficulty),
                        draggedTask?.id === task.id && "opacity-50"
                      )}
                      title={`${task.title} - ${task.subject}`}
                    >
                      <GripVertical className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <span className="text-xs text-muted-foreground">Difficulty:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-success" />
              <span className="text-xs text-muted-foreground">Easy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-warning" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-destructive" />
              <span className="text-xs text-muted-foreground">Hard</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
