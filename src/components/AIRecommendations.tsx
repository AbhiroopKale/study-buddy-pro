import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2, AlertCircle, Lightbulb, Calendar, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyTask, Exam } from '@/types/study';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AIRecommendationsProps {
  tasks: StudyTask[];
  exams: Exam[];
}

export function AIRecommendations({ tasks, exams }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('study-recommendations', {
        body: {
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            subject: t.subject,
            difficulty: t.difficulty,
            dueDate: t.dueDate.toISOString().split('T')[0],
            estimatedMinutes: t.estimatedMinutes,
            status: t.status,
            priority: t.priority,
          })),
          exams: exams.map(e => ({
            id: e.id,
            title: e.title,
            subject: e.subject,
            date: e.date.toISOString().split('T')[0],
            duration: e.duration,
            topics: e.topics,
            difficulty: e.difficulty,
          })),
          availableHoursPerDay: 4,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setRecommendations(data.recommendations);
      toast({
        title: "Recommendations generated!",
        description: "Your personalized study plan is ready.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Parse recommendations into sections
  const parseRecommendations = (text: string) => {
    const sections: { title: string; content: string; icon: React.ReactNode }[] = [];
    
    // Split by numbered sections or common headers
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^(#{1,3}|\*\*|[0-9]+\.)\s*(Top|Priority|Schedule|Focus|Motivational|Key|Today)/i)) {
        if (currentSection && currentContent.length > 0) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n'),
            icon: getIconForSection(currentSection),
          });
        }
        currentSection = trimmed.replace(/^(#{1,3}|\*\*|[0-9]+\.)\s*/, '').replace(/\*\*/g, '');
        currentContent = [];
      } else if (trimmed) {
        currentContent.push(trimmed);
      }
    });
    
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n'),
        icon: getIconForSection(currentSection),
      });
    }
    
    return sections.length > 0 ? sections : [{
      title: 'Your Study Plan',
      content: text,
      icon: <Lightbulb className="h-5 w-5" />,
    }];
  };

  const getIconForSection = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('priority') || lower.includes('today')) return <Target className="h-5 w-5" />;
    if (lower.includes('schedule')) return <Calendar className="h-5 w-5" />;
    if (lower.includes('focus') || lower.includes('key')) return <Zap className="h-5 w-5" />;
    if (lower.includes('motivational') || lower.includes('tip')) return <Sparkles className="h-5 w-5" />;
    return <Lightbulb className="h-5 w-5" />;
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">AI Study Coach</h3>
        </div>
        <Button
          onClick={fetchRecommendations}
          disabled={isLoading}
          size="sm"
          className={cn(
            "gap-2",
            recommendations ? "variant-outline" : "gradient-hero text-primary-foreground"
          )}
          variant={recommendations ? "outline" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : recommendations ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get Recommendations
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!recommendations && !isLoading && !error && (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground mb-2">
            Get AI-powered study recommendations
          </p>
          <p className="text-sm text-muted-foreground">
            Our AI will analyze your tasks and exams to create an optimal study schedule
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your study plan...</p>
          <p className="text-sm text-muted-foreground mt-1">
            This may take a few seconds
          </p>
        </div>
      )}

      {recommendations && !isLoading && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {parseRecommendations(recommendations).map((section, index) => (
            <div 
              key={index}
              className="rounded-lg bg-muted/50 p-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2 text-primary">
                {section.icon}
                <h4 className="font-medium">{section.title}</h4>
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {section.content.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^[0-9]+\./)) {
                    return (
                      <div key={i} className="flex gap-2 mt-1">
                        <span className="text-primary">•</span>
                        <span>{trimmed.replace(/^[-•]\s*|^[0-9]+\.\s*/, '')}</span>
                      </div>
                    );
                  }
                  return <p key={i} className="mt-1">{trimmed}</p>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
