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
        // Jika backend melempar error (e.g., email sudah terdaftar)
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Jika berhasil, arahkan pengguna ke halaman login
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <nav className="p-6 md:px-8 flex items-center justify-between">
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

      <main className="flex-grow flex flex-col md:flex-row">
        <div className="w-full flex items-center justify-center p-8 px-4 lg:p-12">
          <img
            src="/assets/illust/register.png"
            alt="Ilustrasi Transportasi Kota dalam Hati"
            className="lg:w-3/4 sm:w-1/3 h-auto object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="bg-white border border-gray-100 p-12 rounded-[2rem] shadow-sm w-full max-w-lg">
            <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-6"></div>

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
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
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
                    className="text-gray-500 hover:text-green-600 flex items-center gap-1 text-[11px] font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5 16.5 9.52 16.5 12 14.48 16.5 12 16.5zm0-8c-1.93 0-3.5 1.57-3.5 3.5S10.07 15.5 12 15.5 15.5 13.93 15.5 12 13.93 8.5 12 8.5z" />
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Checkbox Persetujuan - DIPERTAHANKAN */}
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1 cursor-pointer"
                />
                <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer-select-none">
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
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {loading ? "Registering..." : "Sign Up"}
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