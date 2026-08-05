import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Upload, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Target, Sparkles, Download, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

const MOCK_ANALYSIS = {
  atsScore: 74, grammarScore: 88, keywordScore: 62, formattingScore: 81, overallScore: 76,
  strengths: ["Clear project descriptions", "Quantified achievements in 2 sections", "Good use of action verbs", "Well-structured education section"],
  weaknesses: ["Missing summary/objective section", "Low keyword density for target role", "No links to GitHub/LinkedIn", "Some bullet points lack impact metrics"],
  suggestions: ["Add a 2-3 line professional summary at the top", "Include relevant keywords: React, TypeScript, AWS, Docker, Kubernetes", "Add GitHub and LinkedIn URLs", "Quantify all achievements (e.g., 'Improved performance by 40%')", "Use stronger action verbs: architected, optimized, spearheaded"],
  missingSkills: ["Docker", "Kubernetes", "AWS", "System Design", "CI/CD"],
  keywords: [
    { word: "JavaScript", found: true }, { word: "React", found: true }, { word: "Python", found: true },
    { word: "SQL", found: true }, { word: "Node.js", found: false }, { word: "TypeScript", found: false },
    { word: "AWS", found: false }, { word: "Docker", found: false }, { word: "Git", found: true },
    { word: "Agile", found: false },
  ],
  sections: [
    { name: "Contact Info", present: true, score: 90, suggestions: ["Add LinkedIn URL", "Add GitHub profile"] },
    { name: "Summary", present: false, score: 0, suggestions: ["Add a professional summary — it's the first thing recruiters read"] },
    { name: "Education", present: true, score: 85, suggestions: ["Add GPA if above 8.0", "Include relevant coursework"] },
    { name: "Experience", present: true, score: 78, suggestions: ["Quantify all bullet points", "Add tech stack used in each role"] },
    { name: "Projects", present: true, score: 82, suggestions: ["Add live demo links", "Mention impact metrics"] },
    { name: "Skills", present: true, score: 65, suggestions: ["Add cloud/DevOps skills", "Organize by category"] },
    { name: "Certifications", present: false, score: 0, suggestions: ["Add relevant certifications (AWS, Google, etc.)"] },
  ],
};

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 32}`}
          strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{score}</span>
    </div>
    <span className="text-xs text-muted-foreground font-medium text-center">{label}</span>
  </div>
);

export default function ResumePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<typeof MOCK_ANALYSIS | null>(null);
  const [resumeText, setResumeText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResumeText(`Sample resume text extracted from ${file.name}. In production, this uses PDF.js or PyPDF2 to extract actual text.`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type.includes("word"))) handleFile(file);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    setAnalysis(MOCK_ANALYSIS);
    setIsAnalyzing(false);
  };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";
  const scoreBadge = (s: number) => s >= 80 ? "success" : s >= 60 ? "warning" : "danger";

  return (
    <div className="space-y-6">
      <PageHeader title="Resume Analyzer" description="AI-powered ATS scoring, keyword analysis & improvement suggestions"
        icon={<FileText className="h-5 w-5 text-amber-500" />}
        actions={analysis && <Button variant="outline" size="sm" onClick={() => { setAnalysis(null); setFileName(null); }}>
          <RefreshCw className="mr-2 h-4 w-4" />Analyze New
        </Button>} />

      {!analysis ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload area */}
          <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn("relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200",
              isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30")}>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted")}>
              <Upload className={cn("h-8 w-8 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{fileName ? fileName : "Drop your resume here"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {fileName ? "File ready for analysis" : "PDF, DOC, or DOCX • Max 5MB"}
              </p>
            </div>
            {!fileName && <Button variant="outline" className="pointer-events-none">Browse Files</Button>}
          </div>

          {fileName && (
            <Button className="w-full" size="lg" variant="gradient" onClick={runAnalysis} loading={isAnalyzing}>
              {isAnalyzing ? "Analyzing Resume..." : <><Sparkles className="mr-2 h-4 w-4" />Analyze with AI</>}
            </Button>
          )}

          {isAnalyzing && (
            <Card>
              <CardContent className="p-6 space-y-3">
                {["Extracting text from PDF...", "Running ATS compatibility check...", "Analyzing keywords...", "Checking grammar & formatting...", "Generating improvement suggestions..."].map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }} className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.4 }}
                      className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tips for Better ATS Score</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Use standard section headings (Education, Experience, Skills)", "Include keywords from the job description", "Avoid tables, columns, and images — ATS can't read them", "Use a single-column layout for best compatibility", "Save as PDF unless the job posting specifies otherwise"].map((tip, i) => (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center">
                  <div className="relative h-28 w-28">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <motion.circle cx="56" cy="56" r="48" fill="none"
                        stroke={scoreColor(analysis.overallScore)} strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        initial={{ strokeDashoffset: `${2 * Math.PI * 48}` }}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 48 * (1 - analysis.overallScore / 100)}` }}
                        transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{analysis.overallScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <p className="font-semibold mt-2">Overall Score</p>
                  <Badge variant={scoreBadge(analysis.overallScore) as any} className="mt-1">
                    {analysis.overallScore >= 80 ? "Excellent" : analysis.overallScore >= 60 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center gap-6 flex-1">
                  <ScoreRing score={analysis.atsScore} label="ATS Score" color={scoreColor(analysis.atsScore)} />
                  <ScoreRing score={analysis.grammarScore} label="Grammar" color={scoreColor(analysis.grammarScore)} />
                  <ScoreRing score={analysis.keywordScore} label="Keywords" color={scoreColor(analysis.keywordScore)} />
                  <ScoreRing score={analysis.formattingScore} label="Formatting" color={scoreColor(analysis.formattingScore)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Strengths</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{s}</div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-red-500 flex items-center gap-2"><XCircle className="h-4 w-4" />Areas to Improve</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <div key={i} className="flex gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />{w}</div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Missing Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map(s => <Badge key={s} variant="warning">{s}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-3 mt-4">
              {analysis.sections.map(sec => (
                <Card key={sec.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {sec.present ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="font-medium text-sm">{sec.name}</span>
                        {!sec.present && <Badge variant="danger" className="text-xs">Missing</Badge>}
                      </div>
                      {sec.present && <span className="text-sm font-bold">{sec.score}/100</span>}
                    </div>
                    {sec.present && <Progress value={sec.score} className="h-1.5 mb-2" indicatorClassName={scoreColor(sec.score) === "#22c55e" ? "bg-green-500" : scoreColor(sec.score) === "#f59e0b" ? "bg-yellow-500" : "bg-red-500"} />}
                    {sec.suggestions.map((s, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex gap-1.5 mt-1"><span className="text-amber-500 mt-0.5">→</span>{s}</p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="keywords" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Keyword Analysis</CardTitle>
                    <span className="text-xs text-muted-foreground">{analysis.keywords.filter(k => k.found).length}/{analysis.keywords.length} found</span>
                  </div>
                  <Progress value={(analysis.keywords.filter(k => k.found).length / analysis.keywords.length) * 100} className="h-1.5 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map(kw => (
                      <div key={kw.word} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border",
                        kw.found ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400"
                          : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400")}>
                        {kw.found ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {kw.word}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-3 mt-4">
              {analysis.suggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex gap-3 p-4 rounded-xl border bg-card">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
                  <p className="text-sm mt-0.5">{s}</p>
                </motion.div>
              ))}
              <Button variant="gradient" className="w-full mt-2">
                <Sparkles className="mr-2 h-4 w-4" />Generate Improved Resume with AI
              </Button>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
