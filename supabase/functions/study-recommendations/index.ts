import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  dueDate: string;
  estimatedMinutes: number;
  status: string;
  priority: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
  topics: string[];
  difficulty: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks, exams, availableHoursPerDay } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const today = new Date().toISOString().split('T')[0];
    
    const systemPrompt = `You are an expert study coach and time management specialist. Analyze the student's tasks and upcoming exams to create personalized, actionable study recommendations.

Your recommendations should:
1. Prioritize tasks based on difficulty, due date, and relation to upcoming exams
2. Suggest optimal study session lengths (25-50 min) with breaks
3. Identify which topics need extra attention before exams
4. Provide specific daily schedules when possible
5. Include motivational tips

Be concise but specific. Focus on actionable advice.`;

    const userPrompt = `Today's date: ${today}
Available study time per day: ${availableHoursPerDay || 4} hours

PENDING TASKS:
${tasks.filter((t: Task) => t.status === 'pending').map((t: Task) => 
  `- "${t.title}" (${t.subject}) - Difficulty: ${t.difficulty}, Priority: ${t.priority}, Due: ${t.dueDate}, Est. time: ${t.estimatedMinutes} min`
).join('\n') || 'No pending tasks'}

UPCOMING EXAMS:
${exams.map((e: Exam) => 
  `- "${e.title}" (${e.subject}) - Difficulty: ${e.difficulty}, Date: ${e.date}, Duration: ${e.duration} min, Topics: ${e.topics.join(', ')}`
).join('\n') || 'No upcoming exams'}

Please provide:
1. Top 3 priority recommendations for today
2. A suggested study schedule for the next 3 days
3. Key areas that need extra focus before exams
4. One motivational tip`;

    console.log('Calling Lovable AI with prompt:', userPrompt.substring(0, 200) + '...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content;
    
    if (!recommendations) {
      throw new Error("No recommendations generated");
    }

    console.log('Generated recommendations successfully');

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in study-recommendations function:", error);
    const message = error instanceof Error ? error.message : "Failed to generate recommendations";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
