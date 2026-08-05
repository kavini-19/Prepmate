import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Library, Search, Download, Eye, Star, FileText, Video, BookOpen, Zap, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { getResources } from "@/api/resources";
import { cn, formatNumber } from "@/lib/utils";
import type { Resource } from "@/types";

const TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  pdf:        { icon: FileText,  color: "text-red-500",    bg: "bg-red-500/10" },
  video:      { icon: Video,     color: "text-blue-500",   bg: "bg-blue-500/10" },
  article:    { icon: BookOpen,  color: "text-green-500",  bg: "bg-green-500/10" },
  cheatsheet: { icon: Zap,       color: "text-amber-500",  bg: "bg-amber-500/10" },
  notes:      { icon: FileText,  color: "text-violet-500", bg: "bg-violet-500/10" },
};

const CATEGORIES = ["All", "DSA", "System Design", "HR Interview", "SQL", "Java", "OS", "CN"];
const TYPES      = ["All", "pdf", "cheatsheet", "notes", "video", "article"];

export default function ResourcesPage() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType]         = useState("All");

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getResources({
      search: search || undefined,
      category: category === "All" ? undefined : category,
      type: type === "All" ? undefined : type
    })
      .then(setResources)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search, category, type]);

  const filtered = resources;

  const totalDownloads = resources.reduce((a, r) => a + (r.downloads || 0), 0);
  const avgRating = resources.length > 0 ? (resources.reduce((a, r) => a + (r.rating || 0), 0) / resources.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Library"
        description="Curated notes, cheat sheets, PDFs & study materials"
        icon={<Library className="h-5 w-5 text-green-500" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Resources" value={resources.length} icon={Library} iconColor="text-green-500" iconBg="bg-green-500/10" delay={0} />
        <StatCard title="Total Downloads" value={formatNumber(totalDownloads)} icon={Download} iconColor="text-blue-500" iconBg="bg-blue-500/10" delay={0.05} />
        <StatCard title="Avg Rating" value={avgRating} icon={Star} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={0.1} />
        <StatCard title="Categories" value={CATEGORIES.length - 1} icon={Filter} iconColor="text-violet-500" iconBg="bg-violet-500/10" delay={0.15} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search resources..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Category</p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === c ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Type</p>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all",
                type === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Resource grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((resource, i) => {
          const meta = TYPE_META[resource.type] || TYPE_META.article;
          const Icon = meta.icon;
          return (
            <motion.div key={resource.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover className="h-full flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("h-10 w-10 shrink-0 flex items-center justify-center rounded-xl", meta.bg)}>
                      <Icon className={cn("h-5 w-5", meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{resource.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{resource.author}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex-1 line-clamp-2 mb-3 leading-relaxed">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs capitalize">{resource.type}</Badge>
                    <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                    {resource.tags.slice(0, 2).map(t => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(resource.views)}</span>
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{formatNumber(resource.downloads)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{resource.rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    {resource.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => window.open(resource.url, "_blank", "noopener,noreferrer")}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />Preview
                      </Button>
                    )}
                    {(resource.downloadUrl || resource.url) && (
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8"
                        variant="gradient"
                        onClick={() => window.open(resource.downloadUrl || resource.url, "_blank", "noopener,noreferrer")}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Library className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No resources found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
