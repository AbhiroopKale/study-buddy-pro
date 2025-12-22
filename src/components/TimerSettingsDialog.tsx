import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

export interface TimerSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  longBreakDuration: number; // in minutes
}

interface TimerSettingsDialogProps {
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
}

export function TimerSettingsDialog({ settings, onSettingsChange }: TimerSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setLocalSettings(settings);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Work Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Work Duration</Label>
              <span className="text-sm font-medium text-primary">{localSettings.workDuration} min</span>
            </div>
            <Slider
              value={[localSettings.workDuration]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, workDuration: value }))}
              min={5}
              max={60}
              step={5}
              className="w-full"
            />
          </div>

          {/* Break Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Short Break</Label>
              <span className="text-sm font-medium text-primary">{localSettings.breakDuration} min</span>
            </div>
            <Slider
              value={[localSettings.breakDuration]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, breakDuration: value }))}
              min={1}
              max={15}
              step={1}
              className="w-full"
            />
          </div>

          {/* Long Break Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Long Break</Label>
              <span className="text-sm font-medium text-primary">{localSettings.longBreakDuration} min</span>
            </div>
            <Slider
              value={[localSettings.longBreakDuration]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, longBreakDuration: value }))}
              min={5}
              max={30}
              step={5}
              className="w-full"
            />
          </div>

          {/* Sessions Before Long Break */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sessions Before Long Break</Label>
              <span className="text-sm font-medium text-primary">{localSettings.sessionsBeforeLongBreak}</span>
            </div>
            <Slider
              value={[localSettings.sessionsBeforeLongBreak]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, sessionsBeforeLongBreak: value }))}
              min={2}
              max={6}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
