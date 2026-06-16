// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

export default function ReportDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Ambil ID laporan dari parameter URL router (misal: /reports/1)
  const { id } = useParams();
  
  // 2. Siapkan state untuk menampung objek data laporan tunggal
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Efek untuk fetch data detail dari backend saat halaman dibuka
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/reports/${id}`)
      .then((res) => res.json())
      .then((responseJson) => {
        if (responseJson.success) {
          setReport(responseJson.data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Gagal memuat detail laporan:', error);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Memuat detail keluhan...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-red-500 font-medium">Laporan tidak ditemukan.</p>
      </div>
    );
  }

  // Pengkondisian teks ilustrasi berdasarkan status backend ('pending', 'processing', 'done')
  let statusText = "Laporan Menunggu Ditinjau";
  if (report.status === 'processing') statusText = "Laporan Sedang Ditangani";
  if (report.status === 'done') statusText = "Laporan Selesai Ditangani";


  const backPath = location.state?.from || "/dashboard";
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-800">

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex items-center text-gray-600 shrink-0">
        
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center hover:text-black transition font-medium text-sm sm:text-base"
        >
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

      </header>

      {/* CONTENT */}
      <div className="flex-1 p-4 md:p-8 lg:p-12">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 lg:divide-x lg:divide-gray-300">
        
        {/* L E F T   C O L U M N   (Detailed Information) */}
        <div className="lg:pr-12 flex flex-col">
          
          <div className="bg-gray-100 rounded-full py-3 px-8 mb-8 mx-auto w-full max-w-sm text-center">
            <h2 className="text-2xl font-extrabold text-black">
              Detailed Information
            </h2>
          </div>

          <div className="space-y-4 mb-8 text-base">
            <p>
              {/* Karena user_id di-mock, kita hardcode nama atau panggil dari objek user jika ada */}
              <span className="text-black font-semibold">Nama pelapor:</span> Warga (User ID: {report.user_id})
            </p>

            <p>
              <span className="text-black font-semibold">Nomor Laporan:</span> #{report.id}
            </p>

            <p>
              <span className="text-black font-semibold">Kategori:</span> <span className="capitalize">{report.category}</span>
            </p>

            <p>
              <span className="text-black font-semibold">Tanggal Laporan:</span> {
                new Date(report.time_report).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              } WIB
            </p>

            <p>
              <span className="text-black font-semibold">Koordinat Lokasi:</span> Lat {report.location.latitude}, Lng {report.location.longitude}
            </p>
          </div>

          {/* Detail Keluhan Box */}
          <div className="relative bg-gray-50/50 border border-gray-300 rounded-2xl p-6 mb-8 mt-2">
            <span className="absolute -top-3 left-6 bg-white px-2 text-xs text-gray-400">
              Detail Keluhan
            </span>
            <h3 className="font-bold text-black mb-1 text-base">{report.title}</h3>
            <p className="text-black text-sm md:text-base leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Foto Bukti */}
          <div>
            <h3 className="text-black mb-4 font-semibold">Foto Bukti ({report.images?.length || 0})</h3>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Render Gambar Dinamis dari Backend */}
              {report.images && report.images.length > 0 ? (
                report.images.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={`${import.meta.env.VITE_API_URL}${imgUrl}`}
                    alt={`Bukti Keluhan ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-3xl border border-gray-200"
                  />
                ))
              ) : (
                /* Placeholder jika tidak ada foto sama sekali */
                <div className="col-span-2 py-8 bg-[#f0f2f5] text-center text-gray-400 rounded-3xl text-sm">
                  Tidak ada lampiran foto untuk laporan ini.
                </div>
              )}

            </div>
          </div>
        </div>

        {/* R I G H T   C O L U M N   (Timeline Progress) */}
        <div className="lg:pl-12 flex flex-col">
          
          <div className="bg-gray-100 rounded-full py-3 px-8 mb-8 mx-auto w-full max-w-sm text-center">
            <h2 className="text-2xl font-extrabold text-black">
              Timeline Progress
            </h2>
          </div>

          <div className="bg-[#f4f5f6] border border-gray-200 rounded-[2rem] p-8 md:p-10 flex-1">
            
            {/* Illustration Area */}
            <div className="flex flex-col items-center mb-10">
              <img
                src="/assets/illust/on_progress.png"
                alt="Ilustrasi Progress"
                className="w-full max-w-sm object-contain mb-4 rounded-xl"
              />
              <p className="text-gray-700 text-sm font-semibold tracking-wide capitalize">
                Status: {statusText}
              </p>
            </div>

            {/* Timeline Stepper Dinamis berbasis Status */}
            <div className="relative border-l border-gray-300 ml-5 space-y-10">

              {/* Step 1: Laporan Diterima (Selalu Terlewati jika data ada) */}
              <div className="relative pl-10">
                <div className="absolute -left-[18px] top-0 w-9 h-9 bg-[#4ca64c] rounded-full flex items-center justify-center ring-8 ring-[#f4f5f6]">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-black text-[15px]">Laporan Diterima</h4>
                <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
                  Sistem telah menerima laporanmu. Keluhan berhasil diarsip ke dalam database dengan ID #{report.id}.
                </p>
              </div>

              {/* Step 2: Validasi Admin / Sedang Diproses (Aktif jika status 'processing' atau 'done') */}
              <div className="relative pl-10">
                {/* Garis penghubung hijau jika langkah ini aktif atau selesai */}
                <div className={`absolute -left-[1px] -top-10 w-[1px] h-10 ${report.status !== 'pending' ? 'bg-[#4ca64c]' : 'bg-gray-300'}`}></div>
                
                <div className={`absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center ring-8 ring-[#f4f5f6] ${
                  report.status !== 'pending' ? 'bg-[#4ca64c]' : 'bg-gray-300 text-gray-400'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className={`font-bold text-[15px] ${report.status !== 'pending' ? 'text-black' : 'text-gray-400'}`}>
                  Validasi & Verifikasi Admin
                </h4>
                <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
                  {report.status !== 'pending' 
                    ? 'Laporanmu sudah ditinjau oleh petugas RT/RW dan saat ini sedang masuk tahap penanganan lapangan.' 
                    : 'Menunggu antrean verifikasi dari petugas admin setempat.'}
                </p>
              </div>

              {/* Step 3: Selesai Ditangani (Hanya aktif jika status bernilai 'done') */}
              <div className="relative pl-10">
                <div className={`absolute -left-[1px] -top-10 w-[1px] h-10 ${report.status === 'done' ? 'bg-[#4ca64c]' : 'bg-gray-300'}`}></div>
                
                <div className={`absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center ring-8 ring-[#f4f5f6] ${
                  report.status === 'done' ? 'bg-[#4ca64c]' : 'bg-gray-300 text-gray-400'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className={`font-bold text-[15px] ${report.status === 'done' ? 'text-black' : 'text-gray-400'}`}>
                  Masalah Selesai Ditangani
                </h4>
                <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
                  {report.status === 'done' 
                    ? `Keluhan telah selesai diperbaiki pada ${report.time_close ? new Date(report.time_close).toLocaleDateString('id-ID') : 'hari ini'}. Terima kasih atas laporan Anda!` 
                    : 'Tahap penyelesaian akhir setelah penanganan fisik selesai dilakukan.'}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}