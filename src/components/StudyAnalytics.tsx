import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Target, Calendar, Flame, Timer, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { StudyTask, UserStats, FocusSession } from '@/types/study';
import { format, subDays, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/utils/exportStats';
import { toast } from '@/hooks/use-toast';

interface StudyAnalyticsProps {
  tasks: StudyTask[];
  stats: UserStats;
  focusSessions: FocusSession[];
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

export function StudyAnalytics({ tasks, stats, focusSessions }: StudyAnalyticsProps) {
  // Generate last 7 days productivity data using actual focus sessions
  const weeklyData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map((day) => {
      const dayTasks = tasks.filter(task => 
        task.completedAt && 
        startOfDay(task.completedAt).getTime() === day.getTime()
      );
      
      // Calculate actual focus minutes from sessions
      const daySessions = focusSessions.filter(session => 
        isSameDay(session.startTime, day)
      );
      const focusMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const sessionCount = daySessions.length;
      
      // Calculate productivity based on completed tasks and focus time
      const productivity = Math.min(
        Math.floor(((dayTasks.length * 20) + (focusMinutes / 3)) / 2),
        100
      );
      
      return {
        day: format(day, 'EEE'),
        date: format(day, 'MMM d'),
        completed: dayTasks.length,
        focusMinutes,
        sessionCount,
        productivity: Math.max(productivity, 5),
      };
    });
  }, [tasks, focusSessions]);

  // Recent sessions for the history list
  const recentSessions = useMemo(() => {
    return [...focusSessions]
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 10);
  }, [focusSessions]);

  // Total sessions stats
  const sessionStats = useMemo(() => {
    const totalSessions = focusSessions.length;
    const completedSessions = focusSessions.filter(s => s.completed).length;
    const totalMinutes = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    return { totalSessions, completedSessions, totalMinutes, avgDuration };
  }, [focusSessions]);

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

  const handleExportCSV = () => {
    exportToCSV({ tasks, focusSessions, stats });
    toast({
      title: 'Export successful',
      description: 'Your stats have been exported as CSV.',
    });
  };

  const handleExportPDF = () => {
    exportToPDF({ tasks, focusSessions, stats });
    toast({
      title: 'Export successful',
      description: 'Your stats have been exported as PDF.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Export Button */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Stats
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

      {/* Pomodoro Session History */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              Pomodoro Session History
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{sessionStats.totalSessions} sessions</span>
              <span>{sessionStats.avgDuration} min avg</span>
              <span>{Math.floor(sessionStats.totalMinutes / 60)}h {sessionStats.totalMinutes % 60}m total</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No focus sessions yet. Start the timer to track your study time!
                </div>
              ) : (
                recentSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        session.completed ? 'bg-success/20' : 'bg-warning/20'
                      }`}>
                        <Timer className={`h-4 w-4 ${
                          session.completed ? 'text-success' : 'text-warning'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {session.durationMinutes} minute session
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(session.startTime, 'MMM d, yyyy')} at {format(session.startTime, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={session.completed ? 'default' : 'secondary'}
                      className={session.completed ? 'bg-success/20 text-success hover:bg-success/30' : ''}
                    >
                      {session.completed ? 'Completed' : 'Partial'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
