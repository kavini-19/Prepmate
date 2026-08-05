import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Code2, Brain, Mic, MessageSquare, Star, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCompany } from "@/api/companies";
import type { Company } from "@/types";
import { cn, getDifficultyBadgeColor } from "@/lib/utils";

export default function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getCompany(slug)
        .then(setCompany)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <p className="text-xl font-semibold">Company not found</p>
        <Button variant="outline" className="mt-4" asChild><Link to="/companies"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/companies"><ArrowLeft className="mr-2 h-4 w-4" />All Companies</Link>
      </Button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-gradient-to-r from-blue-500/10 via-violet-500/5 to-transparent p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="h-16 w-16 object-contain rounded-xl border bg-white p-2" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white">
              {company.name[0]}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <Badge className={cn("text-xs", getDifficultyBadgeColor(company.difficulty))}>{company.difficulty}</Badge>
              <Badge variant="secondary">{company.tier}</Badge>
            </div>
            <p className="text-muted-foreground">{company.industry}</p>
            {company.avgPackage && <p className="text-green-600 dark:text-green-400 font-semibold mt-1">{company.avgPackage}</p>}
          </div>
          <Button variant="gradient" asChild className="shrink-0">
            <Link to={`/interview`}><Mic className="mr-2 h-4 w-4" />Practice Interview</Link>
          </Button>
        </div>
      </motion.div>

      {/* Interview rounds */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Interview Process</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {company.interviewRounds.map((round, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                  <span className="text-sm font-medium">{round}</span>
                </div>
                {i < company.interviewRounds.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="coding">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="coding"><Code2 className="mr-1.5 h-3.5 w-3.5" />Coding</TabsTrigger>
          <TabsTrigger value="aptitude"><Brain className="mr-1.5 h-3.5 w-3.5" />Aptitude</TabsTrigger>
          <TabsTrigger value="technical"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Technical</TabsTrigger>
          <TabsTrigger value="hr"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />HR</TabsTrigger>
          <TabsTrigger value="experiences"><Star className="mr-1.5 h-3.5 w-3.5" />Experiences</TabsTrigger>
        </TabsList>

        <TabsContent value="coding" className="mt-4">
          <Card><CardContent className="p-5">
            <h3 className="font-semibold mb-3">Frequently Asked Topics</h3>
            <div className="flex flex-wrap gap-2">
              {(company.codingTopics || []).map(t => (
                <Link key={t} to={`/coding?topic=${t}`}>
                  <Badge variant="secondary" className="text-sm px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">{t}</Badge>
                </Link>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="aptitude" className="mt-4">
          <Card><CardContent className="p-5">
            <h3 className="font-semibold mb-3">Aptitude Areas</h3>
            <div className="flex flex-wrap gap-2">
              {(company.aptitudeTopics || []).map(t => <Badge key={t} variant="secondary" className="text-sm px-3 py-1">{t}</Badge>)}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="technical" className="mt-4">
          <Card><CardContent className="p-5">
            <h3 className="font-semibold mb-3">Technical Topics</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(company.technicalTopics || []).map(t => <Badge key={t} className="text-sm px-3 py-1">{t}</Badge>)}
            </div>
            <Button variant="gradient" size="sm" asChild>
              <Link to="/interview"><Mic className="mr-2 h-4 w-4" />Start Technical Mock Interview</Link>
            </Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="hr" className="mt-4 space-y-3">
          {(company.hrQuestions || []).map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Card><CardContent className="p-4 flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
                <p className="text-sm font-medium">{q}</p>
              </CardContent></Card>
            </motion.div>
          ))}
          <Button variant="gradient" className="w-full" asChild>
            <Link to="/interview"><Mic className="mr-2 h-4 w-4" />Practice HR Interview</Link>
          </Button>
        </TabsContent>

        <TabsContent value="experiences" className="mt-4 space-y-4">
          {company.interviewExperiences.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No experiences shared yet. Be the first!</p>
            </CardContent></Card>
          ) : (
            company.interviewExperiences.map(exp => (
              <Card key={exp.id}><CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{exp.author}</p>
                    <p className="text-sm text-muted-foreground">{exp.role} • {exp.year}</p>
                  </div>
                  <Badge variant={exp.result === "Selected" ? "success" : exp.result === "Rejected" ? "danger" : "secondary"}>
                    {exp.result}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{exp.experience}</p>
                <div>
                  <p className="text-xs font-semibold mb-1">Rounds Faced:</p>
                  <div className="flex flex-wrap gap-1">{exp.rounds.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Tips:</p>
                  {exp.tips.map((tip, i) => <p key={i} className="text-xs text-muted-foreground">• {tip}</p>)}
                </div>
              </CardContent></Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
