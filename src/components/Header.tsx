import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Settings, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-3xl font-bold text-foreground">
            {format(currentTime, 'h:mm a')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(currentTime, 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="gradient-hero text-primary-foreground font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </header>
  );
}
