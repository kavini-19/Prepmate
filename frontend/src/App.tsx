import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Main pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CodingPage from "@/pages/coding/CodingPage";
import AptitudePage from "@/pages/aptitude/AptitudePage";
import InterviewPage from "@/pages/interview/InterviewPage";
import ResumePage from "@/pages/resume/ResumePage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import CompanyDetailPage from "@/pages/companies/CompanyDetailPage";
import PlannerPage from "@/pages/planner/PlannerPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import NotesPage from "@/pages/notes/NotesPage";
import ChatbotPage from "@/pages/chatbot/ChatbotPage";
import AchievementsPage from "@/pages/achievements/AchievementsPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import ResourcesPage from "@/pages/resources/ResourcesPage";
import AdminPage from "@/pages/admin/AdminPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="prepmate-theme">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/aptitude" element={<AptitudePage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:slug" element={<CompanyDetailPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}
