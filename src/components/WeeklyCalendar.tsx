import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyTask } from '@/types/study';
import { cn } from '@/lib/utils';

interface WeeklyCalendarProps {
  tasks: StudyTask[];
}

export function WeeklyCalendar({ tasks }: WeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

  const tasksForDate = tasks.filter(task => 
    isSameDay(task.dueDate, selectedDate) && task.status === 'pending'
  );

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Calendar</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
          Day <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center py-2 rounded-lg transition-all",
                isSelected 
                  ? "gradient-hero text-primary-foreground" 
                  : isTodayDate
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted text-foreground"
              )}
            >
              <span className="text-xs font-medium opacity-80">
                {format(day, 'EEE')}
              </span>
              <span className="text-lg font-bold">
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-primary uppercase">
          {format(selectedDate, 'EEE')}
        </span>
        <span className="flex items-center justify-center h-6 w-6 rounded-full gradient-hero text-primary-foreground text-xs font-bold">
          {format(selectedDate, 'd')}
        </span>
      </div>

      {/* Time Slots */}
      <div className="relative">
        <div className="space-y-4">
          {hours.map((hour) => (
            <div key={hour} className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground w-12">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </span>
              <div className="flex-1 h-px bg-border mt-2" />
            </div>
          ))}
        </div>

        {/* Tasks on timeline */}
        {tasksForDate.length > 0 && (
          <div className="absolute left-16 right-0 top-0">
            {tasksForDate.slice(0, 2).map((task, index) => (
              <div
                key={task.id}
                className="absolute left-0 right-0 rounded-lg bg-accent border-l-4 border-primary p-2"
                style={{ top: `${index * 60 + 10}px` }}
              >
                <p className="text-xs font-medium text-accent-foreground truncate">
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {task.estimatedMinutes} min
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
