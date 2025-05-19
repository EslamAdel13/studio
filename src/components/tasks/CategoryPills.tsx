// src/components/tasks/CategoryPills.tsx
"use client";

import type { Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryPills({ categories, selectedCategory, onSelectCategory }: CategoryPillsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md pb-2">
      <div className="flex w-max space-x-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onSelectCategory(null)}
          className={cn(
            "cursor-pointer px-3 py-1.5 text-sm font-medium transition-all hover:opacity-80",
             selectedCategory === null ? "bg-primary text-primary-foreground" : "border-border text-foreground"
          )}
          style={selectedCategory === null ? {} : { borderColor: '#cccccc' }}
        >
          All Tasks
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "cursor-pointer px-3 py-1.5 text-sm font-medium transition-all hover:opacity-80",
              selectedCategory === category.id ? "text-primary-foreground" : "text-foreground"
            )}
            style={{ 
              backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
              borderColor: category.color,
              color: selectedCategory === category.id ? getContrastColor(category.color) : category.color
            }}
          >
            {category.name}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// Helper function to determine text color based on background brightness
function getContrastColor(hexcolor: string): string {
  if (!hexcolor) return '#000000';
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}
