import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Search, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCompanies } from "@/api/companies";
import type { Company } from "@/types";
import { cn, getDifficultyBadgeColor } from "@/lib/utils";

const TIERS = ["All", "FAANG", "Product", "Service", "Startup", "MNC"] as const;

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("All");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getCompanies({ search, tier: tier === "All" ? undefined : tier })
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search, tier]);

  const filtered = companies;

  const tierColors: Record<string, string> = {
    FAANG: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Product: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Service: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Startup: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    MNC: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Company Preparation" description="Company-specific interview patterns, coding topics & experiences"
        icon={<Building2 className="h-5 w-5 text-blue-500" />} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TIERS.map(t => (
          <button key={t} onClick={() => setTier(t)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              tier === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30")}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company, i) => (
          <motion.div key={company.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/companies/${company.slug}`}>
              <Card hover className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="h-10 w-10 object-contain rounded-lg border bg-white p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                          {company.name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-xs text-muted-foreground">{company.industry}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", tierColors[company.tier])}>{company.tier}</span>
                    <Badge className={cn("text-xs", getDifficultyBadgeColor(company.difficulty))}>{company.difficulty}</Badge>
                    {company.avgPackage && <span className="text-xs text-green-600 dark:text-green-400 font-medium">{company.avgPackage}</span>}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Top Topics</p>
                      <div className="flex flex-wrap gap-1">
                        {(company.codingTopics || []).slice(0, 3).map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                        {(company.codingTopics || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{(company.codingTopics || []).length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{(company.interviewRounds || []).length} rounds</span>
                      <span>{(company.interviewExperiences || []).length} experiences</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No companies found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      )}
    </div>
  );
}
