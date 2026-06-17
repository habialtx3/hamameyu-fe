import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// Import service dari api.js kamu 🌟
import { reportService } from "../../../services/api"; 
// Import komponen ViewImage yang sudah dibuat sebelumnya (sesuaikan path-nya)
import ViewImage from "../../../components/ViewImage";

// Data Opsi Kategori Bahasa Indonesia
const CATEGORY_OPTIONS = [
  { value: "WASTE", label: "Sampah", icon: "🗑️" },
  { value: "SIGNS_AND_MARKINGS", label: "Rambu & Markah Jalan", icon: "🚧" },
  { value: "PUBLIC_FACILITIES", label: "Fasilitas Publik", icon: "🏢" },
  { value: "ROAD_AND_SIDEWALK", label: "Jalan & Trotoar Rusak", icon: "🛣️" },
  { value: "TREES_AND_GREEN_SPACE", label: "Pohon & Ruang Hijau", icon: "🌳" },
];

export default function AdminReportDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  // State untuk kontrol pop-up gambar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");

  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  // FETCH DETAIL MENGGUNAKAN SERVICE AGAR URL-NYA SAMA PERSIS DENGAN BRUNO
  const fetchReportDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports/${id}`);
      const responseJson = await response.json();
      
      if (responseJson.success) {
        setReport(responseJson.data);
        setSelectedStatus(responseJson.data.status);
      }
    } catch (error) {
      console.error("Gagal memuat detail laporan admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI HANDLER UPDATE STATUS YANG SUDAH DISINKRONKAN DENGAN API.JS 🌟
  const handleStatusUpdate = async () => {
    const confirmation = window.confirm(
      `Apakah Anda yakin ingin mengubah status laporan ini menjadi ${selectedStatus.toUpperCase()}?`
    );
    if (!confirmation) return;

    setIsUpdating(true);
    try {
      const result = await reportService.updateStatus(id, selectedStatus);

      if (result && result.success) {
        alert("Status laporan berhasil diperbarui!");
        fetchReportDetail(); // Refresh timeline otomatis
      } else {
        alert(result.message || "Gagal memperbarui status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper Kategori
  const getCategoryData = (backendValue) => {
    if (!backendValue) return { label: "-", icon: "" };
    const found = CATEGORY_OPTIONS.find(
      (opt) => opt.value === backendValue.toUpperCase()
    );
    return found ? found : { label: backendValue, icon: "📄" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center">
        <p className="text-[#51a750] font-medium animate-pulse">
          Memuat data laporan panel admin...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center">
        <p className="text-red-500 font-medium">Laporan admin tidak ditemukan.</p>
      </div>
    );
  }

  let statusText = "Menunggu Ditinjau (Pending)";
  if (report.status === "processing") statusText = "Sedang Ditangani (Processing)";
  if (report.status === "done") statusText = "Selesai Ditangani (Done)";

  const backPath = location.state?.from || "/admin/reports";
  const currentCategory = getCategoryData(report.category);

  return (
    <div className="min-h-screen flex flex-col bg-[#f6faf7] text-gray-800">
      {/* HEADER */}
      <header className="border-b border-[#e5f1e7] bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center text-gray-600 hover:text-black transition font-medium text-sm sm:text-base"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Semua Laporan
        </button>
        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
          Admin Control Mode
        </span>
      </header>

      {/* CONTENT */}
      <div className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 lg:divide-x lg:divide-[#edf3ee]">
          
          {/* LEFT COLUMN */}
          <div className="lg:pr-12 flex flex-col">
            <div className="bg-[#eef9f0] border border-[#e5f1e7] rounded-full py-3 px-8 mb-8 mx-auto w-full max-w-sm text-center">
              <h2 className="text-xl font-black text-[#51a750]">
                Detail Informasi Publik
              </h2>
            </div>

            <div className="space-y-4 mb-8 text-base bg-white border border-[#edf3ee] p-6 rounded-3xl shadow-sm">
              <p><span className="text-gray-400 font-medium block text-xs uppercase tracking-wider">User Pelapor</span> 
                <span className="text-black font-bold">User ID: {report.user_id}</span>
              </p>
              <p><span className="text-gray-400 font-medium block text-xs uppercase tracking-wider">Nomor Laporan</span> 
                <span className="text-black font-mono font-bold">#{report.id}</span>
              </p>
              
              <p><span className="text-gray-400 font-medium block text-xs uppercase tracking-wider">Kategori Lingkungan</span> 
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#eef9f0] text-[#51a750] text-sm font-bold border border-[#e5f1e7] mt-1">
                  <span>{currentCategory.icon}</span>
                  {currentCategory.label}
                </span>
              </p>

              <p><span className="text-gray-400 font-medium block text-xs uppercase tracking-wider">Waktu Masuk Laporan</span> 
                <span className="text-gray-700 text-sm">
                  {new Date(report.time_report).toLocaleString("id-ID", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })} WIB
                </span>
              </p>
              <p><span className="text-gray-400 font-medium block text-xs uppercase tracking-wider">Titik Koordinat</span> 
                <span className="text-gray-700 font-mono text-sm">Lat {report.location.latitude}, Lng {report.location.longitude}</span>
              </p>
            </div>

            <div className="relative bg-white border border-[#edf3ee] rounded-2xl p-6 mb-8 shadow-sm">
              <span className="absolute -top-3 left-6 bg-[#f6faf7] px-2 text-xs font-bold text-gray-400">
                Isi Pengaduan Warga
              </span>
              <h3 className="font-extrabold text-black mb-2 text-base">
                {report.title}
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Bagian Foto Bukti Lampiran */}
            <div>
              <h3 className="text-black mb-4 font-bold text-sm uppercase tracking-wide text-gray-500">
                Foto Bukti Lampiran ({report.images?.length || 0})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {report.images && report.images.length > 0 ? (
                  report.images.map((imgUrl, idx) => {
                    const fullSrc = `https://hamameyu.infinitelearningstudent.id${imgUrl}`;
                    return (
                      <img
                        key={idx}
                        src={fullSrc}
                        alt={`Bukti Keluhan ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-3xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition duration-200"
                        onClick={() => {
                          setSelectedImg(fullSrc);
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-2 py-8 bg-white border border-dashed border-gray-300 text-center text-gray-400 rounded-3xl text-sm">
                    Tidak ada lampiran foto.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:pl-12 flex flex-col">
            <div className="bg-gray-800 rounded-full py-3 px-8 mb-8 mx-auto w-full max-w-sm text-center shadow-md">
              <h2 className="text-xl font-black text-white">
                Admin Action & Status
              </h2>
            </div>

            {/* MANAJEMEN STATUS KONTROL */}
            <div className="bg-white border border-[#edf3ee] rounded-[2rem] p-6 mb-6 shadow-sm">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Ubah Status Progres Lapangan
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 bg-[#f6faf7] border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#51a750]/20 text-gray-700"
                >
                  <option value="pending">⏳ Pending (Menunggu Ditinjau)</option>
                  <option value="processing">⚙️ Processing (Sedang Ditangani)</option>
                  <option value="done">✅ Done (Selesai Diperbaiki)</option>
                </select>
                
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || selectedStatus === report.status}
                  className="px-6 py-3 bg-[#51a750] text-white font-bold text-sm rounded-2xl hover:bg-[#439242] transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
                >
                  {isUpdating ? "Menyimpan..." : "Update Status"}
                </button>
              </div>
              {selectedStatus === report.status && (
                <p className="text-[11px] text-gray-400 mt-2 ml-1">
                  *Pilih opsi status yang berbeda untuk mengaktifkan tombol perbaruan.
                </p>
              )}
            </div>

            {/* Timeline Stepper Box */}
            <div className="bg-white border border-[#edf3ee] rounded-[2rem] p-8 md:p-10 flex-1 shadow-sm">
              <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-100">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Status Saat Ini</p>
                <p className="text-black text-base font-extrabold mt-1 text-[#51a750] bg-[#eef9f0] px-4 py-1.5 rounded-full border border-[#e5f1e7]">
                  {statusText}
                </p>
              </div>

              <div className="relative border-l border-gray-200 ml-5 space-y-10">
                {/* Step 1 */}
                <div className="relative pl-10">
                  <div className="absolute -left-[18px] top-0 w-9 h-9 bg-[#51a750] rounded-full flex items-center justify-center ring-8 ring-white">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-black text-[15px]">Laporan Diterima</h4>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    Masuk ke database admin. ID Keluhan: #{report.id}.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-10">
                  <div className={`absolute -left-[1px] -top-10 w-[1px] h-10 ${report.status !== "pending" ? "bg-[#51a750]" : "bg-gray-200"}`}></div>
                  <div className={`absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center ring-8 ring-white ${
                    report.status !== "pending" ? "bg-[#51a750]" : "bg-gray-200 text-gray-400"
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className={`font-bold text-[15px] ${report.status !== "pending" ? "text-black" : "text-gray-400"}`}>
                    Validasi & Penanganan Lapangan
                  </h4>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    {report.status !== "pending"
                      ? "Laporan telah divalidasi oleh RT/RW setempat dan saat ini berada dalam proses aksi pengerjaan fisik."
                      : "Menunggu verifikasi admin untuk diturunkan regu penanganan."}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative pl-10">
                  <div className={`absolute -left-[1px] -top-10 w-[1px] h-10 ${report.status === "done" ? "bg-[#51a750]" : "bg-gray-200"}`}></div>
                  <div className={`absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center ring-8 ring-white ${
                    report.status === "done" ? "bg-[#51a750]" : "bg-gray-200 text-gray-400"
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className={`font-bold text-[15px] ${report.status === "done" ? "text-black" : "text-gray-400"}`}>
                    Masalah Selesai Ditangani
                  </h4>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    {report.status === "done"
                      ? `Telah diselesaikan oleh admin resmi pada ${report.time_close ? new Date(report.time_close).toLocaleDateString("id-ID") : "hari ini"}.`
                      : "Arsip keluhan akan ditutup permanen setelah proses perbaikan selesai."}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL POP-UP VIEW IMAGE */}
      <ViewImage
        isOpen={isModalOpen}
        src={selectedImg}
        alt="Detail Bukti Lampiran Admin"
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}