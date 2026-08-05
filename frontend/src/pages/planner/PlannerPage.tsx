import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Sparkles, CheckCircle2, Circle, Clock, Flame,
  Code2, Brain, Mic, FileText, BookOpen, Plus, Trash2, Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { aiApi } from "@/api/ai";
import { useAuthStore } from "@/store/authStore";
import { MOCK_WEEKLY_PLAN } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const TASK_ICONS: Record<string, any> = {
  coding: Code2, aptitude: Brain, interview: Mic,
  resume: FileText, revision: BookOpen,
};
const TASK_COLORS: Record<string, string> = {
  coding: "text-blue-500 bg-blue-500/10",
  aptitude: "text-violet-500 bg-violet-500/10",
  interview: "text-pink-500 bg-pink-500/10",
  resume: "text-amber-500 bg-amber-500/10",
  revision: "text-green-500 bg-green-500/10",
};
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const ROADMAP_STEPS = [
  { week: "Week 1-2", title: "DSA Foundations", desc: "Arrays, Strings, Linked Lists, Stacks, Queues", status: "completed" },
  { week: "Week 3-4", title: "Trees & Graphs", desc: "Binary Trees, BST, BFS, DFS, Shortest Paths", status: "active" },
  { week: "Week 5-6", title: "DP & Advanced", desc: "Dynamic Programming, Backtracking, Greedy", status: "upcoming" },
  { week: "Week 7", title: "System Design", desc: "HLD, LLD, Scalability, Databases", status: "upcoming" },
  { week: "Week 8", title: "Mock Interviews", desc: "Full mock rounds, company-specific prep", status: "upcoming" },
];

const DAILY_CHALLENGES = [
  { id: "dc1", type: "coding", title: "Daily Coding Challenge", desc: "Two Pointer: Container With Most Water", xp: 25, done: false, difficulty: "Medium" },
  { id: "dc2", type: "aptitude", title: "Daily Aptitude Quiz", desc: "10 mixed questions — Quant + Logical", xp: 15, done: true, difficulty: "Mixed" },
  { id: "dc3", type: "interview", title: "Daily HR Question", desc: "Describe your greatest professional achievement", xp: 10, done: false, difficulty: "Easy" },
  { id: "dc4", type: "revision", title: "SQL Daily", desc: "Write a query using window functions", xp: 20, done: false, difficulty: "Medium" },
];

