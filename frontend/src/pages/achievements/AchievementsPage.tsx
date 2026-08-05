import { motion } from "framer-motion";
import { Trophy, Star, Zap, Lock, Crown, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { MOCK_BADGES } from "@/lib/mockData";
import { useAuthStore } from "@/store/authStore";
import { cn, formatDate } from "@/lib/utils";
import { XP_PER_LEVEL } from "@/constants";

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string; color: string }> = {
  common:    { border: "border-gray-400/50",   glow: "",                              label: "Common",    color: "text-gray-500" },
  rare:      { border: "border-blue-400/50",   glow: "shadow-blue-500/20 shadow-md",  label: "Rare",      color: "text-blue-500" },
  epic:      { border: "border-violet-400/50", glow: "shadow-violet-500/20 shadow-lg", label: "Epic",     color: "text-violet-500" },
  legendary: { border: "border-amber-400/50",  glow: "shadow-amber-500/30 shadow-xl", label: "Legendary", color: "text-amber-500" },
};

const LEADERBOARD = [
  { rank: 1, name: "Rahul Kumar",   college: "IIT Delhi",  xp: 8450, streak: 30, solved: 234, avatar: "RK" },
  { rank: 2, name: "Priya Sharma",  college: "NIT Trichy", xp: 7820, streak: 25, solved: 198, avatar: "PS" },
  { rank: 3, name: "Arjun Singh",   college: "BITS Pilani", xp: 7210, streak: 22, solved: 187, avatar: "AS" },
  { rank: 4, name: "Sneha Patel",   college: "VIT Vellore", xp: 6890, streak: 18, solved: 172, avatar: "SP" },
  { rank: 5, name: "Vikram Nair",   college: "Amrita",     xp: 6540, streak: 15, solved: 165, avatar: "VN" },
  { rank: 6, name: "Alex Johnson",  college: "MIT",        xp: 1250, streak: 7,  solved: 48,  avatar: "AJ", isMe: true },
];

