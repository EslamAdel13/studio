// src/components/tasks/TaskFormModal.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task, Category } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  estimatedTime: z.coerce.number().int().positive().optional().nullable(),
  actualTimeSpent: z.coerce.number().int().positive().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  reminderTime: z.date().optional().nullable(), // For web, this is more for data storage
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(), // e.g., 'daily', 'weekly'
  isCompleted: z.boolean().default(false),
});

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  categories: Category[];
  userId: string;
  defaultCategoryId?: string | null;
}

export function TaskFormModal({ isOpen, onClose, task, categories, userId, defaultCategoryId }: TaskFormModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      categoryId: task?.categoryId || defaultCategoryId || categories[0]?.id || "",
      estimatedTime: task?.estimatedTime || undefined,
      actualTimeSpent: task?.actualTimeSpent || undefined,
      dueDate: task?.dueDate ? task.dueDate.toDate() : undefined,
      reminderTime: task?.reminderTime ? task.reminderTime.toDate() : undefined,
      isRecurring: task?.isRecurring || false,
      recurrencePattern: task?.recurrencePattern || "",
      isCompleted: task?.isCompleted || false,
    },
  });
  
  // Reset form when task or defaultCategoryId changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  useState(() => {
    form.reset({
      title: task?.title || "",
      description: task?.description || "",
      categoryId: task?.categoryId || defaultCategoryId || categories[0]?.id || "",
      estimatedTime: task?.estimatedTime || undefined,
      actualTimeSpent: task?.actualTimeSpent || undefined,
      dueDate: task?.dueDate ? task.dueDate.toDate() : undefined,
      reminderTime: task?.reminderTime ? task.reminderTime.toDate() : undefined,
      isRecurring: task?.isRecurring || false,
      recurrencePattern: task?.recurrencePattern || "",
      isCompleted: task?.isCompleted || false,
    });
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/correctness/useEffectExhaustiveDependencies: <explanation>
  }, [task, defaultCategoryId, categories, form.reset, form]);


  async function onSubmit(values: z.infer<typeof taskSchema>) {
    setIsLoading(true);
    const taskData = {
      ...values,
      userId,
      estimatedTime: values.estimatedTime || null,
      actualTimeSpent: values.actualTimeSpent || null,
      dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
      reminderTime: values.reminderTime ? Timestamp.fromDate(values.reminderTime) : null,
      updatedAt: serverTimestamp(),
    };

    try {
      if (task) {
        // Update existing task
        const taskRef = doc(db, `users/${userId}/tasks`, task.id);
        await updateDoc(taskRef, taskData);
        toast({ title: "Task updated successfully!" });
      } else {
        // Create new task
        await addDoc(collection(db, `users/${userId}/tasks`), {
          ...taskData,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Task created successfully!" });
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: `Failed to save task. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any notes or details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actualTimeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 45" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setDate(new Date().getDate() -1)) // Disable past dates
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Recurring Task
                      </FormLabel>
                      <FormDescription>
                        Does this task repeat? (e.g., daily, weekly)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {form.watch("isRecurring") && (
                 <FormField
                  control={form.control}
                  name="recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence Pattern</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}


            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
