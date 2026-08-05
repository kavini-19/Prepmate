import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Bot, User, RotateCcw, Star, ChevronDown, Sparkles, MessageSquare, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRelativeTime } from "@/lib/utils";
import { TECH_DOMAINS } from "@/constants";

type InterviewType = "HR" | "Technical";
interface Message { id: string; role: "user" | "assistant"; content: string; timestamp: Date; score?: number; feedback?: string }

const HR_QUESTIONS = [
  "Tell me about yourself and your background.",
  "Why are you interested in this role and our company?",
  "Describe a challenging project you worked on. What was your approach?",
  "Where do you see yourself in 5 years?",
  "What are your greatest strengths and areas for improvement?",
  "Tell me about a time you worked in a team and faced a conflict. How did you resolve it?",
  "How do you handle tight deadlines and pressure?",
  "What motivates you in your work?",
];

const TECH_QUESTIONS: Record<string, string[]> = {
  Java: ["Explain OOP principles with examples in Java.", "What is the difference between HashMap and TreeMap?", "Explain Java memory model and garbage collection.", "What are Java 8 features you've used?"],
  Python: ["Explain Python's GIL and its implications.", "What are decorators in Python? Give an example.", "Difference between list, tuple, and set.", "Explain generators and their use cases."],
  SQL: ["Write a query to find the second highest salary.", "Explain INNER JOIN vs LEFT JOIN.", "What are indexes and when should you use them?", "Explain ACID properties in databases."],
  "System Design": ["Design a URL shortener like bit.ly.", "How would you design a messaging system like WhatsApp?", "Design a rate limiter for an API.", "Explain CAP theorem and trade-offs."],
};

const AI_EVALUATIONS: Record<string, { score: number; feedback: string; tips: string[] }> = {
  default: {
    score: 75,
    feedback: "Good answer! You covered the main points clearly. Your communication was structured and easy to follow.",
    tips: ["Add specific examples from your experience to make your answer more memorable.", "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.", "Quantify your achievements where possible."],
  },
  good: {
    score: 88,
    feedback: "Excellent response! You demonstrated strong knowledge and communicated your thoughts clearly with concrete examples.",
    tips: ["Great use of examples!", "Consider adding a brief summary at the end.", "Your enthusiasm came through well."],
  },
  needs_work: {
    score: 55,
    feedback: "Your answer touched on the key points but could be more structured and detailed.",
    tips: ["Provide more specific examples.", "Structure your answer with a clear beginning, middle, and end.", "Avoid being too vague — interviewers want concrete details."],
  },
};

