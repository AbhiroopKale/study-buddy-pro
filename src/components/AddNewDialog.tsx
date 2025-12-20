import { ListTodo, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AddNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTask: () => void;
  onSelectExam: () => void;
}

export function AddNewDialog({ open, onOpenChange, onSelectTask, onSelectExam }: AddNewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>What would you like to add?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => {
              onOpenChange(false);
              onSelectTask();
            }}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border",
              "hover:border-primary hover:bg-accent transition-all duration-200"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-hero">
              <ListTodo className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">Task</span>
          </button>

          <button
            onClick={() => {
              onOpenChange(false);
              onSelectExam();
            }}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border",
              "hover:border-primary hover:bg-accent transition-all duration-200"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-hero">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">Exam</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