export default function PlannerPage() {
  const { user } = useAuthStore();
  const [weekPlan, setWeekPlan] = useState(MOCK_WEEKLY_PLAN);
  const [activeDay, setActiveDay] = useState("Monday");
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [roadmapGenerating, setRoadmapGenerating] = useState(false);
  const [roadmapContent, setRoadmapContent] = useState<string | null>(null);
  const [targetCompany, setTargetCompany] = useState("Google");
  const [studyHours, setStudyHours] = useState("4");
  const [weeks, setWeeks] = useState("8");
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES);

  const toggleTask = (day: string, taskId: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: (prev as any)[day].map((t: any) => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t),
    }));
  };

  const toggleChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const generateRoadmap = async () => {
    setRoadmapGenerating(true);
    try {
      const res = await aiApi.generateRoadmap({
        targetCompany,
        currentLevel: "Intermediate",
        studyHours: Number(studyHours),
        skills: user?.skills || ["Python", "Algorithms"],
        timeWeeks: Number(weeks),
      });
      setRoadmapContent(res.data.roadmap);
      setShowRoadmapForm(false);
    } catch (e: any) {
      console.error(e);
      alert("Could not generate roadmap from AI right now. Please check backend connection.");
    } finally {
      setRoadmapGenerating(false);
    }
  };

  const todayTasks = (weekPlan as any)[activeDay] || [];
  const completedToday = todayTasks.filter((t: any) => t.isCompleted).length;
  const totalWeekTasks = DAYS.reduce((acc, d) => acc + ((weekPlan as any)[d]?.length || 0), 0);
  const completedWeekTasks = DAYS.reduce((acc, d) => acc + ((weekPlan as any)[d]?.filter((t: any) => t.isCompleted).length || 0), 0);
  const challengesDone = challenges.filter(c => c.done).length;

  return (
    <div className="space-y-6">
      <PageHeader title="AI Study Planner" description="Personalized roadmap, weekly schedule & daily challenges"
        icon={<CalendarDays className="h-5 w-5 text-violet-500" />}
        actions={
          <Button variant="gradient" size="sm" onClick={() => setShowRoadmapForm(true)}>
            <Sparkles className="mr-1.5 h-4 w-4" />Generate AI Roadmap
          </Button>
        } />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Weekly Progress", value: `${completedWeekTasks}/${totalWeekTasks}`, sub: "tasks done", color: "text-blue-500", bg: "bg-blue-500/10", icon: CheckCircle2 },
          { label: "Daily Challenges", value: `${challengesDone}/${challenges.length}`, sub: "completed today", color: "text-amber-500", bg: "bg-amber-500/10", icon: Flame },
          { label: "Study Streak", value: "7 days", sub: "keep it up!", color: "text-orange-500", bg: "bg-orange-500/10", icon: Flame },
          { label: "XP Today", value: challenges.filter(c=>c.done).reduce((a,c)=>a+c.xp,0), sub: "points earned", color: "text-violet-500", bg: "bg-violet-500/10", icon: Trophy },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-10 w-10 shrink-0 flex items-center justify-center rounded-xl", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Roadmap form */}
      <AnimatePresence>
        {showRoadmapForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />Generate Personalized Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Target Company</label>
                    <Select value={targetCompany} onValueChange={setTargetCompany}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Google","Microsoft","Amazon","Flipkart","Infosys","TCS","Startup"].map(c =>
                          <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Hours/Day</label>
                    <Select value={studyHours} onValueChange={setStudyHours}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["1","2","3","4","5","6","8"].map(h => <SelectItem key={h} value={h}>{h} hours</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Duration</label>
                    <Select value={weeks} onValueChange={setWeeks}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["4","6","8","10","12"].map(w => <SelectItem key={w} value={w}>{w} weeks</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="gradient" onClick={generateRoadmap} loading={roadmapGenerating} className="flex-1">
                    {roadmapGenerating ? "Generating..." : <><Sparkles className="mr-2 h-4 w-4" />Generate My Roadmap</>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowRoadmapForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly planner */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Weekly Schedule</CardTitle>
                <span className="text-xs text-muted-foreground">{completedWeekTasks}/{totalWeekTasks} tasks</span>
              </div>
              <Progress value={(completedWeekTasks / totalWeekTasks) * 100} className="h-1.5" />
            </CardHeader>
            <CardContent>
              {/* Day tabs */}
              <div className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {DAYS.map(day => {
                  const dayTasks = (weekPlan as any)[day] || [];
                  const done = dayTasks.filter((t: any) => t.isCompleted).length;
                  const isActive = activeDay === day;
                  return (
                    <button key={day} onClick={() => setActiveDay(day)}
                      className={cn("flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>
                      <span>{day.slice(0, 3)}</span>
                      <span className={cn("text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {done}/{dayTasks.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tasks for active day */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {todayTasks.map((task: any) => {
                    const Icon = TASK_ICONS[task.type] || BookOpen;
                    return (
                      <motion.div key={task.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                        className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                          task.isCompleted ? "opacity-60 bg-muted/30" : "hover:bg-muted/40")}
                        onClick={() => toggleTask(activeDay, task.id)}>
                        {task.isCompleted
                          ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                        <div className={cn("h-8 w-8 shrink-0 flex items-center justify-center rounded-lg", TASK_COLORS[task.type])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", task.isCompleted && "line-through text-muted-foreground")}>{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{task.duration} min</span>
                          </div>
                        </div>
                        <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"}
                          className="text-xs shrink-0">{task.priority}</Badge>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {todayTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No tasks for {activeDay}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Roadmap */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  {roadmapContent ? `${targetCompany} AI Prep Roadmap (${weeks} weeks)` : "Sample AI Roadmap — Google"}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowRoadmapForm(true)}>
                  {roadmapContent ? "Regenerate" : "Customize"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {roadmapContent ? (
                <div className="prose-custom text-xs whitespace-pre-line leading-relaxed p-2 bg-muted/20 rounded-xl">
                  {roadmapContent}
                </div>
              ) : (
                <div className="relative space-y-0">
                  {ROADMAP_STEPS.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border-2",
                          step.status === "completed" ? "bg-green-500 border-green-500 text-white" :
                          step.status === "active" ? "bg-primary border-primary text-primary-foreground" :
                          "bg-muted border-border text-muted-foreground")}>
                          {step.status === "completed" ? "✓" : i + 1}
                        </div>
                        {i < ROADMAP_STEPS.length - 1 && (
                          <div className={cn("w-0.5 flex-1 my-1 min-h-[24px]",
                            step.status === "completed" ? "bg-green-500" : "bg-border")} />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-muted-foreground">{step.week}</span>
                          {step.status === "active" && <Badge variant="info" className="text-xs">Current</Badge>}
                        </div>
                        <p className="font-semibold text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenges */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />Daily Challenges
                </CardTitle>
                <Badge variant="secondary">{challengesDone}/{challenges.length} done</Badge>
              </div>
              <Progress value={(challengesDone / challenges.length) * 100} className="h-1.5 mt-1"
                indicatorClassName="bg-orange-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.map(ch => {
                const Icon = TASK_ICONS[ch.type] || BookOpen;
                return (
                  <motion.div key={ch.id} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleChallenge(ch.id)}
                    className={cn("flex gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      ch.done ? "bg-green-500/5 border-green-500/30 opacity-75" : "hover:bg-muted/40")}>
                    <div className={cn("h-9 w-9 shrink-0 flex items-center justify-center rounded-xl", TASK_COLORS[ch.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn("text-sm font-medium", ch.done && "line-through text-muted-foreground")}>{ch.title}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Trophy className="h-3 w-3 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-500">+{ch.xp}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{ch.desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("text-xs h-4",
                          ch.difficulty === "Easy" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          ch.difficulty === "Hard" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>{ch.difficulty}</Badge>
                        {ch.done && <span className="text-xs text-green-500 font-medium">✓ Completed</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Streak card */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-5 text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-3xl font-bold">{user?.streak ?? 0}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
              <p className="text-xs text-muted-foreground mt-1">Best: {user?.longestStreak ?? user?.streak ?? 0} days</p>
              <Progress value={Math.min(100, ((user?.streak ?? 0) / 14) * 100)} className="h-1.5 mt-3" indicatorClassName="bg-orange-500" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
