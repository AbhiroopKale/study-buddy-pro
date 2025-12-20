import { UserStats } from '@/types/study';

interface WelcomeCardProps {
  stats: UserStats;
  userName: string;
}

export function WelcomeCard({ stats, userName }: WelcomeCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const tasksToday = stats.pendingTasks + stats.overdueTasks;

  return (
    <div className="gradient-hero rounded-2xl p-6 text-primary-foreground shadow-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">
            {tasksToday} tasks due today
          </p>
          <h1 className="mt-1 text-3xl font-bold">
            {getGreeting()}, {userName}
          </h1>
          <p className="mt-2 text-sm opacity-80">
            {stats.completedTasks > 0 
              ? `You've completed ${stats.completedTasks} tasks. Keep it up!` 
              : 'Ready to start your study session?'}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {stats.streak > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xs font-medium opacity-90">Streak</p>
                <p className="text-lg font-bold">{stats.streak} days</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
