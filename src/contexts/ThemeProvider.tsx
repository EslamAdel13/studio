// src/contexts/ThemeProvider.tsx
"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme", // Using a generic key, can be app-specific
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const { currentUser, userProfile } = useAuth(); // Get userProfile for theme preference

  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let newResolvedTheme: "light" | "dark";
    if (currentTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      newResolvedTheme = systemTheme;
    } else {
      root.classList.add(currentTheme);
      newResolvedTheme = currentTheme;
    }
    setResolvedTheme(newResolvedTheme);
  }, []);

  useEffect(() => {
    // Initialize theme from userProfile if available
    if (userProfile?.themePreference) {
      setThemeState(userProfile.themePreference);
      applyTheme(userProfile.themePreference);
    } else {
      applyTheme(theme);
    }
  }, [userProfile, applyTheme, theme]);


  const setTheme = useCallback(async (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Update theme preference in Firestore if user is logged in
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userDocRef, { themePreference: newTheme });
      } catch (error) {
        console.error("Failed to update theme preference in Firestore:", error);
      }
    }
  }, [storageKey, applyTheme, currentUser]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
