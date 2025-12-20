import { Exam } from '@/types/study';
import { ExamCard } from './ExamCard';

interface ExamsListProps {
  exams: Exam[];
  onDelete: (id: string) => void;
}

export function ExamsList({ exams, onDelete }: ExamsListProps) {
  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-slide-up">
      <h3 className="font-semibold text-foreground mb-4">Upcoming Exams</h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming exams</p>
          </div>
        ) : (
          exams.map((exam, index) => (
            <div 
              key={exam.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ExamCard exam={exam} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
