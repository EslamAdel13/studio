// src/components/dashboard/EstimatedActualChart.tsx
"use client";

import type { Task } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

interface EstimatedActualChartProps {
  tasks: Task[]; // Should be pre-filtered for completed tasks with time data
}

export function EstimatedActualChart({ tasks }: EstimatedActualChartProps) {
  const { resolvedTheme } = useTheme();
  const themeColors = {
    estimatedBar: resolvedTheme === 'dark' ? 'hsl(var(--secondary))' : 'hsl(var(--secondary))', // Lighter blue
    actualBar: resolvedTheme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))',     // Deep blue
    grid: resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
    tick: resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
    tooltipBg: resolvedTheme === 'dark' ? 'hsl(var(--popover))' : 'hsl(var(--popover))',
    tooltipText: resolvedTheme === 'dark' ? 'hsl(var(--popover-foreground))' : 'hsl(var(--popover-foreground))',
  };
  
  const data = tasks.map(task => ({
    name: task.title.length > 20 ? `${task.title.substring(0, 17)}...` : task.title, // Truncate long names
    estimated: task.estimatedTime || 0,
    actual: task.actualTimeSpent || 0,
  }));

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No tasks with estimated and actual time to display.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
        <XAxis dataKey="name" stroke={themeColors.tick} tick={{ fill: themeColors.tick }}/>
        <YAxis label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft', fill: themeColors.tick }} stroke={themeColors.tick} tick={{ fill: themeColors.tick }}/>
        <Tooltip 
          formatter={(value: number) => [`${value} min`, undefined]}
          contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.grid, color: themeColors.tooltipText, borderRadius: '0.5rem' }}
          itemStyle={{ color: themeColors.tooltipText }}
        />
        <Legend wrapperStyle={{ color: themeColors.tick }}/>
        <Bar dataKey="estimated" name="Estimated Time" fill={themeColors.estimatedBar} radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Actual Time" fill={themeColors.actualBar} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
