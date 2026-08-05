import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Clock, Brain, Code2, Mic, Trophy } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { getDashboardAnalytics } from "@/api/analytics";
import type { DailyStats, TopicMastery } from "@/types";
import { CHART_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

const aptitudeHistory = [
  { date: "Jan", "Quant": 62, "Logical": 55, "Verbal": 70, "DI": 48 },
  { date: "Feb", "Quant": 68, "Logical": 60, "Verbal": 73, "DI": 55 },
  { date: "Mar", "Quant": 72, "Logical": 65, "Verbal": 75, "DI": 60 },
  { date: "Apr", "Quant": 70, "Logical": 72, "Verbal": 78, "DI": 65 },
  { date: "May", "Quant": 78, "Logical": 75, "Verbal": 80, "DI": 70 },
  { date: "Jun", "Quant": 82, "Logical": 79, "Verbal": 83, "DI": 74 },
];

const interviewScores = [
  { session: "S1", HR: 65, Technical: 58 },
  { session: "S2", HR: 70, Technical: 62 },
  { session: "S3", HR: 72, Technical: 68 },
  { session: "S4", HR: 75, Technical: 74 },
  { session: "S5", HR: 78, Technical: 76 },
  { session: "S6", HR: 82, Technical: 80 },
];

const difficultyData = [
  { name: "Easy", solved: 28, total: 40 },
  { name: "Medium", solved: 15, total: 35 },
  { name: "Hard", solved: 5, total: 25 },
];

const pieData = [
  { name: "Arrays", value: 28 },
  { name: "DP", value: 12 },
  { name: "Trees", value: 15 },
  { name: "Graphs", value: 8 },
  { name: "Others", value: 25 },
];



const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};



export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [dailyActivity, setDailyActivity] = useState<DailyStats[]>([]);
  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardAnalytics()
      .then(data => {
        setDailyActivity(data.dailyActivity);
        setTopicMastery(data.topicMastery);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const chartData = range === "7d"
    ? dailyActivity.slice(-7)
    : range === "30d"
    ? dailyActivity.slice(-30)
    : dailyActivity;

  const radarData = topicMastery.slice(0, 6).map(t => ({
    topic: t.topic, score: t.accuracy,
  }));

  const totalSolved = chartData.reduce((a, d) => a + d.codingProblems, 0);
  const totalAptitude = chartData.reduce((a, d) => a + d.aptitudeQuestions, 0);
  const totalHours = chartData.reduce((a, d) => a + d.studyHours, 0).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress Analytics"
        description="Detailed insights into your preparation journey"
        icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
        actions={
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {["7d", "30d", "90d"].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                  range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {r}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Problems Solved" value={totalSolved} subtitle={`in last ${range}`}
          icon={Code2} iconColor="text-blue-500" iconBg="bg-blue-500/10" trend={{ value: 12, label: "vs prev period" }} delay={0} />
        <StatCard title="Aptitude Qs" value={totalAptitude} subtitle={`in last ${range}`}
          icon={Brain} iconColor="text-violet-500" iconBg="bg-violet-500/10" trend={{ value: 8, label: "improvement" }} delay={0.05} />
        <StatCard title="Study Hours" value={`${totalHours}h`} subtitle={`in last ${range}`}
          icon={Clock} iconColor="text-green-500" iconBg="bg-green-500/10" trend={{ value: 5, label: "more than avg" }} delay={0.1} />
        <StatCard title="Avg Interview Score" value="80/100" subtitle="last 6 sessions"
          icon={Mic} iconColor="text-pink-500" iconBg="bg-pink-500/10" trend={{ value: 15, label: "improvement" }} delay={0.15} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
          <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Activity area chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Activity — Problems & Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData.slice(-14)}>
                  <defs>
                    <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                    tickFormatter={d => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="codingProblems" name="Coding" stroke="#3b82f6" fill="url(#colorCoding)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="aptitudeQuestions" name="Aptitude" stroke="#8b5cf6" fill="url(#colorApt)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topic Mastery Radar */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Topic Mastery Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Accuracy %" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Study hours line chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Daily Study Hours</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData.slice(-14)}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                      tickFormatter={d => new Date(d).toLocaleDateString("en", { day: "numeric" })} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="studyHours" name="Hours" stroke="#22c55e" fill="url(#colorHours)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Coding ── */}
        <TabsContent value="coding" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Problems by Difficulty</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={difficultyData} layout="vertical" barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="solved" name="Solved" radius={[0, 4, 4, 0]}>
                      {difficultyData.map((_, i) => (
                        <Cell key={i} fill={["#22c55e", "#f59e0b", "#ef4444"][i]} />
                      ))}
                    </Bar>
                    <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Problems by Topic</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Topic mastery table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Topic-wise Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {topicMastery.map(t => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{t.topic}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs">{t.solved}/{t.total} solved</span>
                      <Badge variant={t.accuracy >= 80 ? "success" : t.accuracy >= 60 ? "warning" : "danger"} className="text-xs">
                        {t.accuracy}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(t.solved / t.total) * 100} className="h-2"
                    indicatorClassName={t.accuracy >= 80 ? "bg-green-500" : t.accuracy >= 60 ? "bg-yellow-500" : "bg-red-500"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Aptitude ── */}
        <TabsContent value="aptitude" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Score Trend by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={aptitudeHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {["Quant", "Logical", "Verbal", "DI"].map((key, i) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i]}
                      strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { cat: "Quantitative", score: 82, trend: "+10%" },
              { cat: "Logical", score: 79, trend: "+14%" },
              { cat: "Verbal", score: 83, trend: "+7%" },
              { cat: "Data Interp.", score: 74, trend: "+16%" },
            ].map(c => (
              <Card key={c.cat}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{c.score}%</p>
                  <p className="text-xs text-muted-foreground">{c.cat}</p>
                  <p className="text-xs text-green-500 font-medium mt-1">{c.trend}</p>
                  <Progress value={c.score} className="h-1.5 mt-2"
                    indicatorClassName={c.score >= 80 ? "bg-green-500" : "bg-yellow-500"} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Interview ── */}
        <TabsContent value="interview" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Interview Score Progression</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={interviewScores} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="session" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="HR" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Technical" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Communication", score: 82, icon: "🗣️" },
              { label: "Technical Depth", score: 76, icon: "💻" },
              { label: "Problem Solving", score: 79, icon: "🧩" },
              { label: "Confidence", score: 74, icon: "💪" },
              { label: "Time Management", score: 85, icon: "⏱️" },
              { label: "Overall Clarity", score: 80, icon: "✨" },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{m.icon}</span>
                    <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={m.score} className="h-2 flex-1"
                      indicatorClassName={m.score >= 80 ? "bg-green-500" : "bg-yellow-500"} />
                    <span className="text-xs font-bold w-8 text-right">{m.score}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
