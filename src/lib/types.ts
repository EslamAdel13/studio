import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  // App-specific settings
  themePreference?: 'light' | 'dark' | 'system';
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // Hex color, e.g., '#FF0000'
  icon: string; // Lucide icon name, e.g., 'Briefcase'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  categoryId: string;
  estimatedTime?: number; // in minutes
  actualTimeSpent?: number; // in minutes
  dueDate?: Timestamp | null;
  reminderTime?: Timestamp | null;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly'; // Simplified for now
  isCompleted: boolean;
  completedAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For AI Smart Schedule input
export interface PastTaskEntry {
  taskType: string;
  duration: string; // e.g., "2 hours", "30 minutes"
  timeOfDay: string; // e.g., "morning", "afternoon", "evening", "9 AM"
}
