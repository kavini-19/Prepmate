import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Search, Filter, Bookmark, BookmarkCheck, CheckCircle2,
  ChevronRight, Trophy, Target, Zap, RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { getProblems, getProblem, toggleBookmark as apiToggleBookmark } from "@/api/coding";
import { CODING_TOPICS } from "@/constants";
import { cn, getDifficultyBadgeColor } from "@/lib/utils";
import type { CodingProblem } from "@/types";
import ProblemModal from "./ProblemModal";

const DIFF_TABS = ["All", "Easy", "Medium", "Hard"] as const;

export default function CodingPage() {
  const [search, setSearch] = useState("");
  const [selectedDiff, setSelectedDiff] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenProblem = async (problem: CodingProblem) => {
    try {
      const full = await getProblem(problem.slug);
      setSelectedProblem(full);
    } catch {
      setSelectedProblem(problem);
    }
  };


  useEffect(() => {
    setIsLoading(true);
    getProblems({ search, difficulty: selectedDiff === "All" ? undefined : selectedDiff, tag: selectedTopic === "All" ? undefined : selectedTopic })
      .then(res => setProblems(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search, selectedDiff, selectedTopic]);

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchDiff = selectedDiff === "All" || p.difficulty === selectedDiff;
      const matchTopic = selectedTopic === "All" || p.tags.includes(selectedTopic as any);
      return matchSearch && matchDiff && matchTopic;
    });
  }, [problems, search, selectedDiff, selectedTopic]);

  const toggleBookmark = async (id: string) => {
    try {
      const res = await apiToggleBookmark(id);
      setProblems(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: res.bookmarked } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const solved = problems.filter(p => p.isSolved).length;
  const bookmarked = problems.filter(p => p.isBookmarked).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Practice"
        description="Sharpen your DSA skills with curated problems"
        icon={<Code2 className="h-5 w-5 text-blue-500" />}
        actions={
          <Button variant="gradient" size="sm" asChild>
            <a href="/chatbot"><Zap className="mr-1.5 h-4 w-4" />AI Mentor</a>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Solved" value={solved} subtitle={`of ${problems.length} problems`}
          icon={CheckCircle2} iconColor="text-green-500" iconBg="bg-green-500/10" delay={0} />
        <StatCard title="Easy Solved" value={problems.filter(p => p.isSolved && p.difficulty === "Easy").length}
          icon={Target} iconColor="text-green-500" iconBg="bg-green-500/10" delay={0.05} />
        <StatCard title="Medium Solved" value={problems.filter(p => p.isSolved && p.difficulty === "Medium").length}
          icon={Target} iconColor="text-yellow-500" iconBg="bg-yellow-500/10" delay={0.1} />
        <StatCard title="Bookmarked" value={bookmarked} subtitle="review later"
          icon={Bookmark} iconColor="text-violet-500" iconBg="bg-violet-500/10" delay={0.15} />
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{solved}/{problems.length} ({Math.round((solved/problems.length)*100)}%)</span>
          </div>
          <div className="flex gap-1 h-3">
            {["Easy","Medium","Hard"].map((d, i) => {
              const count = problems.filter(p => p.isSolved && p.difficulty === d).length;
              const total = problems.filter(p => p.difficulty === d).length;
              const colors = ["bg-green-500","bg-yellow-500","bg-red-500"];
              return (
                <div key={d} className="flex-1 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", colors[i])}
                    style={{ width: `${total ? (count/total)*100 : 0}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {["Easy","Medium","Hard"].map((d, i) => {
              const colors = ["text-green-500","text-yellow-500","text-red-500"];
              const count = problems.filter(p => p.isSolved && p.difficulty === d).length;
              const total = problems.filter(p => p.difficulty === d).length;
              return (
                <span key={d} className={cn("text-xs font-medium", colors[i])}>
                  {d}: {count}/{total}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search problems..." className="pl-9" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <Tabs value={selectedDiff} onValueChange={setSelectedDiff}>
          <TabsList>
            {DIFF_TABS.map(d => <TabsTrigger key={d} value={d} className="text-xs">{d}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {/* Topic chips */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...CODING_TOPICS].map(topic => (
          <button key={topic} onClick={() => setSelectedTopic(topic)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all",
              selectedTopic === topic
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground"
            )}>
            {topic}
          </button>
        ))}
      </div>

      {/* Problem list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>{filtered.length} problems</span>
          <button onClick={() => { setSearch(""); setSelectedDiff("All"); setSelectedTopic("All"); }}
            className="flex items-center gap-1 hover:text-foreground transition-colors">
            <RotateCcw className="h-3 w-3" /> Reset filters
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.map((problem, idx) => (
            <motion.div key={problem.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, delay: idx * 0.03 }}>
              <div
                onClick={() => handleOpenProblem(problem)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border bg-card cursor-pointer transition-all duration-150",
                  "hover:shadow-md hover:border-primary/30 hover:-translate-y-px",
                  problem.isSolved && "opacity-80"
                )}
              >
                {/* Solved indicator */}
                <div className="shrink-0">
                  {problem.isSolved
                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                    : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
                </div>

                {/* Title & tags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{problem.title}</span>
                    {problem.isBookmarked && <BookmarkCheck className="h-3.5 w-3.5 text-violet-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {problem.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs h-5">{tag}</Badge>
                    ))}
                    {problem.companies?.slice(0,2).map(c => (
                      <span key={c} className="text-xs text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Difficulty + acceptance */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground">{problem.acceptance.toFixed(1)}% accept</span>
                  <Badge className={cn("text-xs", getDifficultyBadgeColor(problem.difficulty))}>
                    {problem.difficulty}
                  </Badge>
                </div>

                {/* Bookmark btn */}
                <button onClick={e => { e.stopPropagation(); toggleBookmark(problem.id); }}
                  className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors">
                  {problem.isBookmarked
                    ? <BookmarkCheck className="h-4 w-4 text-violet-500" />
                    : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                </button>

                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Code2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No problems found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Problem detail modal */}
      {selectedProblem && (
        <ProblemModal problem={selectedProblem} onClose={() => setSelectedProblem(null)}
          onSolve={() => {
            setProblems(prev => prev.map(p => p.id === selectedProblem.id ? { ...p, isSolved: true } : p));
            setSelectedProblem(null);
          }} />
      )}
    </div>
  );
}
