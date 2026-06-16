import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  // State untuk menangkap input form
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  // State tambahan untuk UI & UX
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handler mengubah nilai input
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handler Submit Form ke Backend (Menggunakan Fetch API)
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi sederhana sebelum menembak API
    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Use and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // TAMBAHAN: overflow-hidden untuk menahan shape dekoratif agar tidak keluar layar
    <div className="min-h-screen bg-white text-gray-800 flex flex-col relative overflow-hidden">
      
      {/* SHAPE DEKORATIF LATAR BELAKANG (Serasi dengan halaman login) */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] bg-green-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <nav className="p-6 md:px-8 flex items-center justify-between z-10">
        <Link to={"/"}>
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
          <span className="text-gray-400">Creating an account</span>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row z-10">
        {/* KOLOM KIRI (Ilustrasi + Teks Tambahan agar lebih ramai) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 px-4 lg:p-12 text-center">
          <img
            src="/assets/illust/register.png"
            alt="Ilustrasi Transportasi Kota dalam Hati"
            className="lg:w-3/4 sm:w-1/3 h-auto object-contain transform hover:scale-102 transition duration-300"
          />
          {/* TAMBAHAN TEKS: Menyeimbangkan ruang kosong di bawah gambar */}
          <div className="mt-6 max-w-md hidden sm:block">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bergabung dengan Envireport</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Langkah awal menuju efisiensi komunitas. Daftarkan diri Anda untuk menikmati kemudahan pelaporan, info warga, dan layanan administrasi terpadu.
            </p>
          </div>
        </div>

        {/* KOLOM KANAN (Form Register) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
          {/* SHAPE KECIL DEKORATIF DI DEKAT FORM */}
          <div className="absolute right-10 top-10 w-12 h-12 bg-green-200/40 rounded-full blur-xl pointer-events-none hidden md:block"></div>

          <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-12 rounded-[2rem] shadow-md w-full max-w-lg z-10">
            {/* Mengisi lingkaran abu-abu kosong dengan ikon User Plus modern */}
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200/60 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-black text-center mb-1">
              Create Account
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Already have an account?{" "}
              <Link to={"/login"}>
                <span className="text-green-600 hover:underline font-medium">Login</span>
              </Link>
            </p>

            {/* Alert Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Input Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition"
                />
              </div>

              {/* Input Username */}
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-gray-600 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe123"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition"
                />
              </div>

              {/* Input Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition"
                />
              </div>

              {/* Input Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-green-600 flex items-center gap-1 text-[11px] font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition"
                />
              </div>

              {/* Checkbox Persetujuan */}
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1 cursor-pointer"
                />
                <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer select-none">
                  By creating an account, I agree to our{" "}
                  <a href="#" className="text-green-600 hover:underline font-medium">Terms of use</a> and{" "}
                  <a href="#" className="text-green-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>

              {/* Tombol Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white rounded-full py-3 text-sm font-semibold mb-6 shadow-sm transition-all ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
                  }`}
                >
                  {loading ? "Registering..." : "Sign Up"}
                </button>
              </div>
            </form>

            {/* PENYESUAIAN AREA "OR": Diganti dengan info verifikasi privasi data yang menarik */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100/80 shadow-sm animate-pulse">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944a11.954 11.954 0 007.834 3.056 10.03 10.03 0 01-1.3 5.4c-.958 1.733-2.453 3.195-4.444 4.195a1 1 0 01-.88 0C9.223 13.595 7.728 12.133 6.77 10.4a10.03 10.03 0 01-1.3-5.4zM10 8a1 1 0 011 1v3a1 1 0 11-2 0V9a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                Privacy & Data Protected
              </div>
              <p className="text-[11px] text-gray-400 max-w-[280px] leading-normal">
                Your data is safe with us. We use industry-standard security to ensure your personal information remains strictly confidential.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}