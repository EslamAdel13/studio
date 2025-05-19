// src/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Settings,
  BarChart3,
  Sparkles,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"; // Assuming sidebar.tsx is in ui

const navItems = [
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/smart-schedule", label: "Smart Schedule", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { logout, currentUser } = useAuth();
  const { state: sidebarState, toggleSidebar, isMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout();
      // router.push('/login') will be handled by AuthGuard or page redirects
    } catch (error) {
      console.error("Logout failed", error);
      // Handle logout error, maybe show a toast
    }
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/tasks" className="flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-primary" />
          {sidebarState === 'expanded' && <h1 className="text-xl font-semibold text-primary">Habitual Harmony</h1>}
        </Link>
        {sidebarState === 'expanded' && !isMobile && <SidebarTrigger />}
      </SidebarHeader>

      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={sidebarState === 'collapsed' ? item.label : undefined}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    {sidebarState === 'expanded' && <span>{item.label}</span>}
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {sidebarState === 'expanded' && currentUser && (
          <p className="text-sm text-muted-foreground truncate mb-2">
            {currentUser.email}
          </p>
        )}
        <div className={cn("flex items-center", sidebarState === 'expanded' ? "justify-between" : "justify-center flex-col gap-2")}>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout"
            className={cn(sidebarState === 'collapsed' && "mt-2")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
