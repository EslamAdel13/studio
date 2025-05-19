// src/app/(app)/tasks/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import type { Task, Category } from '@/lib/types';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2, CheckCircle, Circle, Palette, Tag, ListFilter } from 'lucide-react';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { CategoryPills } from '@/components/tasks/CategoryPills';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type FilterStatus = "all" | "active" | "completed";

export default function TasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null for "All Tasks"
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");

  useEffect(() => {
    if (!currentUser) return;

    // Fetch Categories
    const categoriesQuery = query(collection(db, `users/${currentUser.uid}/categories`), orderBy("name"));
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCategories);
    });

    // Fetch Tasks
    let tasksQuery = query(collection(db, `users/${currentUser.uid}/tasks`), orderBy("createdAt", "desc"));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    });
    
    return () => {
      unsubscribeCategories();
      unsubscribeTasks();
    };
  }, [currentUser]);

  const handleOpenNewTaskForm = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // TODO: Implement deleteTask
  const handleDeleteTask = async (taskId: string) => {
    console.log("Delete task:", taskId);
    // Implement Firestore delete logic here
    // await deleteDoc(doc(db, `users/${currentUser.uid}/tasks`, taskId));
    // toast({ title: "Task deleted" });
  };

  // TODO: Implement toggleTaskCompletion
  const handleToggleComplete = async (task: Task) => {
    console.log("Toggle complete:", task.id);
    // Implement Firestore update logic here
    // const taskRef = doc(db, `users/${currentUser.uid}/tasks`, task.id);
    // await updateDoc(taskRef, { 
    //   isCompleted: !task.isCompleted,
    //   completedAt: !task.isCompleted ? serverTimestamp() : null,
    //   updatedAt: serverTimestamp()
    // });
    // toast({ title: `Task ${!task.isCompleted ? "completed" : "marked active"}` });
  };
  
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const categoryMatch = selectedCategory ? task.categoryId === selectedCategory : true;
      if (!categoryMatch) return false;
      
      if (filterStatus === "active") return !task.isCompleted;
      if (filterStatus === "completed") return task.isCompleted;
      return true; // "all"
    });
  }, [tasks, selectedCategory, filterStatus]);

  const getCategoryName = (categoryId: string) => categoryMap[categoryId]?.name || 'Uncategorized';
  const getCategoryColor = (categoryId: string) => categoryMap[categoryId]?.color || '#808080'; // Default grey
  const getCategoryIcon = (categoryId: string) => {
    const iconName = categoryMap[categoryId]?.icon;
    const LucideIcon = require('lucide-react')[iconName as keyof typeof import('lucide-react')] || Tag;
    return LucideIcon;
  };

  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Tasks</h1>
        <Button onClick={handleOpenNewTaskForm} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
        </Button>
      </div>

      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
              <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredTasks.length === 0 ? (
         <Card className="shadow-lg">
          <CardContent className="p-10 text-center">
            <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No tasks found for this category or filter.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filter or add a new task!
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => {
              const CategoryIcon = getCategoryIcon(task.categoryId);
              return (
                <Card key={task.id} className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300", task.isCompleted && "opacity-70 bg-muted/50")}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl mb-1">{task.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="h-8 w-8">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                       <CategoryIcon className="h-4 w-4" style={{ color: getCategoryColor(task.categoryId) }} />
                       <span style={{ color: getCategoryColor(task.categoryId) }}>{getCategoryName(task.categoryId)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{task.description}</p>}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      {task.estimatedTime && <div>Est: <Badge variant="secondary">{task.estimatedTime} min</Badge></div>}
                      {task.actualTimeSpent && <div>Actual: <Badge variant="secondary">{task.actualTimeSpent} min</Badge></div>}
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Due: {format(task.dueDate.toDate(), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-3">
                      Created: {formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true })}
                    </p>
                    <Button 
                      variant={task.isCompleted ? "outline" : "default"} 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleToggleComplete(task)}
                      aria-label={task.isCompleted ? "Mark as active" : "Mark as complete"}
                    >
                      {task.isCompleted ? <Circle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      {task.isCompleted ? 'Mark as Active' : 'Mark as Complete'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {isTaskFormOpen && (
        <TaskFormModal
          isOpen={isTaskFormOpen}
          onClose={() => {
            setIsTaskFormOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          categories={categories}
          userId={currentUser.uid}
          defaultCategoryId={selectedCategory}
        />
      )}
    </div>
  );
}
