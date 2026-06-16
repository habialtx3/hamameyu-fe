import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/user/home";
import ReportPage from "../pages/user/reports";
import AdminDashboardPage from "../pages/admin/dashboard";
import AdminDashboardPageCoba from "../pages/admin/dashboard/indexCoba"; 
import ReportDetailPage from "../pages/user/report_detail";
import ReportSubmissionPage from "../pages/user/report_submission";
import LoginPage from "../pages/user/login";
import RegisterPage from "../pages/user/register";
import UserDashboardPage from "../pages/user/dashboard";
import MapReportPage from "../pages/user/map_report";
import FAQPage from "../pages/user/faq";
import AdminReportsPage from "../pages/admin/reports";
import AdminRedzonePage from "../pages/admin/map_redzone";
import ProtectedRoute from "./protectedRoute";
import UserReportsPage from "../pages/user/reports";
import AdminUserManagement from "../pages/admin/user_management";

// Import komponen proteksi yang baru kita buat

const router = createBrowserRouter([
  // ==========================================
  // 1. RUTE PUBLIK (Bisa diakses tanpa login)
  // ==========================================
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/FAQ",
    element: <FAQPage />,
  },

  // ==========================================
  // 2. RUTE KHUSUS RESIDENT (Wajib Login & Role: resident)
  // ==========================================
  {
    element: <ProtectedRoute allowedRoles={["resident"]} />,
    children: [
      {
        path: "/dashboard",
        element: <UserDashboardPage />,
      },
      {
        path: "/reports",
        element: <UserReportsPage/>,
      },
      {
        path: "/reports/:id",
        element: <ReportDetailPage />,
      },
      {
        path: "/reports/add",
        element: <ReportSubmissionPage />,
      },
      {
        path: "/map-report",
        element: <MapReportPage />,
      },
    ],
  },

  // ==========================================
  // 3. RUTE KHUSUS ADMIN (Wajib Login & Role: admin)
  // ==========================================
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin/dashboard",
        element: <AdminDashboardPageCoba />,
      },
      {
        path: "/admin/dashboard/asli",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin/reports",
        element: <AdminReportsPage />,
      },
      {
        path: "/admin/map-redzone",
        element: <AdminRedzonePage />,
      },
      {
        path: "/admin/user-management",
        element: <AdminUserManagement />,
      },
    ],
  },
]);

export default router;