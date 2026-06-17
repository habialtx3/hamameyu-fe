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

  // --- 🌟 FUNGSI HELPER BARU: Memotong "-duplicate" dan mendeteksi penanda khusus ---
  const parseTitle = (rawTitle) => {
    if (!rawTitle) return { cleanTitle: "-", isDuplicate: false };

    if (rawTitle.endsWith("-duplicate")) {
      return {
        cleanTitle: rawTitle.replace(/-duplicate$/, ""),
        isDuplicate: true,
      };
    }
    return { cleanTitle: rawTitle, isDuplicate: false };
  };

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
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Semua Laporan
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola seluruh laporan warga Kota Batam.
            </p>
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
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                ▼
              </span>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-10 pb-10">
          {/* STATS KARTU RINGKASAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6">
              <p className="text-sm text-gray-500">Total Laporan</p>
              <h2 className="text-3xl font-black mt-2 text-black">
                {loading ? "..." : totalReports.toLocaleString("id-ID")}
              </h2>
            </div>
            <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6">
              <p className="text-sm text-gray-500">Sedang Diproses</p>
              <h2 className="text-3xl font-black mt-2 text-yellow-600">
                {loading ? "..." : processedReports.toLocaleString("id-ID")}
              </h2>
            </div>
            <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">Laporan Selesai</p>
              <h2 className="text-3xl font-black mt-2 text-green-600">
                {loading ? "..." : resolvedReports.toLocaleString("id-ID")}
              </h2>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-[30px] border border-[#edf3ee] p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Data Laporan Warga
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Menampilkan laporan.
                </p>
              </div>
              <button className="bg-[#eef9f0] text-[#51a750] px-5 py-2.5 rounded-full text-sm font-semibold w-full sm:w-fit">
                + Tambah Laporan
              </button>
            </div>

            {loading && (
              <div className="text-center py-12 text-gray-500 text-sm animate-pulse">
                Menghubungkan ke server api...
              </div>
            )}
            {error && (
              <div className="text-center py-8 text-red-500 text-sm bg-red-50 rounded-2xl border border-red-100">
                ⚠️ Koneksi Gagal: {error}
              </div>
            )}
            {!loading && !error && filteredReports.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Tidak ada laporan yang sesuai.
              </div>
            )}

            {/* TAMPILAN CARD MOBILE */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {currentItems.map((item, index) => {
                  // 🌟 PARSE DATA DUPLIKAT (MOBILE)
                  const { cleanTitle, isDuplicate } = parseTitle(item.title);

                  return (
                    <div
                      key={item.id || index}
                      className={`border rounded-[24px] p-5 transition-colors ${
                        isDuplicate
                          ? "border-red-200 bg-red-50/40"
                          : "border-[#edf3ee] bg-[#fcfffc]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isDuplicate && (
                              <span className="text-red-500 text-xs">⚠️</span>
                            )}
                            <Link
                              to={`/admin/reports/${item.id}`}
                              state={{ from: "/admin/reports" }}
                              className={`font-bold text-sm line-clamp-1 transition-colors ${
                                isDuplicate
                                  ? "text-red-950 hover:text-red-700"
                                  : "text-black hover:text-[#51a750]"
                              }`}
                            >
                              {cleanTitle}
                            </Link>
                            {isDuplicate && (
                              <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide animate-pulse uppercase">
                                DUPLICATE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            ID Laporan: {item.id}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${getStatusStyle(item.status)}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">
                            Koordinat Lokasi
                          </span>
                          <span className="font-medium text-gray-700 text-right text-xs">
                            {item.location
                              ? `${parseFloat(item.location.latitude).toFixed(4)}, ${parseFloat(item.location.longitude).toFixed(4)}`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Kategori</span>
                          <span className="bg-[#eef9f0] text-[#51a750] text-xs px-3 py-1 rounded-full font-medium">
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Tanggal Masuk</span>
                          <span className="font-medium text-gray-700 text-right">
                            {formatDate(item.time_report)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5 w-full">
                        <button
                          onClick={() =>
                            navigate(`/admin/reports/${item.id}`, {
                              state: { from: "/admin/reports" },
                            })
                          }
                          className="flex-1 text-center px-4 py-3 rounded-full text-sm bg-[#eef9f0] text-[#51a750] font-semibold"
                        >
                          Detail
                        </button>
                        <button className="flex-1 px-4 py-3 rounded-full text-sm bg-[#f5f5f5] text-gray-600 font-semibold">
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAMPILAN TABLE DESKTOP */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="hidden lg:block overflow-x-auto">
                {/* 1. MENGUBAH table-fixed MENJADI table-auto AGAR LEBAR KOLOM FLEKSIBEL */}
                <table className="w-full min-w-[1000px] table-auto">
                  <thead>
                    <tr className="text-center text-sm text-gray-400 border-b border-gray-100">
                      {/* 2. MENYESUAIKAN LEBAR HEADERS */}
                      <th className="pb-4 font-medium w-12">No</th>
                      <th className="pb-4 font-medium text-left pl-6 min-w-[280px]">
                        Laporan
                      </th>
                      <th className="pb-4 font-medium w-40">
                        Lokasi (Lat, Long)
                      </th>
                      <th className="pb-4 font-medium w-52">Kategori</th>
                      <th className="pb-4 font-medium w-28">Pelapor</th>
                      <th className="pb-4 font-medium w-36">Tanggal</th>
                      <th className="pb-4 font-medium w-28">Status</th>
                      <th className="pb-4 font-medium w-36">Navigasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => {
                      const { cleanTitle, isDuplicate } = parseTitle(
                        item.title,
                      );

                      return (
                        <tr
                          key={item.id || index}
                          className={`border-b border-gray-50 last:border-none text-center transition-colors ${
                            isDuplicate
                              ? "bg-red-50/40 hover:bg-red-100/50"
                              : "hover:bg-[#f8fcf8]"
                          }`}
                        >
                          <td className="py-5 text-sm text-gray-500 font-medium">
                            {indexOfFirstItem + index + 1}
                          </td>

                          {/* KOLOM JUDUL LAPORAN */}
                          <td
                            className={`py-5 text-left pl-6 pr-4 ${
                              isDuplicate
                                ? "border-l-4 border-red-500 bg-red-100/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              {isDuplicate && (
                                <span className="text-red-500 font-bold">
                                  ⚠️
                                </span>
                              )}

                              {/* 3. MENGHAPUS truncate DAN max-w-[200px] AGAR JUDUL BISA MEMANJANG/WRAPPING DENGAN AMAN */}
                              <Link
                                to={`/admin/reports/${item.id}`}
                                state={{ from: "/admin/reports" }}
                                className={`font-semibold text-sm hover:underline transition-colors ${
                                  isDuplicate
                                    ? "text-red-950 hover:text-red-700"
                                    : "text-black hover:text-[#51a750]"
                                }`}
                              >
                                {cleanTitle}
                              </Link>

                              {/* BADGE DUPLICATE */}
                              {isDuplicate && (
                                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide animate-pulse uppercase shrink-0">
                                  DUPLICATE
                                </span>
                              )}
                            </div>

                            {/* 4. MEMBERI RUANG LEBIH LONGGAR UNTUK ID & PRIORITAS */}
                            <div className="text-xs text-gray-400 flex items-center gap-2 whitespace-nowrap mt-1">
                              <span>
                                ID:{" "}
                                <b className="text-gray-600 font-semibold">
                                  #{item.id}
                                </b>
                              </span>
                              <span className="text-gray-300">|</span>
                              <span>
                                Prioritas:
                                <span
                                  className={`ml-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                    item.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : item.priority === "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item.priority || "medium"}
                                </span>
                              </span>
                            </div>
                          </td>

                          <td className="text-sm text-gray-600 text-xs font-mono whitespace-nowrap">
                            {item.location
                              ? `${parseFloat(item.location.latitude).toFixed(4)}, ${parseFloat(item.location.longitude).toFixed(4)}`
                              : "-"}
                          </td>
                          <td>
                            <span className="bg-[#eef9f0] text-[#51a750] text-xs px-3 py-1 rounded-full font-medium inline-block whitespace-nowrap">
                              {getCategoryLabel(item.category)}
                            </span>
                          </td>
                          <td className="text-sm text-gray-600 whitespace-nowrap">
                            User ID: {item.user_id || "-"}
                          </td>
                          <td className="text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(item.time_report)}
                          </td>
                          <td>
                            <span
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold inline-block whitespace-nowrap ${getStatusStyle(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                              <button
                                onClick={() =>
                                  navigate(`/admin/reports/${item.id}`, {
                                    state: { from: "/admin/reports" },
                                  })
                                }
                                className="px-4 py-2 rounded-full text-xs bg-[#eef9f0] text-[#51a750] font-semibold"
                              >
                                Detail
                              </button>
                              <button className="px-4 py-2 rounded-full text-xs bg-[#f5f5f5] text-gray-600 font-semibold">
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONTROL PAGINATION DINAMIS */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
                <p className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredReports.length)} dari{" "}
                  {filteredReports.length} laporan ditemukan
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#f5faf6] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
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
                    ),
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
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
