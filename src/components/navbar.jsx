import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ variant = "public" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Handler fungsi untuk Logout
  const handleLogout = async () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin keluar?");
    if (!konfirmasi) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // PENTING: Wajib agar browser mengirimkan cookie 'token' untuk dihapus backend
        credentials: "include", 
      });

      if (response.ok) {
        setIsOpen(false);
        // Redirect ke halaman login setelah berhasil logout
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

  return (
    <nav className="w-full px-4 sm:px-6 lg:px-12 py-4 relative z-50">
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-black"
          >
            Enviro<span className="text-black">Report</span>
          </Link>

          {/* DESKTOP/TABLET MENU */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">

            {/* PUBLIC MENU */}
            {variant === "public" && (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-green-600 transition"
                >
                  Dashboard
                </Link>

                <Link
                  to="/reports/add"
                  state={{ from: "/" }}
                  className="hover:text-green-600 transition"
                >
                  Report an Issue
                </Link>

                {/* REGISTER BUTTON */}
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition bg-[#51a750] text-white hover:bg-green-700"
                >
                  Register Now <span>→</span>
                </Link>
              </>
            )}

            {/* DASHBOARD MENU */}
            {variant === "dashboard" && (
              <>
                <Link
                  to="/"
                  className="hover:text-green-600 transition"
                >
                  Home
                </Link>

                <Link
                  to="/dashboard"
                  className="hover:text-green-600 transition"
                >
                  Dashboard
                </Link>

                <Link
                  to="/reports"
                  className="hover:text-green-600 transition"
                >
                  Reports
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}
          <button className="text-gray-700 hover:text-green-600 transition flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </button>

          {/* BARU: TOMBOL LOGOUT MERAH (DESKTOP) - Berada di Ujung Kanan */}
          {variant === "dashboard" && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden md:block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition shadow-sm disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          )}

          {/* HAMBURGER */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1"
          >
            <span
              className={`w-6 h-0.5 bg-black transition duration-300 ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>

            <span
              className={`w-6 h-0.5 bg-black transition duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            ></span>

            <span
              className={`w-6 h-0.5 bg-black transition duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-5 flex flex-col gap-4">

          {/* PUBLIC MOBILE */}
          {variant === "public" && (
            <>
              <Link
                to="/FAQ"
                className="text-gray-700 hover:text-green-600 transition"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>

              <Link
                to="/reports/add"
                className="text-gray-700 hover:text-green-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Report an Issue
              </Link>

              <Link
                to="/register"
                className="bg-[#51a750] text-white text-center py-3 rounded-full hover:bg-green-700 transition"
                onClick={() => setIsOpen(false)}
              >
                Register Now
              </Link>
            </>
          )}

          {/* DASHBOARD MOBILE */}
          {variant === "dashboard" && (
            <>
              <Link
                to="/"
                className="text-gray-700 hover:text-green-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-green-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/reports"
                className="text-gray-700 hover:text-green-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Reports
              </Link>

              {/* TOMBOL LOGOUT MOBILE - Solid Merah */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-full transition font-semibold shadow-sm disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}