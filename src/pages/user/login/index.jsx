import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  // 1. State untuk form input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State untuk handling loading dan error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 2. Fungsi Handler Login
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        // PENTING: credentials include wajib dicantumkan agar browser mau menerima
        // dan menyimpan cookie (set-cookie) dari domain backend yang berbeda port.
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal, silakan coba lagi.");
      }

      // 3. Validasi Role dan Redirect
      if (data.role === "resident") {
        // Jika resident, arahkan ke dashboard user
        navigate("/dashboard");
      } else if (data.role === "admin") {
        // Jika admin, arahkan ke dashboard admin sesuai rute yang kamu buat
        navigate("/admin/dashboard");
      } else {
        // Jika ada role lain yang tidak terdaftar
        setError("Akses ditolak. Role Anda tidak dikenali.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <nav className="p-6 md:px-8 flex items-center justify-between">
        <Link to={"/register"}>
          <button className="flex items-center text-gray-500 hover:text-black transition">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </Link>

        <div className="text-sm font-medium text-black">
          <Link to="/register" className="hover:underline">
            Create an account
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row">
        <div className="w-full flex items-center justify-center p-8 px-4 lg:p-12">
          <img
            src="/assets/illust/login.png"
            alt="Ilustrasi Transportasi Kota dalam Hati"
            className="lg:w-3/4 sm:w-1/3 h-auto object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="bg-white border border-gray-100 p-12 rounded-[2rem] shadow-sm w-full max-w-lg">
            <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-6"></div>

            <h2 className="text-3xl font-extrabold text-black text-center mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 hover:underline font-medium">
                Create one
              </Link>
            </p>

            {/* Menampilkan pesan error jika login gagal */}
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 text-center">
                {error}
              </div>
            )}

            {/* Pasang onSubmit handler di form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-600 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-600 mb-2 relative"
                >
                  Password
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 flex items-center gap-1 text-[11px] font-medium"
                  >
                    {/* SVG dinamis berganti sesuai status show/hide */}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      )}
                    </svg>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                {/* Mengubah warna ke tema hijau utama */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white rounded-full py-3 text-sm font-semibold mb-6 shadow-sm transition ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-grow h-[1px] bg-gray-200"></div>
              <span className="text-sm text-gray-400 font-medium">OR</span>
              <div className="flex-grow h-[1px] bg-gray-200"></div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full border border-gray-300 text-black rounded-full py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm"
              >
                Continue with Google
              </button>

              <button
                type="button"
                className="w-full border border-gray-300 text-black rounded-full py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm"
              >
                Continue with Apple
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}