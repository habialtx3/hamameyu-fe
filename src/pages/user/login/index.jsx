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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          // PENTING: credentials include wajib dicantumkan agar browser mau menerima
          // dan menyimpan cookie (set-cookie) dari domain backend yang berbeda port.
          credentials: "include",
        },
      );

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
    // TAMBAHAN: overflow-hidden untuk menahan shape dekoratif agar tidak keluar layar
    <div className="min-h-screen bg-white text-gray-800 flex flex-col relative overflow-hidden">
      {/* SHAPE DEKORATIF LATAR BELAKANG */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] bg-green-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <nav className="p-6 md:px-8 flex items-center justify-between z-10">
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

      <main className="flex-grow flex flex-col md:flex-row z-10">
        {/* KOLOM KIRI (Ilustrasi + Teks Tambahan) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 px-4 lg:p-12 text-center">
          <img
            src="/assets/illust/login.png"
            alt="Ilustrasi Transportasi Kota dalam Hati"
            className="lg:w-3/4 sm:w-1/3 h-auto object-contain transform hover:scale-102 transition duration-300"
          />
          {/* TAMBAHAN TEKS: Agar area ilustrasi terasa lebih padat dan informatif */}
          <div className="mt-6 max-w-md hidden sm:block">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Layanan Digital Warga
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Mudah, cepat, dan transparan. Akses seluruh keperluan administrasi
              dan laporan lingkungan Anda dalam satu platform.
            </p>
          </div>
        </div>

        {/* KOLOM KANAN (Form) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
          {/* SHAPE KECIL DEKORATIF DI DEKAT FORM */}
          <div className="absolute right-10 top-10 w-12 h-12 bg-green-200/40 rounded-full blur-xl pointer-events-none hidden md:block"></div>

          <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-12 rounded-[2rem] shadow-md w-full max-w-lg z-10">
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200/60 mx-auto mb-6 flex items-center justify-center">
              {/* Tambah icon kunci bawaan gratis biar lingkaran abu-abunya tidak kosong */}
              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-black text-center mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-green-600 hover:underline font-medium"
              >
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition"
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition"
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
                      : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
                  }`}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            {/* GANTI BLOK PEMBATAS "OR" LAMA DENGAN INI */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100/80 shadow-sm animate-pulse">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944a11.954 11.954 0 007.834 3.056 10.03 10.03 0 01-1.3 5.4c-.958 1.733-2.453 3.195-4.444 4.195a1 1 0 01-.88 0C9.223 13.595 7.728 12.133 6.77 10.4a10.03 10.03 0 01-1.3-5.4zM10 8a1 1 0 011 1v3a1 1 0 11-2 0V9a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure Connection Verified
              </div>
              <p className="text-[11px] text-gray-400 max-w-[280px] leading-normal">
                Your credentials are encrypted safely. If you encounter any
                issues, please contact your local system administrator.
              </p>
            </div>

            {/* Bagian Google & Apple tetap di-comment sesuai kodemu */}
            {/* ... */}
          </div>
        </div>
      </main>
    </div>
  );
}
