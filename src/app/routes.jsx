// Layouts
import DashboardLayout from "@/shared/layouts/DashboardLayout";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";

// Pages — Auth
import LoginPage from "@/features/auth/pages/LoginPage";

// Pages — Dashboard
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// Pages — Users
import UsersPage from "@/features/users/pages/UsersPage";

// Pages — Classes
import ClassesPage from "@/features/classes/pages/ClassesPage";
import ClassDetailPage from "@/features/classes/pages/ClassDetailPage";

// Pages — Statistics
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";

// Pages — Leads
import LeadsPage from "@/features/leads/pages/LeadsPage";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";
import Teachers from "@/features/teachers/pages/TeacherPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";

const Routes = () => {
  return (
    <RoutesWrapper>
      {/* Guest only routes */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Users */}
          <Route path="/users" element={<UsersPage />} />

          {/* Teacher */}
          <Route path="/teachers" element={<Teachers />} />

          {/* Classes */}
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:classId" element={<ClassDetailPage />} />

          {/* Statistics */}
          <Route path="/statistics" element={<StatisticsPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentsPage />} />

          {/* Leads */}
          <Route path="/leads" element={<LeadsPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
