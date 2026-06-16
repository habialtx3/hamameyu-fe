import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // Supaya cookie token ikut terkirim
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // data.user berisi { id, email, role } dari JWT backend
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Tampilkan loading screen sementara ngecek cookie ke backend
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  // Jika tidak login / token hangus, tendang ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai, tendang ke dashboard masing-masing yang sesuai haknya
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "resident" ? "/dashboard" : "/admin/dashboard"} replace />;
  }

  // Jika aman, render rute anak di dalamnya
  return <Outlet />;
}