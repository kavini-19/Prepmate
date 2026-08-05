import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Clock, Target, Trophy, ChevronRight, RotateCcw, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { getQuestions, submitQuiz, getAptitudeStats } from "@/api/aptitude";
import { APTITUDE_CATEGORIES } from "@/constants";
import type { AptitudeQuestion } from "@/types";
import { cn } from "@/lib/utils";
import type { AptitudeCategory } from "@/types";

type QuizState = "select" | "quiz" | "result";

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string; desc: string }> = {
  "Quantitative Aptitude": { icon: "📐", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Numbers, percentages, speed, time & work" },
  "Logical Reasoning": { icon: "🧩", color: "text-violet-500", bg: "bg-violet-500/10", desc: "Patterns, sequences, puzzles & deduction" },
  "Verbal Ability": { icon: "📝", color: "text-green-500", bg: "bg-green-500/10", desc: "Grammar, vocabulary & comprehension" },
  "Data Interpretation": { icon: "📊", color: "text-amber-500", bg: "bg-amber-500/10", desc: "Tables, graphs, charts & data analysis" },
};

export default function AptitudePage() {
  const [quizState, setQuizState] = useState<QuizState>("select");
  const [selectedCategory, setSelectedCategory] = useState<AptitudeCategory | null>(null);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);
  const [startTime, setStartTime] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    getAptitudeStats().then(setStats).catch(console.error);
  }, [quizState]);

  const startQuiz = async (category: AptitudeCategory, difficulty?: string) => {
    setIsStarting(true);
    try {
      let selected: AptitudeQuestion[] = [];
      try {
        selected = await getQuestions({ category, difficulty, limit: 8, fresh: true });
      } catch {
        // Fallback to pre-seeded DB questions if AI generation fails or times out
        selected = await getQuestions({ category, difficulty, limit: 8, fresh: false });
      }

      if (!selected || selected.length === 0) {
        // Final fallback try without difficulty constraint
        selected = await getQuestions({ category, limit: 8 });
      }

      if (!selected || selected.length === 0) {
        alert("No questions available for this category right now. Please try another category.");
        setIsStarting(false);
        return;
      }

      setQuestions(selected);
      setSelectedCategory(category);
      setAnswers([]);
      setCurrent(0);
      setStartTime(Date.now());
      const tl = selected[0]?.timeLimit || 60;
      setTimeLeft(tl);
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleNext(-1); return selected[0]?.timeLimit || 60; }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      setQuizState("quiz");
    } catch (e: any) {
      console.error(e);
      alert("Could not load questions. Please check that the backend is running.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answers[current] !== undefined) return;
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = (forcedAnswer?: number) => {
    const newAnswers = [...answers];
    if (newAnswers[current] === undefined) {
      newAnswers[current] = forcedAnswer ?? -1;
      setAnswers(newAnswers);
    }
    
    // Check if it's the last question using the updated answers array
    if (current + 1 >= questions.length) {
      clearInterval(timerInterval);
      setQuizState("result");
      // Calculate score and submit
      const finalScore = newAnswers.reduce((acc: number, ans, i) => acc + (ans === questions[i]?.correctAnswer ? 1 : 0), 0);
      const finalTimeTaken = Math.round((Date.now() - startTime) / 1000);
      if (selectedCategory) {
        submitQuiz({
          category: selectedCategory,
          score: finalScore,
          total_questions: questions.length,
          time_taken: finalTimeTaken
        }).catch(console.error);
      }
      return;
    }
    setCurrent(c => c + 1);
    setTimeLeft(questions[current + 1]?.timeLimit || 60);
  };

  const resetQuiz = () => {
    clearInterval(timerInterval);
    setQuizState("select");
    setSelectedCategory(null);
    setCurrent(0);
    setAnswers([]);
  };

  const score = answers.reduce((acc: number, ans, i) => acc + (ans === questions[i]?.correctAnswer ? 1 : 0), 0);
  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const q = questions[current];
  const selectedAnswer = answers[current];

  return (
    <div className="space-y-6">
      <PageHeader title="Aptitude Preparation" description="Master quantitative, logical, verbal & data interpretation"
        icon={<Brain className="h-5 w-5 text-violet-500" />} />

      <AnimatePresence mode="wait">
        {/* ── Category Selection ── */}
        {quizState === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Quizzes Taken" value={stats?.totalQuizzes || 0} icon={Target} iconColor="text-blue-500" iconBg="bg-blue-500/10" />
              <StatCard title="Avg Score" value={`${stats?.averageScore || 0}%`} icon={Trophy} iconColor="text-amber-500" iconBg="bg-amber-500/10" />
              <StatCard title="Best Streak" value="8" subtitle="correct in a row" icon={Brain} iconColor="text-violet-500" iconBg="bg-violet-500/10" />
              <StatCard title="Questions Done" value={stats?.totalQuestions || 0} icon={CheckCircle2} iconColor="text-green-500" iconBg="bg-green-500/10" />
            </div>

            {/* AI Loading Modal Overlay */}
            {isStarting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-card border rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 mx-auto animate-bounce">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Preparing Test Questions</h3>
                    <p className="text-xs text-muted-foreground mt-1">Generating fresh AI questions for your quiz session...</p>
                  </div>
                  <div className="flex justify-center items-center gap-2 text-xs text-primary font-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to AI Engine...</span>
                  </div>
                </div>
              </div>
            )}

            <h2 className="font-semibold text-lg">Choose a Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {APTITUDE_CATEGORIES.map(cat => {
                const meta = CATEGORY_META[cat];
                return (
                  <motion.div key={cat} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card hover className="cursor-pointer transition-all border-muted hover:border-primary/50" onClick={() => startQuiz(cat as AptitudeCategory)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-2xl", meta.bg)}>
                            {meta.icon}
                          </div>
                          <Badge variant="purple" className="text-xs font-medium cursor-pointer">✨ Take AI Quiz</Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{cat}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{meta.desc}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                          <div className="flex gap-1.5">
                            {["Easy", "Medium", "Hard"].map(d => (
                              <button
                                key={d}
                                onClick={(e) => { e.stopPropagation(); startQuiz(cat as AptitudeCategory, d); }}
                                className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity",
                                  d === "Easy" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                                  d === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                  "bg-red-500/10 text-red-600 dark:text-red-400"
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center text-xs text-primary font-medium group">
                            <span>Start</span>
                            <ChevronRight className="h-4 w-4 ml-0.5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent history */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Quiz History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats?.recentHistory || []).slice(0, 3).map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{h.category}</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{Math.round(h.score/h.totalQuestions*100)}%</p>
                        <p className="text-xs text-muted-foreground">{h.score}/{h.totalQuestions}</p>
                      </div>
                      <Progress value={(h.score/h.totalQuestions)*100} className="w-24 h-1.5"
                        indicatorClassName={(h.score/h.totalQuestions) >= 0.8 ? "bg-green-500" : (h.score/h.totalQuestions) >= 0.6 ? "bg-yellow-500" : "bg-red-500"} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Active Quiz ── */}
        {quizState === "quiz" && q && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} className="max-w-2xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{selectedCategory}</p>
                <p className="font-semibold">Question {current + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
                  timeLeft <= 10 ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-muted text-foreground")}>
                  <Clock className="h-4 w-4" /> {timeLeft}s
                </div>
                <button onClick={resetQuiz} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <Progress value={((current) / questions.length) * 100} className="h-1.5" />

            {/* Question card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-2 mb-6">
                  <Badge variant={q.difficulty === "Easy" ? "success" : q.difficulty === "Medium" ? "warning" : "danger"}
                    className="shrink-0 mt-0.5">{q.difficulty}</Badge>
                  <p className="font-medium text-base leading-relaxed">{q.question}</p>
                </div>

                <div className="space-y-3">
                  {q.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === q.correctAnswer;
                    const isAnswered = selectedAnswer !== undefined;

                    return (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                        onClick={() => handleAnswer(idx)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium",
                          !isAnswered && "hover:border-primary/50 hover:bg-primary/5",
                          isAnswered && isSelected && isCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                          isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
                          isAnswered && !isSelected && isCorrect && "border-green-500 bg-green-500/5",
                          isAnswered && !isSelected && !isCorrect && "border-border opacity-60",
                          !isAnswered && "border-border"
                        )}>
                        <div className="flex items-center gap-3">
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2",
                            isAnswered && isSelected && isCorrect ? "border-green-500 text-green-600 bg-green-100 dark:bg-green-900/30" :
                            isAnswered && isSelected && !isCorrect ? "border-red-500 text-red-600 bg-red-100 dark:bg-red-900/30" :
                            "border-current opacity-60")}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                          {isAnswered && isSelected && isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-500" />}
                          {isAnswered && !isSelected && isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation after answer */}
                <AnimatePresence>
                  {selectedAnswer !== undefined && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
                      <p className="text-sm text-muted-foreground">{q.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetQuiz}>Quit Quiz</Button>
              <Button onClick={() => handleNext()} disabled={selectedAnswer === undefined && timeLeft > 0}>
                {current + 1 >= questions.length ? "Finish" : "Next Question"}
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        {quizState === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className={cn("inline-flex h-24 w-24 items-center justify-center rounded-full text-4xl mb-4",
                  percentage >= 80 ? "bg-green-100 dark:bg-green-900/30" : percentage >= 60 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-red-100 dark:bg-red-900/30")}>
                {percentage >= 80 ? "🏆" : percentage >= 60 ? "👍" : "💪"}
              </motion.div>
              <h2 className="text-3xl font-bold mb-1">{percentage}%</h2>
              <p className="text-muted-foreground">
                {score} correct out of {questions.length} • {Math.floor(timeTaken/60)}m {timeTaken%60}s
              </p>
              <p className="font-medium mt-2 text-lg">
                {percentage >= 80 ? "Excellent work! 🎉" : percentage >= 60 ? "Good effort! Keep practicing." : "Don't give up! Review and retry."}
              </p>
            </div>

            {/* Score breakdown */}
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div><p className="text-2xl font-bold text-green-500">{score}</p><p className="text-xs text-muted-foreground">Correct</p></div>
                  <div><p className="text-2xl font-bold text-red-500">{questions.length - score}</p><p className="text-xs text-muted-foreground">Wrong</p></div>
                  <div><p className="text-2xl font-bold text-blue-500">{timeTaken}s</p><p className="text-xs text-muted-foreground">Time taken</p></div>
                </div>
                <Progress value={percentage} className="h-3"
                  indicatorClassName={percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500"} />
              </CardContent>
            </Card>

            {/* Question review */}
            <div className="space-y-3">
              <h3 className="font-semibold">Question Review</h3>
              {questions.map((q, i) => (
                <div key={q.id} className={cn("p-4 rounded-xl border",
                  answers[i] === q.correctAnswer ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5")}>
                  <div className="flex items-start gap-2">
                    {answers[i] === q.correctAnswer
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{q.question}</p>
                      {answers[i] !== q.correctAnswer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Your answer: <span className="text-red-500">{q.options[answers[i] as number] ?? "Skipped"}</span> •{" "}
                          Correct: <span className="text-green-500">{q.options[q.correctAnswer]}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetQuiz}>
                <RotateCcw className="mr-2 h-4 w-4" /> Try Another
              </Button>
              <Button className="flex-1" onClick={() => selectedCategory && startQuiz(selectedCategory)}>
                Retry This Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
