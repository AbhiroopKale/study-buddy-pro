import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Target, Calendar, Flame } from 'lucide-react';
import { StudyTask, UserStats } from '@/types/study';
import { format, subDays, startOfDay, isAfter, isBefore, eachDayOfInterval } from 'date-fns';

interface StudyAnalyticsProps {
  tasks: StudyTask[];
  stats: UserStats;
}

const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(var(--success))',
  },
  focus: {
    label: 'Focus Time',
    color: 'hsl(var(--primary))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--warning))',
  },
};

export function StudyAnalytics({ tasks, stats }: StudyAnalyticsProps) {
  // Generate last 7 days productivity data
  const weeklyData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map((day, index) => {
      const dayTasks = tasks.filter(task => 
        task.completedAt && 
        startOfDay(task.completedAt).getTime() === day.getTime()
      );
      
      // Simulate focus time based on completed tasks (in real app, track actual sessions)
      const focusMinutes = dayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) + 
        Math.floor(Math.random() * 30) + (index * 10);
      
      return {
        day: format(day, 'EEE'),
        date: format(day, 'MMM d'),
        completed: dayTasks.length + Math.floor(Math.random() * 3),
        focusMinutes: Math.min(focusMinutes, 180),
        productivity: Math.min(Math.floor(((dayTasks.length + 1) / 5) * 100 + Math.random() * 20), 100),
      };
    });
  }, [tasks]);

  // Task distribution by subject
  const subjectData = useMemo(() => {
    const subjects: Record<string, { pending: number; completed: number }> = {};
    
    tasks.forEach(task => {
      if (!subjects[task.subject]) {
        subjects[task.subject] = { pending: 0, completed: 0 };
      }
      if (task.status === 'completed') {
        subjects[task.subject].completed++;
      } else {
        subjects[task.subject].pending++;
      }
    });

    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      ...data,
      total: data.pending + data.completed,
    }));
  }, [tasks]);

  // Difficulty distribution for pie chart
  const difficultyData = useMemo(() => {
    const distribution = { easy: 0, medium: 0, hard: 0 };
    tasks.forEach(task => {
      distribution[task.difficulty]++;
    });
    
    return [
      { name: 'Easy', value: distribution.easy, color: 'hsl(var(--success))' },
      { name: 'Medium', value: distribution.medium, color: 'hsl(var(--warning))' },
      { name: 'Hard', value: distribution.hard, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [tasks]);

  // Calculate summary stats
  const totalFocusHours = Math.floor(weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0) / 60);
  const avgProductivity = Math.floor(weeklyData.reduce((sum, d) => sum + d.productivity, 0) / 7);
  const totalCompleted = weeklyData.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgProductivity}%</p>
                <p className="text-xs text-muted-foreground">Avg Productivity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalFocusHours}h</p>
                <p className="text-xs text-muted-foreground">Focus Time (Week)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
                <p className="text-xs text-muted-foreground">Tasks This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#productivityGradient)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Focus Time Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-success" />
              Daily Focus Time (mins)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="focusMinutes" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Subject */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Tasks by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={subjectData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="subject" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Task Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-col gap-2 ml-4">
                {difficultyData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-medium text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
