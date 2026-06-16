import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Handler fungsi untuk Logout Admin
  const handleLogout = async () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin keluar dari panel Admin?");
    if (!konfirmasi) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // PENTING: Supaya cookie terhapus
      });

      if (response.ok) {
        navigate("/login");
      } else {
        alert("Gagal logout, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error saat logout:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fungsi helper untuk menentukan class Tailwind berdasarkan status aktif
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
      isActive
        ? "bg-[#eef9f0] text-[#51a750] font-semibold" // Style saat halaman aktif
        : "text-gray-600 hover:bg-[#f5faf6]"          // Style saat halaman tidak aktif
    }`;

  return (
    <>
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-[#e5f1e7] hidden lg:flex flex-col h-screen sticky top-0">
        <div className="px-8 pt-8 pb-6 border-b border-[#eef4ef]">
          <h1 className="text-2xl font-black text-[#51a750]">EnviroReport</h1>
          <p className="text-sm text-gray-500 mt-1">
            Smart Environmental Monitoring
          </p>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-3">
              Dashboard
            </p>

            <div className="space-y-2">
              <NavLink to="/admin/dashboard" className={linkStyle}>
                <span>📊</span>
                Overview
              </NavLink>

              <NavLink to="/admin/reports" className={linkStyle}>
                <span>📄</span>
                Semua Laporan
              </NavLink>

              <NavLink to="/admin/map-redzone" className={linkStyle}>
                <span>🗺</span>
                Peta Redzone
              </NavLink>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-3">
              Management
            </p>

            <NavLink to="/admin/user-management" className={linkStyle}>
              <span>👥</span> {/* Sedikit perbaikan emoji agar lebih cocok dengan User */}
              User Management
            </NavLink>
          </div>
        </nav>

        {/* BAGIAN TOMBOL LOGOUT (Red Button Style) */}
        <div className="p-4 border-t border-[#eef4ef]">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold text-center hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span>🚪</span>
            {isLoggingOut ? "Logging out..." : "Keluar / Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}