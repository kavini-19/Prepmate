import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, Code2, HelpCircle, Building2, Library,
  Bell, TrendingUp, BarChart3, Plus, Search, Trash2, Edit3,
  CheckCircle2, XCircle, AlertCircle, Zap, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useAuthStore } from "@/store/authStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

import { getAdminOverview, listUsers, createNotification, generateAptitudeQuestion, generateCodingProblem } from "@/api/admin";

const SIGNUPS_DATA = [
  { month: "Aug", signups: 120 }, { month: "Sep", signups: 185 },
  { month: "Oct", signups: 240 }, { month: "Nov", signups: 310 },
  { month: "Dec", signups: 280 }, { month: "Jan", signups: 420 },
];



export default function AdminPage() {
  const { user } = useAuthStore();
  const [userSearch, setUserSearch] = useState("");
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "system", link: "" });
  const [notifSent, setNotifSent] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // AI Generator state
  const [aiType, setAiType] = useState("aptitude");
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      getAdminOverview().then(setStats).catch(console.error);
      listUsers().then(res => setUsers(res.data)).catch(console.error);
    }
  }, [user]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const sendNotification = async () => {
    if (!notifForm.title || !notifForm.message) return;
    try {
      await createNotification(notifForm);
      setNotifSent(true);
      setTimeout(() => {
        setNotifSent(false);
        setNotifForm({ title: "", message: "", type: "system", link: "" });
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateContent = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    setAiSuccessMsg("");
    try {
      if (aiType === "aptitude") {
        await generateAptitudeQuestion({ category: aiTopic, difficulty: aiDifficulty });
        setAiSuccessMsg(`Aptitude question for "${aiTopic}" generated & saved!`);
      } else {
        await generateCodingProblem({ topic: aiTopic, difficulty: aiDifficulty });
        setAiSuccessMsg(`Coding problem for "${aiTopic}" generated & saved!`);
      }
      setTimeout(() => setAiSuccessMsg(""), 4000);
      setAiTopic("");
    } catch (e) {
      console.error(e);
      setAiSuccessMsg("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const overviewStats = [
    { title: "Total Users",    value: stats?.total_users || 0,   sub: "Registered",  icon: Users,    color: "text-blue-500",   bg: "bg-blue-500/10" },
    { title: "Active Users",   value: stats?.active_users || 0,  sub: "Currently active", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Problems", value: stats?.total_problems || 0,sub: "Available", icon: Code2, color: "text-violet-500", bg: "bg-violet-500/10" },
    { title: "Resources",      value: stats?.total_resources || 0,sub: "Available", icon: Library, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Quiz Attempts",  value: stats?.total_quiz_attempts || 0,sub: "Total",  icon: HelpCircle, color: "text-pink-500",   bg: "bg-pink-500/10" },
    { title: "Companies",      value: stats?.total_companies || 0,sub: "Available", icon: Building2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ];

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-16 w-16 text-muted-foreground opacity-30" />
        <p className="text-xl font-semibold">Admin Access Required</p>
        <p className="text-muted-foreground text-sm">You don't have permission to view this page.</p>
        <p className="text-xs text-muted-foreground">Use the demo admin account: admin@prepmate.dev</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users, content, and platform analytics"
        icon={<Shield className="h-5 w-5 text-red-500" />}
        actions={<Badge variant="danger" className="text-sm px-3 py-1">Admin Mode</Badge>}
      />

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewStats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-10 w-10 shrink-0 flex items-center justify-center rounded-xl", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.title}</p>
                  <p className="text-xs text-green-500">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />Monthly Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SIGNUPS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              <Bar dataKey="signups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="users"><Users className="mr-1.5 h-3.5 w-3.5" />Users</TabsTrigger>
          <TabsTrigger value="content"><Code2 className="mr-1.5 h-3.5 w-3.5" />Content</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" />Broadcast</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="mr-1.5 h-3.5 w-3.5" />Analytics</TabsTrigger>
          <TabsTrigger value="ai-generator"><Zap className="mr-1.5 h-3.5 w-3.5" />AI Generator</TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users by name or email..." className="pl-9"
                value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <Button variant="gradient" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />Add User
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Role</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">XP / Level</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Streak</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant={u.role === "admin" ? "danger" : "secondary"} className="text-xs">{u.role}</Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="font-semibold">{u.xp.toLocaleString()} XP</p>
                        <p className="text-xs text-muted-foreground">Level {u.level}</p>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-orange-500 font-medium">🔥 {u.streak}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("h-2 w-2 rounded-full", u.is_active ? "bg-green-500" : "bg-gray-400")} />
                          <span className="text-xs">{u.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm"><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon-sm" className="hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Content tab */}
        <TabsContent value="content" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Coding Problems", count: 142, pending: 8, icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10" },
              { title: "Aptitude Questions", count: 384, pending: 15, icon: HelpCircle, color: "text-violet-500", bg: "bg-violet-500/10" },
              { title: "Resources", count: 67, pending: 3, icon: Library, color: "text-amber-500", bg: "bg-amber-500/10" },
              { title: "Companies", count: 48, pending: 2, icon: Building2, color: "text-green-500", bg: "bg-green-500/10" },
            ].map(c => (
              <Card key={c.title}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 flex items-center justify-center rounded-xl", c.bg)}>
                      <c.icon className={cn("h-5 w-5", c.color)} />
                    </div>
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-sm text-muted-foreground">{c.count} total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.pending > 0 && (
                      <Badge variant="warning" className="text-xs mb-1">{c.pending} pending</Badge>
                    )}
                    <div><Button variant="outline" size="sm" className="text-xs h-7"><Plus className="mr-1 h-3 w-3" />Add</Button></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Add Coding Problem</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Problem title..." />
              <div className="grid grid-cols-2 gap-3">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Tags (comma separated)" />
              </div>
              <Textarea placeholder="Problem description..." rows={4} />
              <Button variant="gradient" size="sm"><Plus className="mr-1.5 h-4 w-4" />Add Problem</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcast notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />Broadcast Notification to All Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifSent && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />Notification sent to all users successfully!
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notification Type</label>
                <Select value={notifForm.type} onValueChange={v => setNotifForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["drive", "contest", "reminder", "achievement", "system"].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Notification title..." value={notifForm.title}
                  onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Write your message..." rows={4} value={notifForm.message}
                  onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Link (optional)</label>
                <Input placeholder="https://... or /path" value={notifForm.link}
                  onChange={e => setNotifForm(p => ({ ...p, link: e.target.value }))} />
              </div>

              <Button variant="gradient" onClick={sendNotification}
                disabled={!notifForm.title || !notifForm.message}>
                <Bell className="mr-2 h-4 w-4" />Send to All Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics tab */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Avg Session Time",  value: "38 min",   trend: "+5 min",   good: true },
              { label: "Retention Rate",    value: "71%",      trend: "+4%",      good: true },
              { label: "Daily Active Users",value: "384",      trend: "+28",      good: true },
              { label: "Avg Problems/Day",  value: "6.2",      trend: "+1.1",     good: true },
              { label: "Bounce Rate",       value: "18%",      trend: "-3%",      good: true },
              { label: "Support Tickets",   value: "12",       trend: "+2",       good: false },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className={cn("text-xs font-medium mt-1", s.good ? "text-green-500" : "text-red-500")}>
                    {s.trend} vs last week
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">User Engagement Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Coding Practice",  value: 78, color: "bg-blue-500" },
                { label: "Aptitude Quizzes", value: 65, color: "bg-violet-500" },
                { label: "Mock Interviews",  value: 42, color: "bg-pink-500" },
                { label: "Resume Analyzer",  value: 38, color: "bg-amber-500" },
                { label: "Resource Library", value: 55, color: "bg-green-500" },
              ].map(e => (
                <div key={e.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{e.label}</span>
                    <span className="text-muted-foreground">{e.value}% of users</span>
                  </div>
                  <Progress value={e.value} className="h-2" indicatorClassName={e.color} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Generator tab */}
        <TabsContent value="ai-generator" className="mt-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                AI Content Generator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Dynamically generate high-quality placement questions and instantly save them into the production database.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {aiSuccessMsg && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("flex items-center gap-2 p-3 border rounded-lg text-sm font-medium",
                    aiSuccessMsg.includes("Failed") ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                  )}>
                  {aiSuccessMsg.includes("Failed") ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {aiSuccessMsg}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Content Type</label>
                  <Select value={aiType} onValueChange={setAiType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aptitude">Aptitude Question</SelectItem>
                      <SelectItem value="coding">Coding Problem (DSA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {aiType === "aptitude" ? "Category (e.g. Quantitative Aptitude, Logical Reasoning)" : "Topic (e.g. Arrays, Dynamic Programming, Graphs)"}
                </label>
                <Input placeholder={aiType === "aptitude" ? "Enter category..." : "Enter topic..."} value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)} />
              </div>

              <div className="pt-2">
                <Button variant="gradient" onClick={handleGenerateContent} disabled={!aiTopic || isGenerating} className="w-full sm:w-auto">
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating & Saving...</>
                  ) : (
                    <><Zap className="mr-2 h-4 w-4" /> Generate {aiType === "aptitude" ? "Question" : "Problem"}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
