import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Code2, CheckCircle2, Eye, EyeOff, Play, Send, Loader2, Sparkles, AlertCircle, Check, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, getDifficultyBadgeColor } from "@/lib/utils";
import { runCode, submitSolution } from "@/api/coding";
import type { CodingProblem } from "@/types";

interface Props {
  problem: CodingProblem;
  onClose: () => void;
  onSolve: () => void;
}

const LANGUAGES = ["Python", "Java", "C++", "JavaScript", "Go"];
const STARTER: Record<string, string> = {
  Python: "def solution(nums):\n    # Write your solution here\n    pass\n",
  Java: "class Solution {\n    public int[] solution(int[] nums) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
  "C++": "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
  JavaScript: "var solution = function(nums) {\n    // Write your solution here\n};\n",
  Go: "func solution(nums []int) []int {\n    // Write your solution here\n    return nil\n}",
};

export default function ProblemModal({ problem, onClose, onSolve }: Props) {
  const [code, setCode] = useState(STARTER.Python);
  const [language, setLanguage] = useState("Python");
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(problem.isSolved);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<"testcases" | "output" | "ai_analysis">("testcases");
  const [runResult, setRunResult] = useState<{
    passed: boolean;
    stdout: string;
    test_results: Array<{ input: string; expected: string; actual: string; passed: boolean }>;
    ai_analysis: {
      bugs?: string[];
      time_complexity?: string;
      space_complexity?: string;
      optimizations?: string[];
      code_quality_score?: number;
      overall_feedback?: string;
      improved_code?: string;
    };
  } | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const [mobileTab, setMobileTab] = useState<"problem" | "editor">("editor");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER[lang] || "");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setSubmitMessage(null);
    try {
      const res = await runCode({
        problem_id: problem.id,
        code,
        language,
      });
      setRunResult(res);
      setActiveOutputTab("output");
    } catch (e: any) {
      console.error(e);
      setRunResult({
        passed: false,
        stdout: `Error running code: ${e?.response?.data?.detail || e.message}`,
        test_results: [],
        ai_analysis: { overall_feedback: "Execution error occurred." }
      });
      setActiveOutputTab("output");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await submitSolution({
        problem_id: problem.id,
        code,
        language,
        status: "solved",
        time_taken: 60,
      });

      if (res.status === "solved") {
        setSolved(true);
        onSolve();
        setSubmitMessage(`🎉 Accepted! You earned +${res.xp_gained} XP.`);
      } else {
        setSubmitMessage("⚠️ Submission attempted, but issues/bugs were detected.");
      }

      if (res.ai_analysis) {
        setRunResult(prev => ({
          passed: res.status === "solved",
          stdout: prev?.stdout || (res.status === "solved" ? "✓ All test cases passed!" : "✗ Test cases failed."),
          test_results: prev?.test_results || [],
          ai_analysis: res.ai_analysis
        }));
        setActiveOutputTab("ai_analysis");
      }
    } catch (e: any) {
      console.error(e);
      setSubmitMessage("Failed to submit solution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — two-column layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}
        className="relative m-auto w-full max-w-6xl h-[92vh] flex rounded-2xl overflow-hidden shadow-2xl border bg-background"
      >
        {/* Left: Problem description */}
        <div className={cn("w-full lg:w-1/2 flex-col border-r", mobileTab === "problem" ? "flex" : "hidden lg:flex")}>
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b">
            <div className="w-full">
              {/* Mobile Tab Switcher */}
              <div className="flex lg:hidden bg-muted p-1 rounded-lg mb-3">
                <button
                  onClick={() => setMobileTab("problem")}
                  className={cn("flex-1 py-1.5 text-xs rounded-md font-medium transition-all",
                    mobileTab === "problem" ? "bg-background shadow text-foreground" : "text-muted-foreground"
                  )}
                >
                  Problem Description
                </button>
                <button
                  onClick={() => setMobileTab("editor")}
                  className={cn("flex-1 py-1.5 text-xs rounded-md font-medium transition-all flex items-center justify-center gap-1.5",
                    mobileTab === "editor" ? "bg-background shadow text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Code2 className="h-3.5 w-3.5 text-primary" /> Code Editor & Runner
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-lg">{problem.title}</h2>
                {solved && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={cn("text-xs", getDifficultyBadgeColor(problem.difficulty))}>
                  {problem.difficulty}
                </Badge>
                {problem.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors ml-2 shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>

          <Tabs defaultValue="description" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="mx-4 mt-3 mb-0 shrink-0">
              <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
              <TabsTrigger value="hints" className="text-xs">Hints ({problem.hints.length})</TabsTrigger>
              <TabsTrigger value="solution" className="text-xs">Solution</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="description" className="p-4 space-y-4 mt-0">
                <p className="text-sm leading-relaxed whitespace-pre-line">{problem.description}</p>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg bg-muted/50 p-3 font-mono text-sm space-y-1">
                      <p><span className="text-muted-foreground">Input: </span>{ex.input}</p>
                      <p><span className="text-muted-foreground">Output: </span>{ex.output}</p>
                      {ex.explanation && <p className="text-muted-foreground text-xs">{ex.explanation}</p>}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Constraints</h3>
                  <ul className="space-y-1">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-0.5">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                {problem.companies && problem.companies.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Asked By</h3>
                    <div className="flex gap-2 flex-wrap">
                      {problem.companies.map(c => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hints" className="p-4 space-y-3 mt-0">
                {problem.hints.map((hint, i) => (
                  <div key={i} className="rounded-lg border p-3 bg-amber-500/5 border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-sm">Hint {i + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{hint}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="solution" className="p-4 space-y-3 mt-0">
                {!showSolution ? (
                  <div className="text-center py-8">
                    <Eye className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Try solving it first! Viewing the solution early reduces practice benefit.</p>
                    <Button variant="outline" onClick={() => setShowSolution(true)}>
                      <Eye className="mr-2 h-4 w-4" /> Reveal Solution
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Optimal Solution</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowSolution(false)}>
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono border border-gray-800">
                      {problem.solution}
                    </pre>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right: Interactive Code Editor & Output Panel */}
        <div className={cn("w-full lg:w-1/2 flex-col", mobileTab === "editor" ? "flex" : "hidden lg:flex")}>
          {/* Mobile Top Bar to return to Problem */}
          <div className="flex lg:hidden items-center justify-between p-3 border-b bg-muted/40">
            <button
              onClick={() => setMobileTab("problem")}
              className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
            >
              ← Back to Problem Description
            </button>
            <span className="text-xs font-semibold">{problem.title}</span>
          </div>
          {/* Editor Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/20">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {problem.acceptance.toFixed(1)}% Acceptance
              </span>
            </div>
          </div>

          {/* Textarea Code Editor */}
          <div className="flex-1 overflow-hidden relative">
            <Textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="h-full w-full resize-none rounded-none border-0 bg-gray-950 text-gray-100 font-mono text-sm p-4 focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Submission / Status Alert Banner */}
          {submitMessage && (
            <div className={cn("px-4 py-2 text-xs font-medium flex items-center justify-between border-t border-b",
              submitMessage.includes("Accepted") ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}>
              <span>{submitMessage}</span>
              <button onClick={() => setSubmitMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
            </div>
          )}

          {/* Output / Test Results / AI Review Tab Panel */}
          <div className="h-48 border-t bg-gray-950 text-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-gray-800 bg-gray-900/60">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveOutputTab("testcases")}
                  className={cn("px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    activeOutputTab === "testcases" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setActiveOutputTab("output")}
                  className={cn("px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    activeOutputTab === "output" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  <Terminal className="h-3 w-3" /> Output Log
                  {runResult && (
                    <span className={cn("h-2 w-2 rounded-full", runResult.passed ? "bg-green-500" : "bg-red-500")} />
                  )}
                </button>
                <button
                  onClick={() => setActiveOutputTab("ai_analysis")}
                  className={cn("px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    activeOutputTab === "ai_analysis" ? "bg-indigo-900/60 text-indigo-300 border border-indigo-500/30" : "text-gray-400 hover:text-indigo-300"
                  )}
                >
                  <Sparkles className="h-3 w-3 text-indigo-400" /> AI Code Analysis
                </button>
              </div>

              {runResult?.ai_analysis?.code_quality_score && (
                <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">
                  Score: {runResult.ai_analysis.code_quality_score}/100
                </Badge>
              )}
            </div>

            {/* Tab content area */}
            <ScrollArea className="flex-1 p-3 font-mono text-xs">
              {activeOutputTab === "testcases" && (
                <div className="space-y-2">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="p-2 rounded bg-gray-900 border border-gray-800 space-y-1">
                      <div className="text-[11px] font-semibold text-gray-400">Testcase {i + 1}</div>
                      <div><span className="text-gray-500">Input:</span> {ex.input}</div>
                      <div><span className="text-gray-500">Expected:</span> {ex.output}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeOutputTab === "output" && (
                <div>
                  {!runResult ? (
                    <p className="text-gray-500 italic">Click "Run Code" to execute tests and view output.</p>
                  ) : (
                    <div className="space-y-2 whitespace-pre-wrap">
                      <div className="text-gray-300">{runResult.stdout}</div>
                      {runResult.test_results && runResult.test_results.length > 0 && (
                        <div className="mt-2 space-y-1 border-t border-gray-800 pt-2">
                          {runResult.test_results.map((tr, idx) => (
                            <div key={idx} className={cn("p-1.5 rounded flex items-center justify-between text-[11px]",
                              tr.passed ? "bg-green-950/40 text-green-400 border border-green-900/40" : "bg-red-950/40 text-red-400 border border-red-900/40"
                            )}>
                              <span>Case {idx + 1}: Input ({tr.input}) → {tr.actual}</span>
                              <span>{tr.passed ? "PASSED ✓" : "FAILED ✗"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeOutputTab === "ai_analysis" && (
                <div className="space-y-2 font-sans">
                  {!runResult?.ai_analysis ? (
                    <p className="text-gray-500 italic font-mono text-xs">Run or Submit code to get AI insights.</p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-4">
                        <div className="bg-gray-900 p-2 rounded flex-1">
                          <span className="text-gray-400 font-semibold block text-[11px]">Time Complexity</span>
                          <span className="text-indigo-400 font-mono font-bold">{runResult.ai_analysis.time_complexity || "O(N)"}</span>
                        </div>
                        <div className="bg-gray-900 p-2 rounded flex-1">
                          <span className="text-gray-400 font-semibold block text-[11px]">Space Complexity</span>
                          <span className="text-indigo-400 font-mono font-bold">{runResult.ai_analysis.space_complexity || "O(1)"}</span>
                        </div>
                      </div>

                      {runResult.ai_analysis.overall_feedback && (
                        <p className="text-gray-300 bg-gray-900/70 p-2 rounded border border-gray-800">
                          {runResult.ai_analysis.overall_feedback}
                        </p>
                      )}

                      {runResult.ai_analysis.optimizations && runResult.ai_analysis.optimizations.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-amber-400 font-semibold text-[11px] block">Optimizations:</span>
                          <ul className="list-disc list-inside text-gray-300 space-y-0.5 text-[11px]">
                            {runResult.ai_analysis.optimizations.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-3 border-t bg-muted/30">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setCode(STARTER[language] || ""); setRunResult(null); }}>
              Reset Code
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="text-xs" onClick={handleRunCode} disabled={isRunning || isSubmitting}>
                {isRunning ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Running...</> : <><Play className="mr-1.5 h-3.5 w-3.5 fill-current" />Run Code</>}
              </Button>
              <Button
                size="sm"
                className={cn("text-xs", solved ? "bg-green-600 hover:bg-green-700 text-white" : "")}
                onClick={handleSubmitCode}
                disabled={isSubmitting || isRunning}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Submitting...</>
                ) : solved ? (
                  <><Check className="mr-1.5 h-3.5 w-3.5" />Solved</>
                ) : (
                  <><Send className="mr-1.5 h-3.5 w-3.5" />Submit Solution</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

