import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/navbar";

export default function Home() {
  // State untuk melacak status login asli dari backend
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Menembak endpoint auth/me bawaan sistem kamu dengan credentials include
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // Wajib agar cookie token ikut terkirim ke backend
        });

        if (response.ok) {
          const data = await response.json();
          // Jika data user ditemukan, berarti user valid sedang login
          if (data.user || data.id) {
            setIsLoggedIn(true);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Gagal mengecek status login di Home:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <>
      <div className="bg-gradient-to-b from-[#e3fae8] to-[#edfcf0] min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Navbar akan memakai variant dashboard jika isLoggedIn true */}
        {/* Kita beri fallback "public" selagi loading auth berjalan */}
        <Navbar variant={!isLoadingAuth && isLoggedIn ? "dashboard" : "public"} />

        <main className="flex-grow flex flex-col items-center justify-start text-center pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[90vh]">
          
          {/* Background Image */}
          <div
            className="
              absolute 
              left-1/2 
              -translate-x-1/2 
              z-0 
              opacity-90
              top-[70%] 
              w-[190%]
              sm:top-[55%] 
              sm:w-[150%]
              md:top-[50%] 
              md:w-[120%]
              lg:top-50 
              lg:w-full
              max-w-full
            "
          >
            <img
              src="/assets/illust/hero1.png"
              alt="Hero Illustration"
              className="w-full h-auto"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 lg:mt-5 mb-10">
            
            <span className="text-xs font-bold tracking-widest text-gray-600 uppercase mb-4">
              Lapor Lebih Mudah, Kota Lebih Bersih.
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight mb-4">
              Dari Kepedulian Warga,{" "}
              <br className="hidden md:block" />
              Untuk Kenyamanan Bersama.
            </h1>

            <p className="text-gray-700 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Karena lingkungan kita butuh lebih dari sekadar komplain - butuh
              aksi nyata dan transparansi penanganan.
              <br className="hidden md:block" />
              Yuk, bantu jaga kota kita jadi tempat yang lebih baik buat
              ditinggali.
            </p>

            {/* Tombol CTA ikut dinamis mengikuti status login */}
            {!isLoadingAuth && isLoggedIn ? (
              <Link to="/reports/add">
                <button className="w-full sm:w-auto bg-[#51a750] text-white font-semibold px-8 py-3 rounded-full hover:bg-green-700 transition shadow-lg hover:shadow-xl lg:mb-40">
                  Mulai Buat Laporan
                </button>
              </Link>
            ) : (
              <Link to="/register">
                <button className="w-full sm:w-auto bg-[#51a750] text-white font-semibold px-8 py-3 rounded-full hover:bg-green-700 transition shadow-lg hover:shadow-xl lg:mb-40">
                  Bergabung & Lapor Sekarang
                </button>
              </Link>
            )}
          </div>
        </main>
      </div>

      {/* SECTION FITUR */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 block">
            Fitur Utama
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-4">
            Semua Alat Buat Jaga Batam, Ada di Sini
          </h2>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Dari sekadar lapor genangan air sampai mantau tumpukan sampah,
            <br className="hidden md:block" />
            fitur kita didesain biar kamu bisa ikut kontribusi tanpa ribet.
            <br className="hidden md:block" />
            Lapor gampang, pantau transparan.
          </p>
        </div>

        {/* GRID FITUR */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fitur 1 */}
          <div className="border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition bg-white flex flex-col items-center text-center">
            <img src="/assets/illust/fitur01.png" alt="Lapor" className="w-full h-40 sm:h-48 object-contain mb-6" />
            <h3 className="text-lg font-bold text-black mb-2 self-start">Lapor Semudah Update Status</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              Tinggal jepret (foto bukti), tandai lokasi pasti di peta, dan kasih cerita singkat.
            </p>
          </div>

          {/* Fitur 2 */}
          <div className="border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition bg-white flex flex-col items-center text-center">
            <img src="/assets/illust/fitur02.png" alt="AI" className="w-full h-40 sm:h-48 object-contain mb-6" />
            <h3 className="text-lg font-bold text-black mb-2 self-start">Validasi AI Pintar</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              AI kita otomatis mendeteksi keaslian foto dan mengecek laporan duplikat secara presisi.
            </p>
          </div>

          {/* Fitur 3 */}
          <div className="border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition bg-white flex flex-col items-center text-center">
            <img src="/assets/illust/fitur03.png" alt="Heatmap" className="w-full h-40 sm:h-48 object-contain mb-6" />
            <h3 className="text-lg font-bold text-black mb-2 self-start">Peta Pantauan Area (Heatmap)</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              Lihat area mana saja yang lagi masuk status waspada (Redzone) lewat peta interaktif.
            </p>
          </div>

          {/* Fitur 4 */}
          <div className="border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition bg-white flex flex-col items-center text-center">
            <img src="/assets/illust/fitur04.png" alt="Progres" className="w-full h-40 sm:h-48 object-contain mb-6" />
            <h3 className="text-lg font-bold text-black mb-2 self-start">Lacak Progres Laporan</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              Pantau terus status laporanmu dari mulai ditangani petugas sampai tuntas dieksekusi.
            </p>
          </div>

          {/* Fitur 5 */}
          <div className="border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition bg-white flex flex-col items-center text-center">
            <img src="/assets/illust/fitur05.png" alt="Forum" className="w-full h-40 sm:h-48 object-contain mb-6" />
            <h3 className="text-lg font-bold text-black mb-2 self-start">Forum &amp; Dukungan Warga</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              Dukung laporan warga lain yang mengalami masalah serupa langsung di kolom komentar.
            </p>
          </div>

          {/* Fitur 6 */}
          <div className="border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition bg-white flex flex-col items-center text-center">
            <img src="/assets/illust/fitur06.png" alt="Aksi" className="w-full h-40 sm:h-48 object-contain mb-6" />
            <h3 className="text-lg font-bold text-black mb-2 self-start">Terhubung ke Aksi Nyata</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-left">
              Sistem kita menjembatani laporanmu langsung ke meja instansi terkait untuk dieksekusi.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}