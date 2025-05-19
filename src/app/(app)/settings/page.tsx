// src/app/(app)/settings/page.tsx
"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, UserCircle, Palette, ListPlus, Edit, Trash2 } from "lucide-react";
import { CategoryManager } from "@/components/settings/CategoryManager";

export default function SettingsPage() {
  const { currentUser, userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Handle logout error, maybe show a toast
    }
  };

  if (!currentUser || !userProfile) {
    return <p>Loading settings...</p>;
  }

  const getInitials = (email?: string | null) => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><UserCircle className="mr-2 h-6 w-6" /> Account</CardTitle>
          <CardDescription>Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.displayName || userProfile.email || "User"} />
              <AvatarFallback>{getInitials(userProfile.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">{userProfile.displayName || "User"}</p>
              <p className="text-sm text-muted-foreground">{userProfile.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-6 w-6" /> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-md font-medium text-foreground">Theme</p>
            <ThemeToggle />
          </div>
          <p className="text-sm text-muted-foreground mt-1">Choose between light, dark, or system default theme.</p>
        </CardContent>
      </Card>
      
      <CategoryManager userId={currentUser.uid} />

      {/* Add more settings sections as needed */}
    </div>
  );
}
