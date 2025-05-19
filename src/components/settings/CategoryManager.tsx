// src/components/settings/CategoryManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, Palette, Tag, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Extended list of Lucide icons suitable for categories
const availableIcons = [
  'Archive', 'Award', 'Briefcase', 'BookOpen', 'Bookmark', 'Brain', 'Building', 'CalendarDays', 'Camera', 'Car', 
  'ClipboardList', 'Cloud', 'Code', 'Coins', 'Compass', 'Cpu', 'CreditCard', 'Crop', 'Database', 'Dumbbell', 
  'FileText', 'Film', 'Flag', 'Folder', 'Gamepad2', 'Gem', 'Gift', 'Globe', 'GraduationCap', 'Grid', 'Heart', 
  'Home', 'Image', 'Inbox', 'Landmark', 'Laptop', 'Lightbulb', 'Link', 'List', 'Lock', 'Mail', 'MapPin', 
  'Maximize', 'Mic', 'Minimize', 'Monitor', 'Moon', 'MousePointer', 'Music', 'Navigation', 'Package', 'Palette',
  'Paperclip', 'PenTool', 'Percent', 'PersonStanding', 'Phone', 'PieChart', 'PiggyBank', 'Plane', 'Puzzle', 
  'Receipt', 'Rocket', 'Save', 'School', 'Scissors', 'ScreenShare', 'Search', 'Send', 'Settings2', 'Share2', 
  'Sheet', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Smartphone', 'Smile', 'Speaker', 'Star', 'Sun', 'Sunrise', 
  'Sunset', 'Table', 'Tablet', 'Tag', 'Target', 'Ticket', 'ToggleLeft', 'Tool', 'Train', 'Trash', 'TrendingUp', 
  'Truck', 'Tv', 'Umbrella', 'User', 'Users', 'Video', 'Wallet', 'Watch', 'Wifi', 'Wind', 'Zap', 'ZoomIn', 'ZoomOut'
] as const;

type LucideIconName = typeof availableIcons[number];

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', '#F0B67F', '#FE4A49', 
  '#547980', '#9BC53D', '#F06543', '#C3423F', '#6B5B95', '#F7CAC9', '#92A8D1', 
  '#FFDAB9', '#B5EAD7', '#E0FEFE', '#F3A0A0', '#A2D5F2', '#F2E3BC'
];

interface CategoryFormState {
  name: string;
  color: string;
  icon: LucideIconName;
}

interface CategoryManagerProps {
  userId: string;
}

export function CategoryManager({ userId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formState, setFormState] = useState<CategoryFormState>({ name: '', color: colors[0], icon: 'Tag' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, `users/${userId}/categories`), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });
    return () => unsubscribe();
  }, [userId]);

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormState({ name: category.name, color: category.color, icon: category.icon as LucideIconName });
    } else {
      setEditingCategory(null);
      setFormState({ name: '', color: colors[Math.floor(Math.random() * colors.length)], icon: 'Tag' });
    }
    setIsFormOpen(true);
  };

  const handleFormChange = (field: keyof CategoryFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const categoryData = { 
        ...formState, 
        userId, 
        updatedAt: serverTimestamp() 
      };
      if (editingCategory) {
        await updateDoc(doc(db, `users/${userId}/categories`, editingCategory.id), categoryData);
        toast({ title: "Category updated!" });
      } else {
        await addDoc(collection(db, `users/${userId}/categories`), {
          ...categoryData,
          createdAt: serverTimestamp()
        });
        toast({ title: "Category created!" });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    // Check if category is in use (optional, simple delete for now)
    // For a more robust solution, you'd query tasks using this categoryId.
    // If tasks exist, either prevent deletion, reassign tasks, or confirm deletion of tasks too.
    
    // Simple check: is it the "General" category? (assuming ID 'general' or name "General")
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (categoryToDelete?.name.toLowerCase() === "general") {
         toast({ title: "Cannot Delete", description: "The 'General' category cannot be deleted.", variant: "destructive" });
         return;
    }

    try {
      await deleteDoc(doc(db, `users/${userId}/categories`, categoryId));
      toast({ title: "Category deleted!" });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  };
  
  const renderIcon = (iconName: LucideIconName | string, props?: any) => {
    const LucideIcon = require('lucide-react')[iconName as keyof typeof import('lucide-react')] || Tag;
    return <LucideIcon {...props} />;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center"><ListPlus className="mr-2 h-6 w-6" /> Manage Categories</CardTitle>
          <CardDescription>Create, edit, or delete your task categories.</CardDescription>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No categories yet. Add your first one!</p>
        ) : (
          <ScrollArea className="h-[250px] pr-3">
            <ul className="space-y-3">
              {categories.map(category => (
                <li key={category.id} className="flex items-center justify-between p-3 border rounded-md shadow-sm hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {renderIcon(category.icon as LucideIconName, { className: "h-5 w-5", style: { color: category.color }})}
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(category)} className="h-8 w-8">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                             disabled={category.name.toLowerCase() === "general"}
                           >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deleting category "{category.name}" cannot be undone. Tasks associated with this category will need to be reassigned.
                              (Note: The default 'General' category cannot be deleted.)
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit' : 'Create'} Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="categoryName">Name</Label>
              <Input id="categoryName" value={formState.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="e.g., Work, Fitness" required />
            </div>
            
            <div className="flex items-center space-x-4">
                <div>
                    <Label htmlFor="categoryColor">Color</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <div className="w-5 h-5 rounded-full mr-2 border" style={{ backgroundColor: formState.color }} />
                            {formState.color}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 grid grid-cols-5 gap-1">
                        {colors.map(c => (
                            <Button key={c} variant="outline" size="icon" className="w-8 h-8" onClick={() => handleFormChange('color', c)}>
                                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: c }} />
                            </Button>
                        ))}
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex-1">
                    <Label htmlFor="categoryIcon">Icon</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {renderIcon(formState.icon, { className: "h-4 w-4 mr-2"})}
                            {formState.icon}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2">
                          <ScrollArea className="h-[200px]">
                            <div className="grid grid-cols-5 gap-1">
                            {availableIcons.map(iconName => (
                                <Button key={iconName} variant={formState.icon === iconName ? "secondary" : "ghost"} size="icon" className="w-10 h-10" onClick={() => handleFormChange('icon', iconName)}>
                                    {renderIcon(iconName, {className: "h-5 w-5"})}
                                </Button>
                            ))}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
