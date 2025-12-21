import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FocusTimerProps {
  onSessionComplete: (minutes: number, completed?: boolean) => void;
}

export function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [focusDuration] = useState(25 * 60); // 25 minutes
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  const progress = ((focusDuration - timeLeft) / focusDuration) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = useCallback(() => {
    if (sessionMinutes > 0) {
      onSessionComplete(sessionMinutes, false); // Partial session
    }
    setIsRunning(false);
    setTimeLeft(focusDuration);
    setSessionMinutes(0);
  }, [focusDuration, onSessionComplete, sessionMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if ((focusDuration - timeLeft) % 60 === 0) {
          setSessionMinutes(Math.floor((focusDuration - timeLeft) / 60));
        }
      }, 1000);
    } else if (timeLeft === 0) {
      onSessionComplete(Math.floor(focusDuration / 60), true); // Completed session
      setIsRunning(false);
      setTimeLeft(focusDuration);
      setSessionMinutes(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, focusDuration, onSessionComplete]);

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Focus</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center">
        {/* Timer Circle */}
        <div className="relative">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--primary))"
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
        </div>
      </div>
    </div>
  );
}
