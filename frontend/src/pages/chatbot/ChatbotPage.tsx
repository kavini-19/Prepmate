import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Sparkles, Code2, Brain, Mic, FileText, RotateCcw, Copy, Check, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn, formatRelativeTime, generateId } from "@/lib/utils";
import { aiApi } from "@/api/ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "code" | "text";
}

const QUICK_PROMPTS = [
  { icon: Code2, text: "Explain time complexity of QuickSort", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Brain, text: "How to solve Two Sum problem optimally?", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: Mic, text: "How to answer 'Tell me about yourself'?", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: FileText, text: "What should a resume summary include?", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Sparkles, text: "Explain System Design concepts for interviews", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Zap, text: "What are the key Java interview topics?", color: "text-orange-500", bg: "bg-orange-500/10" },
];

const AI_RESPONSES: Record<string, string> = {
  "quicksort": `## QuickSort Time Complexity\n\n**Average Case: O(n log n)**\n**Worst Case: O(n²)** — when pivot is always smallest/largest\n**Best Case: O(n log n)**\n\n### Why O(n log n) on average?\n- Each partition divides array roughly in half → **O(log n)** levels\n- Each level processes all **n** elements\n- Total: **n × log n**\n\n### Space Complexity\n- **O(log n)** — recursive call stack\n\n\`\`\`python\ndef quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)\n\`\`\`\n\n💡 **Tip:** Use randomized pivot to avoid worst case in interviews!`,

  "two sum": `## Two Sum — Optimal Solution\n\n**Approach: Hash Map (One Pass)**\n**Time: O(n)** | **Space: O(n)**\n\n### Algorithm\n1. Create an empty hash map\n2. For each number, check if its complement (target - num) exists in map\n3. If yes → return indices\n4. If no → add current number to map\n\n\`\`\`python\ndef twoSum(nums, target):\n    seen = {}  # value -> index\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\`\`\`\n\n### Why this works\n- We check if the complement was seen **before** — avoids using same element twice\n- Single pass = O(n) time\n\n💡 **Interview tip:** Always mention the brute force O(n²) first, then optimize!`,

  "tell me about yourself": `## How to Answer "Tell Me About Yourself"\n\nUse the **Present → Past → Future** framework:\n\n### Structure\n1. **Present** (30 sec) — Current role/education & key skills\n2. **Past** (30 sec) — Relevant experience & achievements\n3. **Future** (15 sec) — Why this role/company excites you\n\n### Sample Answer\n*"I'm a final-year CS student at [College], where I've been specializing in full-stack development. I've built [Project A] using React and Node.js, which [impact/achievement]. Previously, I interned at [Company] where I [achievement]. I'm excited about this role because [specific reason], and I'd love to contribute my [skill] to your team."*\n\n### Key Tips\n- Keep it to 90 seconds max\n- Tailor it to the job description\n- Practice until it sounds natural, not rehearsed\n- End with a connection to the role`,

  "default": `I'm here to help with your placement preparation! I can answer questions about:\n\n- 📚 **Data Structures & Algorithms** — explanations, code, complexity analysis\n- 🧩 **Aptitude Problems** — quantitative, logical, verbal, data interpretation\n- 🎤 **Interview Preparation** — HR questions, technical rounds, behavioral answers\n- 📄 **Resume Writing** — tips, ATS optimization, formatting\n- 🏢 **Company-Specific Prep** — Google, Microsoft, Amazon, Infosys and more\n- 💻 **System Design** — HLD, LLD, scalability concepts\n\nWhat would you like to learn today?`,
};

const getAIResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("quicksort") || lower.includes("quick sort")) return AI_RESPONSES.quicksort;
  if (lower.includes("two sum") || lower.includes("twosum")) return AI_RESPONSES["two sum"];
  if (lower.includes("tell me about yourself") || lower.includes("introduce yourself")) return AI_RESPONSES["tell me about yourself"];
  if (lower.includes("time complexity") || lower.includes("big o")) return `## Time Complexity Guide\n\n| Complexity | Name | Example |\n|---|---|---|\n| O(1) | Constant | Array access |\n| O(log n) | Logarithmic | Binary search |\n| O(n) | Linear | Linear search |\n| O(n log n) | Linearithmic | Merge sort |\n| O(n²) | Quadratic | Bubble sort |\n| O(2ⁿ) | Exponential | Fibonacci (naive) |\n\n💡 **Golden rule:** Always aim for O(n log n) or better in interviews!`;
  if (lower.includes("system design")) return `## System Design Fundamentals\n\n### Key Topics to Master\n1. **Scalability** — horizontal vs vertical scaling\n2. **Load Balancing** — distributing traffic\n3. **Caching** — Redis, Memcached\n4. **Databases** — SQL vs NoSQL trade-offs\n5. **Message Queues** — Kafka, RabbitMQ\n6. **CDN** — Content delivery networks\n\n### Famous Problems\n- Design Twitter / Instagram\n- Design URL Shortener\n- Design WhatsApp\n- Design YouTube\n\n💡 Always start with **clarifying requirements** then estimate **scale**!`;
  if (lower.includes("java") || lower.includes("oop")) return `## Java Interview Key Topics\n\n### OOP Pillars\n- **Encapsulation** → private fields, getters/setters\n- **Inheritance** → \`extends\`, \`super\`\n- **Polymorphism** → overloading & overriding\n- **Abstraction** → abstract classes & interfaces\n\n### Frequently Asked\n- HashMap vs HashTable vs ConcurrentHashMap\n- ArrayList vs LinkedList\n- String vs StringBuilder vs StringBuffer\n- Checked vs Unchecked exceptions\n- Java 8 features: Streams, Lambdas, Optional\n- Garbage Collection basics\n\n\`\`\`java\n// Common pattern: HashMap usage\nMap<String, Integer> map = new HashMap<>();\nmap.put("key", 1);\nmap.getOrDefault("key", 0); // safe get\n\`\`\``;
  return AI_RESPONSES.default;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant", timestamp: new Date(),
    content: `👋 Hi! I'm **PrepMate AI**, your placement preparation assistant.\n\nI can help you with DSA, aptitude, interviews, resume tips, and company-specific prep.\n\n**Try one of the quick questions below or ask me anything!**`,
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput("");

    const userMsg: Message = { id: generateId(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build the full message history to send to the backend
      const history = [...messages, userMsg].map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const { data } = await aiApi.chat(history);
      const aiMsg: Message = { id: generateId(), role: "assistant", content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "⚠️ Sorry, I'm having trouble connecting to the AI service right now. Please check that the backend is running and the Gemini API key is configured correctly in `.env`.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessage = (content: string) => {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-3 mb-1">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-2 mb-1">$3</h3>'.replace('$3', '$1'))
      .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-gray-950 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 border border-gray-700"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <PageHeader title="AI Study Assistant" description="Ask anything about DSA, interviews, aptitude, or career advice"
        icon={<Bot className="h-5 w-5 text-violet-500" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setMessages([{
            id: "welcome", role: "assistant", timestamp: new Date(),
            content: "Chat cleared! Ask me anything about your placement preparation.",
          }])}>
            <RotateCcw className="mr-1.5 h-4 w-4" />Clear Chat
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Chat area */}
        <Card className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-2">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div key={msg.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    {/* Avatar */}
                    <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                        : "bg-gradient-to-br from-blue-500 to-cyan-600")}>
                      {msg.role === "assistant" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
                    </div>

                    {/* Bubble */}
                    <div className={cn("group max-w-[85%] space-y-1")}>
                      <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm")}>
                        {msg.role === "assistant" ? (
                          <div dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                      <div className={cn("flex items-center gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(msg.timestamp)}</span>
                        {msg.role === "assistant" && (
                          <button onClick={() => copyMessage(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                            {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/50"
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about DSA, aptitude, interviews, resume, system design..."
                className="min-h-[60px] max-h-[120px] resize-none text-sm"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
                className="self-end h-10 w-10 p-0 shrink-0" variant="gradient">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </Card>

        {/* Quick prompts sidebar */}
        <div className="lg:w-64 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />Quick Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_PROMPTS.map(({ icon: Icon, text, color, bg }) => (
                <button key={text} onClick={() => sendMessage(text)}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left hover:bg-muted/60 transition-colors group">
                  <div className={cn("h-7 w-7 shrink-0 flex items-center justify-center rounded-lg", bg)}>
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-snug">{text}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Topics I can help with</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {["DSA", "Arrays", "DP", "Trees", "Graphs", "SQL", "OOP", "Java", "Python", "System Design", "HR Interview", "Resume", "Aptitude", "CS Fundamentals"].map(t => (
                <Badge key={t} variant="secondary" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => sendMessage(`Explain ${t} for placement interviews`)}>
                  {t}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
