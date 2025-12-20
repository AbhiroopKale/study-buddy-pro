import { 
  LayoutDashboard, 
  Calendar, 
  ListTodo, 
  Timer, 
  Plus, 
  HelpCircle, 
  LogOut,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddNew: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'focus', label: 'Focus Timer', icon: Timer },
];

export function Sidebar({ activeTab, onTabChange, onAddNew }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-primary">StudyPlan</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "gradient-hero text-primary-foreground shadow-md" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 space-y-2">
          <Button
            onClick={onAddNew}
            className="w-full gradient-hero text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border p-3">
        <ul className="space-y-1">
          <li>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </button>
          </li>
          <li>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
