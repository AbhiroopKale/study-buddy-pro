import { Clock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import { UserStats } from '@/types/study';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: UserStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-accent',
      emoji: '👀',
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      emoji: '⚠️',
    },
    {
      label: 'Tasks Completed',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
      emoji: '👍',
    },
    {
      label: 'Your Streak',
      value: stats.streak,
      icon: Flame,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      emoji: '🔥',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover animate-slide-up",
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
          </div>
          <p className={cn("text-3xl font-bold", item.color)}>{item.value}</p>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>
      ))}
    </div>
  );
}
