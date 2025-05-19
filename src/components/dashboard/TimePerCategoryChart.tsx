// src/components/dashboard/TimePerCategoryChart.tsx
"use client";

import type { Task, Category } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

interface TimePerCategoryChartProps {
  tasks: Task[];
  categoryMap: Record<string, Category>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A'];

export function TimePerCategoryChart({ tasks, categoryMap }: TimePerCategoryChartProps) {
  const { resolvedTheme } = useTheme();
  const data = Object.values(categoryMap).map((category, index) => {
    const totalTime = tasks
      .filter(task => task.categoryId === category.id && task.actualTimeSpent)
      .reduce((sum, task) => sum + (task.actualTimeSpent || 0), 0);
    return {
      name: category.name,
      value: totalTime,
      fill: category.color || COLORS[index % COLORS.length],
    };
  }).filter(item => item.value > 0);

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No time tracked yet to display this chart.</p>;
  }

  const legendColor = resolvedTheme === 'dark' ? '#FFF' : '#333';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${(value / 60).toFixed(1)} hrs`, "Time Spent"]} />
        <Legend wrapperStyle={{ color: legendColor }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
