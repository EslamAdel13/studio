import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  theme_preference?: 'light' | 'dark' | 'system';
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category_id: string;
  estimated_time?: number;
  actual_time_spent?: number;
  due_date?: string | null;
  reminder_time?: string | null;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PastTaskEntry {
  task_type: string;
  duration: string;
  time_of_day: string;
}