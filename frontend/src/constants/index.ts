export const APP_NAME = "PrepMate";
export const APP_TAGLINE = "Your AI-Powered Placement Partner";

export const CODING_TOPICS = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Tree",
  "Graph",
  "Dynamic Programming",
  "Recursion",
  "Backtracking",
  "Greedy",
  "Sorting",
  "Binary Search",
  "Hashing",
  "Math",
] as const;

export const APTITUDE_CATEGORIES = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Data Interpretation",
] as const;

export const TECH_DOMAINS = [
  "Java",
  "Python",
  "SQL",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "OOP",
  "Spring Boot",
  "Web Development",
  "Data Structures",
  "System Design",
] as const;

export const COMPANY_TIERS = ["FAANG", "Product", "Service", "Startup", "MNC"] as const;

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export const XP_PER_LEVEL = 500;
export const PROBLEM_XP = { Easy: 10, Medium: 25, Hard: 50 };
export const QUIZ_XP = 5;
export const INTERVIEW_XP = 30;
export const STREAK_BONUS_XP = 20;

export const COLORS = {
  primary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  orange: "#f97316",
};

export const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Coding", href: "/coding", icon: "Code2" },
  { label: "Aptitude", href: "/aptitude", icon: "Brain" },
  { label: "Interview", href: "/interview", icon: "Mic" },
  { label: "Resume", href: "/resume", icon: "FileText" },
  { label: "Companies", href: "/companies", icon: "Building2" },
  { label: "Planner", href: "/planner", icon: "CalendarDays" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Notes", href: "/notes", icon: "NotebookPen" },
  { label: "AI Chat", href: "/chatbot", icon: "MessageSquare" },
  { label: "Achievements", href: "/achievements", icon: "Trophy" },
  { label: "Resources", href: "/resources", icon: "Library" },
  { label: "Notifications", href: "/notifications", icon: "Bell" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Questions", href: "/admin/questions", icon: "HelpCircle" },
  { label: "Resources", href: "/admin/resources", icon: "Library" },
  { label: "Companies", href: "/admin/companies", icon: "Building2" },
  { label: "Notifications", href: "/admin/notifications", icon: "Bell" },
] as const;
