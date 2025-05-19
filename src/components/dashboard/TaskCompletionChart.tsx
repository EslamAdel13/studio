// src/components/dashboard/TaskCompletionChart.tsx
"use client";

import type { Task } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';

interface TaskCompletionChartProps {
  tasks: Task[];
}

export function TaskCompletionChart({ tasks }: TaskCompletionChartProps) {
  const { resolvedTheme } = useTheme();
  const themeColors = {
    line: resolvedTheme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
    grid: resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
    tick: resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
    tooltipBg: resolvedTheme === 'dark' ? 'hsl(var(--popover))' : 'hsl(var(--popover))',
    tooltipText: resolvedTheme === 'dark' ? 'hsl(var(--popover-foreground))' : 'hsl(var(--popover-foreground))',
  };

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const data = last7Days.map(day => {
    const formattedDate = format(day, 'MMM d');
    const completedOnDay = tasks.filter(task => 
      task.isCompleted && task.completedAt && format(task.completedAt.toDate(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    ).length;
    return {
      date: formattedDate,
      completed: completedOnDay,
    };
  });
  
  const hasData = data.some(d => d.completed > 0);

  if (!hasData) {
    return <p className="text-center text-muted-foreground py-10">No task completion data for the last 7 days.</p>;
  }


  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
        <XAxis dataKey="date" stroke={themeColors.tick} tick={{ fill: themeColors.tick }} />
        <YAxis allowDecimals={false} stroke={themeColors.tick} tick={{ fill: themeColors.tick }} />
        <Tooltip 
            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.grid, color: themeColors.tooltipText, borderRadius: '0.5rem' }}
            itemStyle={{ color: themeColors.tooltipText }}
        />
        <Legend wrapperStyle={{ color: themeColors.tick }} />
        <Line type="monotone" dataKey="completed" name="Tasks Completed" stroke={themeColors.line} strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
