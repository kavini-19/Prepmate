import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Code2, Brain, Mic, FileText, Building2,
  CalendarDays, BarChart3, NotebookPen, MessageSquare, Trophy,
  Library, Bell, Settings, ChevronLeft, ChevronRight, Zap, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";
import { XP_PER_LEVEL } from "@/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Coding", href: "/coding", icon: Code2 },
  { label: "Aptitude", href: "/aptitude", icon: Brain },
  { label: "Interview", href: "/interview", icon: Mic },
  { label: "Resume", href: "/resume", icon: FileText },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "AI Planner", href: "/planner", icon: CalendarDays },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Notes", href: "/notes", icon: NotebookPen },
  { label: "AI Chat", href: "/chatbot", icon: MessageSquare },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Resources", href: "/resources", icon: Library },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  const xpProgress = user ? (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100 : 0;
  const currentLevelXP = user ? user.xp % XP_PER_LEVEL : 0;

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r bg-card flex flex-col",
          "hidden lg:flex",
          !sidebarOpen && "!hidden"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg gradient-text">PrepMate</span>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 mx-auto">
              <Zap className="h-4 w-4 text-white" />
            </div>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            className={cn(
              "rounded-md p-1 hover:bg-muted transition-colors",
              sidebarCollapsed && "hidden"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* User info */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">Level {user.level}</p>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <span className="text-sm font-bold">🔥</span>
                <span className="text-xs font-semibold">{user.streak}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>XP</span>
                <span>{currentLevelXP}/{XP_PER_LEVEL}</span>
              </div>
              <Progress
                value={xpProgress}
                className="h-1.5"
                indicatorClassName="bg-gradient-to-r from-blue-500 to-violet-500"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

              const linkContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("shrink-0", sidebarCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return <li key={item.href}>{linkContent}</li>;
            })}

            {user?.role === "admin" && (
              <li>
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    location.pathname.startsWith("/admin")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <Shield className={cn("shrink-0", sidebarCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                  {!sidebarCollapsed && <span>Admin</span>}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Collapse toggle at bottom */}
        {sidebarCollapsed && (
          <div className="p-2 border-t">
            <button
              onClick={toggleSidebarCollapsed}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  );
}
