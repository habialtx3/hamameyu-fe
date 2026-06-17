import { useEffect, useMemo, useState } from "react";
import { reportService } from "../../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk metrik dashboard statistik
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    done: 0,
  });

  // Ambil data dari backend saat komponen pertama kali dimuat
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const response = await reportService.getAllReports();

    if (response.success && Array.isArray(response.data)) {
      const data = response.data;
      setReports(data);

      // Hitung metrik secara dinamis berdasarkan status dari API
      const dynamicStats = data.reduce(
        (acc, report) => {
          acc.total += 1;
          if (report.status === "pending") acc.pending += 1;
          if (report.status === "processing") acc.processing += 1;
          if (report.status === "done") acc.done += 1;
          return acc;
        },
        { total: 0, pending: 0, processing: 0, done: 0 },
      );

      setStats(dynamicStats);
    }
    setLoading(false);
  };

  // 🌟 FUNGSI HELPER BARU: Memotong "-duplicate" dan mengembalikan status penanda
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

  // Fungsi interaktif untuk mengubah status laporan langsung dari dashboard
  const handleStatusChange = async (id, newStatus) => {
    const confirmation = window.confirm(`Ubah status laporan ke ${newStatus}?`);
    if (!confirmation) return;

    const res = await reportService.updateStatus(id, newStatus);
    if (res.success) {
      alert("Status laporan berhasil diperbarui!");
      fetchDashboardData();
    } else {
      alert("Gagal mengubah status laporan.");
    }
  };

  const barChartData = useMemo(() => {
    const categoriesMap = {
      WASTE: 0,
      SIGNS_AND_MARKINGS: 0,
      PUBLIC_FACILITIES: 0,
      ROAD_AND_SIDEWALK: 0,
      TREES_AND_GREEN_SPACE: 0,
    };

    reports.forEach((report) => {
      const cat = report.category?.toUpperCase();
      if (categoriesMap[cat] !== undefined) {
        categoriesMap[cat] += 1;
      }
    });

    return Object.keys(categoriesMap).map((key) => ({
      name: key.replace(/_/g, " "),
      Jumlah: categoriesMap[key],
    }));
  }, [reports]);

  const pieChartData = useMemo(() => {
    return [
      { name: "Pending", value: stats.pending, color: "#f59e0b" },
      { name: "Processing", value: stats.processing, color: "#3b82f6" },
      { name: "Done", value: stats.done, color: "#10b981" },
    ].filter((item) => item.value > 0);
  }, [stats]);

  return (
    <>
      <div className="bg-[#fafafa] text-gray-800 h-screen overflow-hidden flex">
        {/* SIDEBAR LEFT */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex ">
          <div className="p-6 flex items-center gap-3">
            <img
              src="https://placehold.co/40x40/e2e8f0/64748b?text=A"
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-semibold text-sm">Admin RT/RW</span>
          </div>
          <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-3 px-2">
                Dashboards
              </p>
              <ul className="space-y-1 text-sm font-medium">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-3 py-2.5 bg-gray-100 rounded-lg text-black"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      />
                    </svg>
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Semua Laporan ({reports.length})
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="px-8 py-4 flex justify-center">
            <div className="relative w-full max-w-md">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari ID atau judul laporan..."
                className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="flex justify-between items-end mb-6 mt-2">
              <h1 className="text-xl font-bold text-black">
                Overview Real-time
              </h1>
              {loading && (
                <span className="text-xs text-gray-400 animate-pulse">
                  Menghubungkan ke server...
                </span>
              )}
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-200/60 rounded-2xl p-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-black">
                    {stats.total}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total Laporan Masuk</p>
              </div>
              <div className="bg-amber-100/80 rounded-2xl p-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-amber-700">
                    {stats.pending}
                  </span>
                </div>
                <p className="text-sm text-amber-800">
                  Menunggu Verifikasi (Pending)
                </p>
              </div>
              <div className="bg-blue-100/80 rounded-2xl p-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-blue-700">
                    {stats.processing}
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  Sedang Ditangani (Processing)
                </p>
              </div>
              <div className="bg-green-100/80 rounded-2xl p-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-green-700">
                    {stats.done}
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  Selesai (Resolved / Done)
                </p>
              </div>
            </div>

            {/* SECTION CHARTS UTAMA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-2 flex flex-col min-h-[350px]">
                <h2 className="text-sm font-bold mb-4">
                  Jumlah Laporan berdasarkan Jenis Kategori
                </h2>
                <div className="flex-1 w-full h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9, fill: "#4b5563" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        height={50}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip cursor={{ fill: "#f3f4f6" }} />
                      <Bar
                        dataKey="Jumlah"
                        fill="#1f2937"
                        radius={[6, 6, 0, 0]}
                        barSize={35}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between min-h-[350px]">
                <h2 className="text-sm font-bold mb-2">
                  Proporsi Status Penanganan
                </h2>
                <div className="flex-1 w-full h-full min-h-[180px] flex items-center justify-center">
                  {pieChartData.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      Tidak ada data status
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconSize={10}
                          tick={{ fontSize: 10 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* TABEL DATA UTAMA */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 overflow-x-auto">
              <h2 className="text-sm font-bold mb-4">
                Laporan Terbaru dari Warga
              </h2>
              {reports.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Belum ada data laporan masuk.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                      <th className="pb-3">ID</th>
                      <th className="pb-3">Judul & Kategori</th>
                      <th className="pb-3">Prioritas</th>
                      <th className="pb-3">Lokasi (Lat, Long)</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-center">Aksi RT/RW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      // Ekstrak informasi judul dan status duplikat di sini
                      const { cleanTitle, isDuplicate } = parseTitle(
                        report.title,
                      );

                      return (
                        <tr
                          key={report.id}
                          className={`border-b border-gray-50 last:border-none transition-colors ${
                            isDuplicate
                              ? "bg-red-50/50 hover:bg-red-100/60" // Mengubah background satu baris utuh jika duplikat
                              : "hover:bg-gray-50/50"
                          }`}
                        >
                          <td className="py-3 font-medium text-gray-900 px-2">
                            #{report.id}
                          </td>

                          {/* KOLOM JUDUL: Diberikan penanda khusus yang kontras jika isDuplicate true */}
                          <td
                            className={`py-3 px-2 rounded-lg transition-all ${
                              isDuplicate
                                ? "border-l-4 border-red-500 bg-red-100/40"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {isDuplicate && (
                                <span className="text-red-500 font-bold text-sm">
                                  ⚠️
                                </span>
                              )}
                              <p
                                className={`font-semibold ${isDuplicate ? "text-red-900" : "text-gray-800"}`}
                              >
                                {cleanTitle}
                              </p>

                              {/* SPESIAL CONCERN BADGE */}
                              {isDuplicate && (
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide animate-pulse shadow-sm border border-red-700 uppercase">
                                  DUPLICATE DETECTED
                                </span>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                isDuplicate
                                  ? "bg-red-200/60 text-red-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {report.category}
                            </span>
                          </td>

                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                report.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : report.priority === "medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {report.priority}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-500 font-mono">
                            {report.location?.latitude
                              ? parseFloat(report.location.latitude).toFixed(4)
                              : "-"}
                            ,{" "}
                            {report.location?.longitude
                              ? parseFloat(report.location.longitude).toFixed(4)
                              : "-"}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                report.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : report.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center space-x-1">
                            {report.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(report.id, "processing")
                                }
                                className="bg-blue-600 text-white px-2 py-1 rounded shadow hover:bg-blue-700 transition font-medium"
                              >
                                Proses
                              </button>
                            )}
                            {report.status === "processing" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(report.id, "done")
                                }
                                className="bg-green-600 text-white px-2 py-1 rounded shadow hover:bg-green-700 transition font-medium"
                              >
                                Selesaikan
                              </button>
                            )}
                            {report.status === "done" && (
                              <span className="text-gray-400 italic">
                                No Action
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* SIDEBAR RIGHT (AKTIVITAS TERKINI) */}
        <aside className="w-80 bg-white border-l border-gray-100 flex flex-col hidden xl:flex overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-8">
            <div>
              <h3 className="text-sm font-semibold mb-4">
                Aktivitas Laporan Terkini
              </h3>
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => {
                  // 🌟 Ekstrak informasi judul di sidebar juga
                  const { cleanTitle, isDuplicate } = parseTitle(report.title);

                  return (
                    <div key={report.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs shrink-0">
                        {report.status === "pending"
                          ? "⏳"
                          : report.status === "processing"
                            ? "🔧"
                            : "✅"}
                      </div>
                      <div>
                        <p className="text-xs text-gray-800 leading-tight">
                          Laporan <b>{cleanTitle}</b>{" "}
                          {isDuplicate && (
                            <span className="text-red-500 font-bold">
                              (Duplikat)
                            </span>
                          )}{" "}
                          berstatus{" "}
                          <span className="underline font-semibold">
                            {report.status}
                          </span>
                          .
                        </p>
                        <span className="text-[10px] text-gray-400">
                          {report.time_report
                            ? new Date(report.time_report).toLocaleString(
                                "id-ID",
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
