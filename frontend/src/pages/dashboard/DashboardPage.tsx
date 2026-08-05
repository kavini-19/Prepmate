import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2, Brain, Mic, FileText, Flame, Trophy, Target, TrendingUp,
  CalendarDays, Clock, BookOpen, ArrowRight, CheckCircle2, Circle,
  Zap, Building2, Star
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/StatCard";
import { XP_PER_LEVEL } from "@/constants";
import { cn, formatDate } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useEffect, useState } from "react";
import { getDashboardAnalytics, DashboardAnalytics } from "@/api/analytics";

const greetings = ["Good morning", "Good afternoon", "Good evening"];
const getGreeting = () => greetings[Math.min(Math.floor(new Date().getHours() / 8), 2)];

const quickActions = [
  { label: "Solve a Problem", icon: Code2, href: "/coding", color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
  { label: "Take a Quiz", icon: Brain, href: "/aptitude", color: "from-violet-500 to-purple-500", bg: "bg-violet-500/10" },
  { label: "Mock Interview", icon: Mic, href: "/interview", color: "from-pink-500 to-rose-500", bg: "bg-pink-500/10" },
  { label: "Check Resume", icon: FileText, href: "/resume", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const xpProgress = user ? (user.xp % XP_PER_LEVEL) : 0;
  const xpPercent = (xpProgress / XP_PER_LEVEL) * 100;

  // Today's tasks from Monday
  const todayTasks = data?.weeklyPlan?.Monday || [];
  const completedToday = todayTasks.filter(t => t.isCompleted).length;

  // Chart data — last 7 days
  const chartData = (data?.dailyActivity || []).slice(-7).map(d => ({
    day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
    Coding: d.codingProblems,
    Aptitude: d.aptitudeQuestions,
  }));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        {...fade} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-700 p-6 text-white"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 right-1/3 h-36 w-36 rounded-full bg-violet-400/20 blur-2xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{getGreeting()},</p>
            <h1 className="text-2xl font-bold">{user?.name || "Learner"} 👋</h1>
            <p className="text-blue-100 text-sm mt-1">
              {data?.coding?.weekly_solved
                ? <>You've solved <span className="font-bold text-white">{data.coding.weekly_solved} problems</span> this week. Keep it up!</>
                : "Welcome to PrepMate! Start solving problems and taking quizzes to track your real progress."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="text-center bg-white/15 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1 justify-center">
                <Flame className="h-5 w-5 text-orange-300" />
                <span className="text-2xl font-bold">{user?.streak ?? 0}</span>
              </div>
              <p className="text-xs text-blue-200">Day Streak</p>
            </div>
            {/* Level */}
            <div className="text-center bg-white/15 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1 justify-center">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-2xl font-bold">{user?.level ?? 1}</span>
              </div>
              <p className="text-xs text-blue-200">Level</p>
            </div>
            {/* XP */}
            <div className="hidden sm:block bg-white/15 rounded-xl px-4 py-3 min-w-[120px]">
              <p className="text-xs text-blue-200 mb-1.5">XP Progress</p>
              <Progress value={xpPercent} className="h-2 bg-white/20" indicatorClassName="bg-yellow-400" />
              <p className="text-xs text-blue-100 mt-1">{xpProgress} / {XP_PER_LEVEL} XP</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={String(data?.coding?.total_solved ?? 0)}
          subtitle={`of ${data?.coding?.total_problems ?? 0} total`}
          icon={Code2}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          delay={0.05}
        />
        <StatCard
          title="Aptitude Score"
          value={data?.aptitude?.total_quizzes ? `${data.aptitude.avg_score}%` : "N/A"}
          subtitle={data?.aptitude?.total_quizzes ? `avg across ${data.aptitude.total_quizzes} quizzes` : "No quizzes taken yet"}
          icon={Brain}
          iconColor="text-violet-500"
          iconBg="bg-violet-500/10"
          delay={0.1}
        />
        <StatCard
          title="Interview Score"
          value={data?.interview_score ? `${data.interview_score}/100` : "N/A"}
          subtitle={data?.interview_score ? "last mock interview" : "No interview taken yet"}
          icon={Mic}
          iconColor="text-pink-500"
          iconBg="bg-pink-500/10"
          delay={0.15}
        />
        <StatCard
          title="Resume Score"
          value={data?.resume_score ? `${data.resume_score}/100` : "N/A"}
          subtitle={data?.resume_score ? "ATS compatibility" : "Scan resume for ATS score"}
          icon={FileText}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <motion.div {...fade} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Weekly Activity</CardTitle>
                <Badge variant="secondary" className="text-xs">Last 7 days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="Coding" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Aptitude" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's tasks */}
        <motion.div {...fade} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" /> Today's Tasks
                </CardTitle>
                <span className="text-xs text-muted-foreground">{completedToday}/{todayTasks.length} done</span>
              </div>
              <Progress value={(completedToday / todayTasks.length) * 100} className="h-1.5 mt-1" />
            </CardHeader>
            <CardContent className="space-y-2">
              {todayTasks.map(task => (
                <div key={task.id} className={cn(
                  "flex items-start gap-2.5 p-2 rounded-lg transition-colors",
                  task.isCompleted ? "opacity-60" : "hover:bg-muted/50"
                )}>
                  {task.isCompleted
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", task.isCompleted && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.duration} min</span>
                      <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"}
                        className="text-xs h-4 px-1.5">{task.priority}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <Link to="/planner">View full plan <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div {...fade} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, href, color, bg }) => (
                <Link key={href} to={href}
                  className={cn("flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center transition-all hover:scale-105", bg, "border border-transparent hover:border-primary/20")}>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white", color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Topic Mastery */}
        <motion.div {...fade} transition={{ duration: 0.4, delay: 0.35 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Topic Mastery</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link to="/analytics">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.topicMastery || []).slice(0, 5).map(t => (
                <div key={t.topic}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{t.topic}</span>
                    <span className="text-muted-foreground">{t.solved}/{t.total}</span>
                  </div>
                  <Progress value={(t.solved / t.total) * 100} className="h-1.5"
                    indicatorClassName={t.accuracy >= 80 ? "bg-green-500" : t.accuracy >= 60 ? "bg-yellow-500" : "bg-red-500"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Drives */}
        <motion.div {...fade} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Upcoming Drives
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link to="/notifications">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.upcomingDrives || []).map(drive => (
                <div key={drive.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold",
                    drive.type === "internship" ? "bg-blue-500" : drive.type === "contest" ? "bg-amber-500" : "bg-violet-500")}>
                    {drive.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{drive.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted-foreground">Deadline:</span>
                      <span className="text-xs font-medium text-orange-500">{formatDate(drive.deadline)}</span>
                    </div>
                  </div>
                  <Badge variant={drive.type === "internship" ? "info" : drive.type === "contest" ? "warning" : "purple"}
                    className="text-xs shrink-0">{drive.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Roadmap CTA */}
      <motion.div {...fade} transition={{ duration: 0.4, delay: 0.45 }}>
        <div className="rounded-2xl border bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                <Zap className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold">Get Your AI-Powered Roadmap</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tell us your target company and we'll create a personalized prep plan.
                </p>
              </div>
            </div>
            <Button variant="gradient" className="shrink-0" asChild>
              <Link to="/planner">Generate Roadmap <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
