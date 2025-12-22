import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TimerSettingsDialog, TimerSettings } from './TimerSettingsDialog';

interface FocusTimerProps {
  onSessionComplete: (minutes: number, completed?: boolean) => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const defaultSettings: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
  sessionsBeforeLongBreak: 4,
  longBreakDuration: 15,
};

export function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  const currentDuration = mode === 'work' 
    ? settings.workDuration * 60 
    : mode === 'shortBreak' 
      ? settings.breakDuration * 60 
      : settings.longBreakDuration * 60;

  const progress = ((currentDuration - timeLeft) / currentDuration) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingsChange = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(newSettings.workDuration * 60);
      else if (mode === 'shortBreak') setTimeLeft(newSettings.breakDuration * 60);
      else setTimeLeft(newSettings.longBreakDuration * 60);
    }
  };

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'work') setTimeLeft(settings.workDuration * 60);
    else if (newMode === 'shortBreak') setTimeLeft(settings.breakDuration * 60);
    else setTimeLeft(settings.longBreakDuration * 60);
  }, [settings]);

  const handleReset = useCallback(() => {
    if (mode === 'work' && sessionMinutes > 0) {
      onSessionComplete(sessionMinutes, false);
    }
    setIsRunning(false);
    setTimeLeft(currentDuration);
    setSessionMinutes(0);
  }, [currentDuration, onSessionComplete, sessionMinutes, mode]);

  const handleSkip = useCallback(() => {
    if (mode === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      onSessionComplete(Math.floor((currentDuration - timeLeft) / 60), false);
      
      if (newCompletedSessions >= settings.sessionsBeforeLongBreak) {
        switchMode('longBreak');
        setCompletedSessions(0);
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  }, [mode, completedSessions, settings.sessionsBeforeLongBreak, currentDuration, timeLeft, onSessionComplete, switchMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'work' && (currentDuration - timeLeft) % 60 === 0) {
          setSessionMinutes(Math.floor((currentDuration - timeLeft) / 60));
        }
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'work') {
        const newCompletedSessions = completedSessions + 1;
        setCompletedSessions(newCompletedSessions);
        onSessionComplete(Math.floor(currentDuration / 60), true);
        
        if (newCompletedSessions >= settings.sessionsBeforeLongBreak) {
          switchMode('longBreak');
          setCompletedSessions(0);
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
      setSessionMinutes(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, currentDuration, completedSessions, settings.sessionsBeforeLongBreak, onSessionComplete, switchMode]);

  const modeColors = {
    work: 'hsl(var(--primary))',
    shortBreak: 'hsl(var(--chart-2))',
    longBreak: 'hsl(var(--chart-3))',
  };

  const modeLabels = {
    work: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{modeLabels[mode]}</h3>
          {mode !== 'work' && <Coffee className="h-4 w-4 text-muted-foreground" />}
        </div>
        <TimerSettingsDialog settings={settings} onSettingsChange={handleSettingsChange} />
      </div>

      {/* Session Progress */}
      <div className="flex justify-center gap-1.5 mb-4">
        {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-6 rounded-full transition-colors",
              i < completedSessions ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="flex flex-col items-center">
        {/* Timer Circle */}
        <div className="relative">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={modeColors[mode]}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all",
              isRunning 
                ? "bg-muted text-foreground hover:bg-muted/80" 
                : "gradient-hero text-primary-foreground hover:shadow-xl"
            )}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mt-4">
          {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'ghost'}
              size="sm"
              onClick={() => switchMode(m)}
              className="text-xs"
            >
              {modeLabels[m]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
