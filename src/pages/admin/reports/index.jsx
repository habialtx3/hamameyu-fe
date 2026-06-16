import { useEffect, useState, useMemo } from "react";
import { reportService } from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/sidebar";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Filter Pencarian & Dropdown Status
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  // Konfigurasi 5 data per halaman
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const navigate = useNavigate();

  // Ambil data dari API saat komponen pertama kali dibuka
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();
      if (response && response.success) {
        setReports(response.data || []);
      } else {
        throw new Error(response.message || "Gagal memuat data laporan");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Reset ke halaman 1 setiap kali user mengetik pencarian atau mengubah filter status
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // --- 1. KALKULASI SUMMARY ---
  const totalReports = reports.length;
  const processedReports = reports.filter(
    (r) => r.status?.toLowerCase() === "processing",
  ).length;
  const resolvedReports = reports.filter(
    (r) => r.status?.toLowerCase() === "done",
  ).length;

  // --- 2. PEMETAAN KATEGORI KE BAHASA INDONESIA ---
  const getCategoryLabel = (category) => {
    if (!category) return "-";
    switch (category.toUpperCase()) {
      case "WASTE":
        return "Pengelolaan Sampah";
      case "SIGNS_AND_MARKINGS":
        return "Rambu & Markah Jalan";
      case "PUBLIC_FACILITIES":
        return "Fasilitas Publik";
      case "ROAD_AND_SIDEWALK":
        return "Jalan & Trotoar Rusak";
      case "TREES_AND_GREEN_SPACE":
        return "Pohon & Ruang Terbuka Hijau";
      default:
        return category
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  };

  // --- 3. HELPER VISUAL STATUS ---
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Diterima";
      case "processing":
        return "Diproses";
      case "done":
        return "Selesai";
      default:
        return status || "Diterima";
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-gray-100 text-gray-600";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- 4. LOGIKA FILTER SEARCH BAR & DROPDOWN ---
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toString().includes(searchQuery);

      let matchesStatus = true;
      if (statusFilter !== "Semua Status") {
        const mappedStatus = getStatusLabel(item.status);
        matchesStatus = mappedStatus === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  // --- 5. LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentItems = useMemo(() => {
    return filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredReports, indexOfFirstItem, indexOfLastItem]);

  return (
    <div className="bg-[#f6faf7] min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* TOPBAR */}
        <header className="px-4 sm:px-6 lg:px-10 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">Semua Laporan</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola seluruh laporan warga Kota Batam.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <input
              type="text"
              placeholder="Cari laporan berdasarkan judul atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#51a750]/20 w-full"
            />

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full px-5 py-3 pr-12 text-sm focus:outline-none w-full"
              >
                <option>Semua Status</option>
                <option>Diterima</option>
                <option>Diproses</option>
                <option>Selesai</option>
              </select>
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-10 pb-10">
          {/* STATS KARTU RINGKASAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6">
              <p className="text-sm text-gray-500">Total Laporan</p>
              <h2 className="text-3xl font-black mt-2 text-black">{loading ? "..." : totalReports.toLocaleString("id-ID")}</h2>
            </div>
            <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6">
              <p className="text-sm text-gray-500">Sedang Diproses</p>
              <h2 className="text-3xl font-black mt-2 text-yellow-600">{loading ? "..." : processedReports.toLocaleString("id-ID")}</h2>
            </div>
            <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">Laporan Selesai</p>
              <h2 className="text-3xl font-black mt-2 text-green-600">{loading ? "..." : resolvedReports.toLocaleString("id-ID")}</h2>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-[30px] border border-[#edf3ee] p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-black">Data Laporan Warga</h2>
                <p className="text-sm text-gray-500 mt-1">Menampilkan laporan.</p>
              </div>
              <button className="bg-[#eef9f0] text-[#51a750] px-5 py-2.5 rounded-full text-sm font-semibold w-full sm:w-fit">+ Tambah Laporan</button>
            </div>

            {loading && <div className="text-center py-12 text-gray-500 text-sm animate-pulse">Menghubungkan ke server api...</div>}
            {error && <div className="text-center py-8 text-red-500 text-sm bg-red-50 rounded-2xl border border-red-100">⚠️ Koneksi Gagal: {error}</div>}
            {!loading && !error && filteredReports.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">Tidak ada laporan yang sesuai.</div>
            )}

            {/* TAMPILAN CARD MOBILE */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {currentItems.map((item, index) => (
                  <div key={item.id || index} className="border border-[#edf3ee] rounded-[24px] p-5 bg-[#fcfffc]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link 
                          to={`/admin/reports/${item.id}`}
                          state={{ from: "/admin/reports" }}
                          className="font-bold text-black text-sm line-clamp-1 hover:text-[#51a750] transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">ID Laporan: {item.id}</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${getStatusStyle(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Koordinat Lokasi</span>
                        <span className="font-medium text-gray-700 text-right text-xs">
                          {item.location ? `${parseFloat(item.location.latitude).toFixed(4)}, ${parseFloat(item.location.longitude).toFixed(4)}` : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Kategori</span>
                        <span className="bg-[#eef9f0] text-[#51a750] text-xs px-3 py-1 rounded-full font-medium">{getCategoryLabel(item.category)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Tanggal Masuk</span>
                        <span className="font-medium text-gray-700 text-right">{formatDate(item.time_report)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5 w-full">
                      <button onClick={() => navigate(`/admin/reports/${item.id}`, { state: { from: "/admin/reports" } })} className="flex-1 text-center px-4 py-3 rounded-full text-sm bg-[#eef9f0] text-[#51a750] font-semibold">Detail</button>
                      <button className="flex-1 px-4 py-3 rounded-full text-sm bg-[#f5f5f5] text-gray-600 font-semibold">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAMPILAN TABLE DESKTOP */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="text-center text-sm text-gray-400 border-b border-gray-100">
                      <th className="pb-4 font-medium">No</th>
                      <th className="pb-4 font-medium">Laporan</th>
                      <th className="pb-4 font-medium">Lokasi (Lat, Long)</th>
                      <th className="pb-4 font-medium">Kategori</th>
                      <th className="pb-4 font-medium">Pelapor</th>
                      <th className="pb-4 font-medium">Tanggal</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Navigasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-gray-50 hover:bg-[#f8fcf8] transition text-center">
                        <td className="py-5 text-sm text-gray-500 font-medium">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="py-5">
                          <div className="flex items-center justify-center text-left">
                            <div>
                              <Link 
                                to={`/admin/reports/${item.id}`}
                                state={{ from: "/admin/reports" }}
                                className="font-semibold text-sm text-black max-w-[220px] truncate hover:text-[#51a750] hover:underline block transition-colors"
                              >
                                {item.title}
                              </Link>
                              <span className="text-xs text-gray-400 block mt-0.5">ID: {item.id} | Prioritas: {item.priority || "medium"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-gray-600 text-xs font-mono">
                          {item.location ? `${parseFloat(item.location.latitude).toFixed(4)}, ${parseFloat(item.location.longitude).toFixed(4)}` : "-"}
                        </td>
                        <td>
                          <span className="bg-[#eef9f0] text-[#51a750] text-xs px-3 py-1 rounded-full font-medium inline-block">{getCategoryLabel(item.category)}</span>
                        </td>
                        <td className="text-sm text-gray-600">User ID: {item.user_id || "-"}</td>
                        <td className="text-sm text-gray-500">{formatDate(item.time_report)}</td>
                        <td>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold inline-block ${getStatusStyle(item.status)}`}>{getStatusLabel(item.status)}</span>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => navigate(`/admin/reports/${item.id}`, { state: { from: "/admin/reports" } })} className="px-4 py-2 rounded-full text-xs bg-[#eef9f0] text-[#51a750] font-semibold">Detail</button>
                            <button className="px-4 py-2 rounded-full text-xs bg-[#f5f5f5] text-gray-600 font-semibold">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONTROL PAGINATION DINAMIS */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
                <p className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReports.length)} dari{" "}
                  {filteredReports.length} laporan ditemukan
                </p>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#f5faf6] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 h-10 rounded-full font-semibold text-sm transition ${
                        currentPage === pageNumber
                          ? "bg-[#51a750] text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-[#f5faf6]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#f5faf6] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}