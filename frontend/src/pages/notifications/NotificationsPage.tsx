import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Building2, Trophy, Calendar, Megaphone, CheckCheck, ExternalLink, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getNotifications, markAsRead as apiMarkAsRead } from "@/api/notifications";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/types";

const TYPE_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  drive:       { icon: Building2, color: "text-blue-500",   bg: "bg-blue-500/10",   label: "Drive" },
  contest:     { icon: Trophy,    color: "text-amber-500",  bg: "bg-amber-500/10",  label: "Contest" },
  achievement: { icon: Trophy,    color: "text-violet-500", bg: "bg-violet-500/10", label: "Achievement" },
  reminder:    { icon: Calendar,  color: "text-green-500",  bg: "bg-green-500/10",  label: "Reminder" },
  system:      { icon: Megaphone, color: "text-gray-500",   bg: "bg-gray-500/10",   label: "System" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filtered = filter === "all" ? notifications
    : filter === "unread" ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filter);

  const markRead = async (id: string) => {
    try {
      await apiMarkAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.isRead).map(n => apiMarkAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on drives, contests and achievements"
        icon={<Bell className="h-5 w-5 text-blue-500" />}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="mr-1.5 h-4 w-4" />Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: `All (${notifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "drive", label: "Drives" },
          { key: "contest", label: "Contests" },
          { key: "achievement", label: "Achievements" },
          { key: "reminder", label: "Reminders" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              filter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30")}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((notif, i) => {
            const meta = TYPE_META[notif.type] || TYPE_META.system;
            const Icon = meta.icon;
            return (
              <motion.div key={notif.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}>
                <div
                  onClick={() => markRead(notif.id)}
                  className={cn(
                    "flex gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                    !notif.isRead ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/30"
                  )}>
                  {/* Icon */}
                  <div className={cn("h-10 w-10 shrink-0 flex items-center justify-center rounded-xl", meta.bg)}>
                    <Icon className={cn("h-5 w-5", meta.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("font-semibold text-sm", !notif.isRead && "text-foreground")}>{notif.title}</p>
                        {!notif.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{meta.label}</Badge>
                      {notif.metadata?.company && (
                        <span className="text-xs text-muted-foreground">🏢 {notif.metadata.company}</span>
                      )}
                      {notif.metadata?.deadline && (
                        <span className="text-xs text-orange-500 font-medium">
                          ⏰ Deadline: {new Date(notif.metadata.deadline).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      {notif.metadata?.platform && (
                        <span className="text-xs text-muted-foreground">🌐 {notif.metadata.platform}</span>
                      )}
                      {notif.link && (
                        <a href={notif.link} onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" />View details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
