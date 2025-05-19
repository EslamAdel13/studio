// src/app/(app)/smart-schedule/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import type { Task, PastTaskEntry } from '@/lib/types'; // Assuming PastTaskEntry is defined in types
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { suggestOptimalTaskSchedule, type SuggestOptimalTaskScheduleOutput } from '@/ai/flows/suggest-task-schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SmartSchedulePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [taskType, setTaskType] = useState('');
  const [pastTaskDataString, setPastTaskDataString] = useState('');
  const [suggestion, setSuggestion] = useState<SuggestOptimalTaskScheduleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!currentUser) return;
      try {
        const tasksQuery = query(
          collection(db, `users/${currentUser.uid}/tasks`),
          where("isCompleted", "==", true), // Consider only completed tasks for history
          orderBy("completedAt", "desc"),
          limit(50) // Limit to recent 50 tasks for performance
        );
        const querySnapshot = await getDocs(tasksQuery);
        const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setUserTasks(fetchedTasks);
        
        // Pre-fill pastTaskDataString
        const formattedPastTasks = formatTasksForAI(fetchedTasks);
        setPastTaskDataString(formattedPastTasks);

      } catch (err) {
        console.error("Error fetching user tasks:", err);
        toast({ title: "Error fetching task history", description: "Could not load your past tasks for AI analysis.", variant: "destructive" });
      }
    };
    fetchUserTasks();
  }, [currentUser, toast]);

  const formatTasksForAI = (tasks: Task[]): string => {
    return tasks
      .map(task => {
        let timeOfDay = "anytime";
        if (task.completedAt) {
          const hour = task.completedAt.toDate().getHours();
          if (hour < 12) timeOfDay = "morning";
          else if (hour < 18) timeOfDay = "afternoon";
          else timeOfDay = "evening";
        }
        const duration = task.actualTimeSpent ? `${task.actualTimeSpent} minutes` : "unknown duration";
        // The AI flow expects `taskType` inside the string, so let's try to get it from task title or category.
        // For now, we'll use a generic placeholder or rely on the user-inputted taskType.
        return `Task: "${task.title}", Duration: ${duration}, Completed: ${timeOfDay}.`;
      })
      .join('\n');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskType.trim() || !pastTaskDataString.trim()) {
      setError("Task type and past data are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await suggestOptimalTaskSchedule({
        taskType,
        pastTaskData: pastTaskDataString,
      });
      setSuggestion(result);
    } catch (err) {
      console.error("Error getting suggestion:", err);
      setError(err instanceof Error ? err.message : "Failed to get suggestion.");
       toast({ title: "AI Suggestion Error", description: "Could not get a smart schedule suggestion.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Smart Schedule</h1>
      </div>
      <p className="text-muted-foreground">
        Let our AI analyze your past task data and suggest optimal times for scheduling similar tasks in the future.
        We&apos;ve pre-filled your past task data based on your completed tasks. You can edit it if needed.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Get a Smart Suggestion</CardTitle>
          <CardDescription>Enter the type of task you want to schedule and review your past data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="taskType" className="text-lg">Task Type</Label>
              <Input
                id="taskType"
                type="text"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                placeholder="e.g., Study, Workout, Work Project"
                className="mt-1"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">What kind of task are you planning?</p>
            </div>
            <div>
              <Label htmlFor="pastTaskData" className="text-lg">Your Past Task Data (for AI Analysis)</Label>
              <Textarea
                id="pastTaskData"
                value={pastTaskDataString}
                onChange={(e) => setPastTaskDataString(e.target.value)}
                placeholder="e.g., Study session, 2 hours, morning..."
                rows={8}
                className="mt-1"
                required
              />
               <p className="text-sm text-muted-foreground mt-1">
                This data (type, duration, time of day) helps the AI learn your patterns.
               </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get Suggestion
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestion && (
        <Card className="shadow-xl bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center"><Sparkles className="mr-2 h-6 w-6" /> Smart Suggestion for &quot;{taskType}&quot;</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Suggested Schedule:</h3>
              <p className="text-foreground whitespace-pre-wrap">{suggestion.suggestedSchedule}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Explanation:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{suggestion.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
