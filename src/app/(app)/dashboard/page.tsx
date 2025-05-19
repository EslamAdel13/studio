// src/app/(app)/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import type { Task, Category } from '@/lib/types';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, CheckCircle2, Clock, TrendingUp, PieChartIcon } from 'lucide-react';
import { TimePerCategoryChart } from '@/components/dashboard/TimePerCategoryChart';
import { TaskCompletionChart } from '@/components/dashboard/TaskCompletionChart';
import { EstimatedActualChart } from '@/components/dashboard/EstimatedActualChart';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const categoriesQuery = query(collection(db, `users/${currentUser.uid}/categories`), orderBy("name"));
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    const tasksQuery = query(collection(db, `users/${currentUser.uid}/tasks`));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      setLoading(false);
    });
    
    return () => {
      unsubscribeCategories();
      unsubscribeTasks();
    };
  }, [currentUser]);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const activeTasks = totalTasks - completedTasks;
  const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
  const totalActualTimeSpent = tasks.reduce((sum, task) => sum + (task.actualTimeSpent || 0), 0);

  if (loading) {
    return <p>Loading dashboard data...</p>;
  }
  
  if (!currentUser) {
     return <p>Please log in to view your dashboard.</p>;
  }

  return (
    <ScrollArea className="h-full">
    <div className="space-y-6 pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">tasks created</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate` : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalActualTimeSpent / 60).toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground">from {totalEstimatedTime > 0 ? (totalEstimatedTime/60).toFixed(1) + ' hrs estimated' : 'N/A estimated'}</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks}</div>
            <p className="text-xs text-muted-foreground">tasks pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5" /> Time Spent Per Category</CardTitle>
            <CardDescription>Distribution of actual time spent across categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <TimePerCategoryChart tasks={tasks} categoryMap={categoryMap} />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5" />Task Completion Trend</CardTitle>
            <CardDescription>Number of tasks completed over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <TaskCompletionChart tasks={tasks} />
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5" />Estimated vs. Actual Time</CardTitle>
            <CardDescription>Comparison of estimated and actual time spent on recent tasks.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <EstimatedActualChart tasks={tasks.filter(t => t.isCompleted && t.estimatedTime && t.actualTimeSpent).slice(0, 10)} />
          </CardContent>
        </Card>

    </div>
    </ScrollArea>
  );
}