const CATEGORY_ICONS: Record<string, string> = {
  coding: "💻", aptitude: "🧠", interview: "🎤", streak: "🔥", special: "⭐",
};

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const xp = user?.xp ?? 1250;
  const level = user?.level ?? 3;
  const xpProgress = xp % XP_PER_LEVEL;
  const unlockedBadges = MOCK_BADGES.filter(b => b.unlocked);
  const lockedBadges = MOCK_BADGES.filter(b => !b.unlocked);
  const totalXP = unlockedBadges.reduce((a, b) => a + b.xpReward, 0);

  const BadgeCard = ({ badge }: { badge: typeof MOCK_BADGES[0] }) => {
    const rarity = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
    return (
      <motion.div whileHover={{ scale: badge.unlocked ? 1.04 : 1 }}
        className={cn("relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all",
          badge.unlocked ? cn(rarity.border, rarity.glow, "bg-card") : "border-border bg-muted/30 opacity-50")}>
        {badge.rarity === "legendary" && badge.unlocked && (
          <div className="absolute -top-1 -right-1">
            <Crown className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
        )}
        <div className={cn("text-3xl", !badge.unlocked && "grayscale filter")}>{badge.icon}</div>
        {!badge.unlocked && (
          <div className="absolute inset-0 flex items-start justify-end p-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold leading-tight">{badge.name}</p>
          <p className="text-xs text-muted-foreground leading-tight">{badge.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("text-xs font-medium", rarity.color)}>{rarity.label}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <div className="flex items-center gap-0.5">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-500">+{badge.xpReward}</span>
          </div>
        </div>
        {badge.unlocked && badge.unlockedAt && (
          <p className="text-xs text-muted-foreground">{formatDate(badge.unlockedAt)}</p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements & Leaderboard"
        description="Earn badges, collect XP and compete with peers"
        icon={<Trophy className="h-5 w-5 text-amber-500" />} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Badges Earned" value={`${unlockedBadges.length}/${MOCK_BADGES.length}`}
          icon={Award} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={0} />
        <StatCard title="Total XP" value={xp.toLocaleString()}
          icon={Zap} iconColor="text-yellow-500" iconBg="bg-yellow-500/10" delay={0.05} />
        <StatCard title="Current Level" value={`Level ${level}`} subtitle={`${xpProgress}/${XP_PER_LEVEL} XP to next`}
          icon={Star} iconColor="text-violet-500" iconBg="bg-violet-500/10" delay={0.1} />
        <StatCard title="Global Rank" value="#6" subtitle="Top 15% of users"
          icon={Trophy} iconColor="text-blue-500" iconBg="bg-blue-500/10" delay={0.15} />
      </div>

      {/* Level progress */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-xl shrink-0">
              {level}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Level {level} — Intermediate</span>
                <span className="text-muted-foreground">{xpProgress} / {XP_PER_LEVEL} XP</span>
              </div>
              <Progress value={(xpProgress / XP_PER_LEVEL) * 100} className="h-3"
                indicatorClassName="bg-gradient-to-r from-violet-500 to-indigo-500" />
              <p className="text-xs text-muted-foreground">
                {XP_PER_LEVEL - xpProgress} XP needed to reach Level {level + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges">My Badges ({unlockedBadges.length})</TabsTrigger>
          <TabsTrigger value="all">All Badges ({MOCK_BADGES.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Earned badges */}
        <TabsContent value="badges" className="mt-4">
          {unlockedBadges.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No badges yet</p>
              <p className="text-sm mt-1">Start solving problems to earn your first badge!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => {
                const catBadges = unlockedBadges.filter(b => b.category === cat);
                if (catBadges.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 capitalize">
                      <span>{icon}</span>{cat} Badges
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {catBadges.map(b => <BadgeCard key={b.id} badge={b} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* All badges */}
        <TabsContent value="all" className="mt-4 space-y-6">
          {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => {
            const catBadges = MOCK_BADGES.filter(b => b.category === cat);
            return (
              <div key={cat}>
                <h3 className="font-semibold mb-3 flex items-center gap-2 capitalize">
                  <span>{icon}</span>{cat} Badges
                  <Badge variant="secondary" className="text-xs">{catBadges.filter(b => b.unlocked).length}/{catBadges.length}</Badge>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {catBadges.map(b => <BadgeCard key={b.id} badge={b} />)}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />Global Leaderboard — This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {LEADERBOARD.map((entry, i) => {
                const rankColors = ["text-amber-400", "text-gray-400", "text-amber-700"];
                const rankBg = ["bg-amber-500/10", "bg-gray-500/10", "bg-amber-700/10"];
                return (
                  <motion.div key={entry.rank}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={cn("flex items-center gap-4 p-3 rounded-xl transition-all",
                      entry.isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50")}>
                    {/* Rank */}
                    <div className={cn("w-8 text-center font-bold text-sm shrink-0",
                      i < 3 ? rankColors[i] : "text-muted-foreground")}>
                      {i < 3 ? ["🥇","🥈","🥉"][i] : `#${entry.rank}`}
                    </div>
                    {/* Avatar */}
                    <div className={cn("h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold",
                      entry.isMe ? "bg-gradient-to-br from-blue-500 to-violet-600" : "bg-gradient-to-br from-gray-500 to-gray-600")}>
                      {entry.avatar}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{entry.name}</p>
                        {entry.isMe && <Badge variant="info" className="text-xs">You</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{entry.college}</p>
                    </div>
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-right shrink-0">
                      <div>
                        <p className="text-xs text-muted-foreground">Solved</p>
                        <p className="text-sm font-bold">{entry.solved}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Streak</p>
                        <p className="text-sm font-bold text-orange-500">🔥{entry.streak}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">XP</p>
                        <p className="text-sm font-bold text-amber-500">{entry.xp.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
