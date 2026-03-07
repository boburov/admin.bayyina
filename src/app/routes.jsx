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

// Pages — Subjects
import SubjectsPage from "@/features/subjects/pages/SubjectsPage";
import TopicsPage from "@/features/subjects/pages/TopicsPage";
import SubjectTopicsPage from "@/features/subjects/pages/SubjectTopicsPage";

// Pages — Grades
import GradesPage from "@/features/grades/pages/GradesPage";
import MissingGradesPage from "@/features/grades/pages/MissingGradesPage";

// Pages — Schedules
import SchedulesPage from "@/features/schedules/pages/SchedulesPage";

// Pages — Messages
import MessagesPage from "@/features/messages/pages/MessagesPage";

// Pages — Statistics
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";

// Pages — Holidays
import HolidaysPage from "@/features/holidays/pages/HolidaysPage";

// Pages — Coin Settings
import CoinSettingsPage from "@/features/coin-settings/pages/CoinSettingsPage";

// Pages — Market
import MarketOrdersPage from "@/features/market/pages/MarketOrdersPage";
import MarketProductsPage from "@/features/market/pages/MarketProductsPage";
import MarketProductEditPage from "@/features/market/pages/MarketProductEditPage";
import MarketProductCreatePage from "@/features/market/pages/MarketProductCreatePage";

// Pages — Penalties
import PenaltiesPage from "@/features/penalties/pages/PenaltiesPage";
import PenaltyDetailPage from "@/features/penalties/pages/PenaltyDetailPage";
import PenaltyCategoriesPage from "@/features/penalties/pages/PenaltyCategoriesPage";
import PenaltySettingsPage from "@/features/penalties/pages/PenaltySettingsPage";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

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

          {/* Classes */}
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:classId" element={<ClassDetailPage />} />

          {/* Subjects & Topics */}
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/subjects/:subjectId/topics" element={<SubjectTopicsPage />} />

          {/* Grades */}
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/grades/missing" element={<MissingGradesPage />} />

          {/* Schedules */}
          <Route path="/schedules" element={<SchedulesPage />} />

          {/* Messages */}
          <Route path="/messages" element={<MessagesPage />} />

          {/* Statistics */}
          <Route path="/statistics" element={<StatisticsPage />} />

          {/* Holidays */}
          <Route path="/holidays" element={<HolidaysPage />} />

          {/* Coin Settings */}
          <Route path="/coin-settings" element={<CoinSettingsPage />} />

          {/* Market */}
          <Route path="/market/products" element={<MarketProductsPage />} />
          <Route path="/market/products/new" element={<MarketProductCreatePage />} />
          <Route path="/market/products/:productId/edit" element={<MarketProductEditPage />} />
          <Route path="/market/orders" element={<MarketOrdersPage />} />

          {/* Penalties */}
          <Route path="/penalties" element={<PenaltiesPage />} />
          <Route path="/penalties/:penaltyId" element={<PenaltyDetailPage />} />
          <Route path="/penalties/categories" element={<PenaltyCategoriesPage />} />
          <Route path="/penalties/settings" element={<PenaltySettingsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