export default function InterviewPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [interviewType, setInterviewType] = useState<InterviewType>("HR");
  const [domain, setDomain] = useState("Java");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const getQuestions = () => interviewType === "HR" ? HR_QUESTIONS : (TECH_QUESTIONS[domain] || TECH_QUESTIONS.Java);

  const startSession = () => {
    const questions = getQuestions();
    setMessages([{
      id: "1", role: "assistant", timestamp: new Date(),
      content: `Hello! I'm your ${interviewType === "HR" ? "HR" : `${domain} Technical`} interview coach. Let's begin!\n\n**Question 1:**\n\n${questions[0]}`,
    }]);
    setQuestionIndex(0);
    setSessionActive(true);
    setSessionScore(0);
    setScoreCount(0);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 1500));

    // Simulate evaluation
    const evalKeys = Object.keys(AI_EVALUATIONS);
    const evalKey = input.length > 200 ? "good" : input.length < 50 ? "needs_work" : "default";
    const evaluation = AI_EVALUATIONS[evalKey];
    const newScore = sessionScore + evaluation.score;
    const newCount = scoreCount + 1;
    setSessionScore(newScore);
    setScoreCount(newCount);

    const questions = getQuestions();
    const nextIndex = questionIndex + 1;
    const isLast = nextIndex >= questions.length;

    const feedback = `**Evaluation Score: ${evaluation.score}/100**\n\n${evaluation.feedback}\n\n**Tips for improvement:**\n${evaluation.tips.map(t => `• ${t}`).join("\n")}`;
    const nextQuestion = isLast
      ? `\n\n---\n\n🎉 **Interview session complete!** Your overall score: **${Math.round(newScore / newCount)}/100**\n\nClick "New Session" to practice again.`
      : `\n\n---\n\n**Question ${nextIndex + 1}:**\n\n${questions[nextIndex]}`;

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(), role: "assistant",
      content: feedback + nextQuestion, timestamp: new Date(),
      score: evaluation.score, feedback: evaluation.feedback,
    };
    setMessages(prev => [...prev, aiMsg]);
    setQuestionIndex(nextIndex);
    setIsLoading(false);
  };

  const avgScore = scoreCount > 0 ? Math.round(sessionScore / scoreCount) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="AI Mock Interview" description="Practice HR and technical interviews with real-time AI feedback"
        icon={<Mic className="h-5 w-5 text-pink-500" />} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config + Stats */}
        <div className="space-y-4">
          {/* Session config */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Interview Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["HR", "Technical"] as const).map(type => (
                    <button key={type} onClick={() => { setInterviewType(type); setSessionActive(false); }}
                      className={cn("flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all",
                        interviewType === type ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30")}>
                      {type === "HR" ? <MessageSquare className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {interviewType === "Technical" && (
                <div>
                  <p className="text-sm font-medium mb-2">Domain</p>
                  <Select value={domain} onValueChange={v => { setDomain(v); setSessionActive(false); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Java", "Python", "SQL", "System Design", ...TECH_DOMAINS.filter(d => !["Java","Python","SQL","System Design"].includes(d))].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button className="w-full" variant={sessionActive ? "outline" : "gradient"} onClick={startSession}>
                {sessionActive ? <><RotateCcw className="mr-2 h-4 w-4" />New Session</> : <><Sparkles className="mr-2 h-4 w-4" />Start Interview</>}
              </Button>
            </CardContent>
          </Card>

          {/* Live score */}
          {sessionActive && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Session Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-4xl font-bold">{avgScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100 avg score</p>
                </div>
                <Progress value={avgScore} className="h-2"
                  indicatorClassName={avgScore >= 80 ? "bg-green-500" : avgScore >= 60 ? "bg-yellow-500" : "bg-red-500"} />
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold">{questionIndex}</p>
                    <p className="text-xs text-muted-foreground">Answered</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold">{getQuestions().length - questionIndex}</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Use STAR method for behavioral questions",
                "Be specific — use real examples",
                "Show enthusiasm and curiosity",
                "Ask clarifying questions",
                "Think out loud during technical rounds",
              ].map((tip, i) => (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Chat interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-2 shrink-0 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">PrepMate AI Interviewer</p>
                    <p className="text-xs text-muted-foreground">
                      {interviewType === "HR" ? "HR Interview" : `${domain} Technical`}
                    </p>
                  </div>
                </div>
                <div className={cn("h-2 w-2 rounded-full", sessionActive ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {!sessionActive ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ready to Practice?</p>
                    <p className="text-sm mt-1">Configure your interview type and click "Start Interview" to begin.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map(msg => (
                      <motion.div key={msg.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                        {/* Avatar */}
                        <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold",
                          msg.role === "assistant" ? "bg-gradient-to-br from-pink-500 to-rose-600" : "bg-gradient-to-br from-blue-500 to-violet-600")}>
                          {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        {/* Bubble */}
                        <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                          msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm")}>
                          <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
                          {msg.score && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-current/20">
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={cn("h-3 w-3", s <= Math.round(msg.score!/20) ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
                                ))}
                              </div>
                              <span className="text-xs opacity-70">{msg.score}/100</span>
                            </div>
                          )}
                          <p className="text-xs opacity-50 mt-1">{formatRelativeTime(msg.timestamp)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1 items-center h-5">
                          {[0,1,2].map(i => (
                            <motion.div key={i} className="h-2 w-2 bg-muted-foreground/50 rounded-full"
                              animate={{ y: [0,-4,0] }} transition={{ duration: 0.6, delay: i*0.15, repeat: Infinity }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input area */}
            {sessionActive && questionIndex < getQuestions().length && (
              <div className="p-4 border-t shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your answer... (Be specific and detailed)"
                    className="min-h-[80px] resize-none text-sm"
                    onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendMessage(); }}
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading}
                    className="self-end h-10 w-10 p-0" variant="gradient">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Press Ctrl+Enter to send</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
