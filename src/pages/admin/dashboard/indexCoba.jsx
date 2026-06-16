import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { reportService } from "../../../services/api";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../components/sidebar";

export default function AdminDashboardPageCoba() {
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
        { total: 0, pending: 0, processing: 0, done: 0 }
      );

      setStats(dynamicStats);
    }
    setLoading(false);
  };

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

  // BARU: Ambil 5 data laporan terbaru untuk Tabel & Aktivitas
  // Diasumsikan data dari API urutan indeks 0 adalah yang paling baru (atau gunakan .reverse() jika terbalik)
  const recentReports = useMemo(() => {
    return reports.slice(0, 5);
  }, [reports]);

  // BARU: Generate teks notifikasi dinamis berdasarkan data laporan terbaru
  const dynamicNotifications = useMemo(() => {
    return recentReports.map((report) => {
      let statusText = "menunggu verifikasi";
      if (report.status === "processing") statusText = "sedang diproses";
      if (report.status === "done") statusText = "berhasil diselesaikan";

      return {
        text: `Laporan "${report.title}" di kategori ${report.category?.replace(/_/g, " ")} ${statusText}.`,
        time: "Baru saja"
      };
    });
  }, [recentReports]);

  return (
    <div className="bg-[#f6faf7] min-h-screen lg:flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {/* TOPBAR */}
        <header className="px-6 lg:px-10 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-black">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor laporan lingkungan Kota Batam secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Cari laporan..."
                className="w-72 bg-white border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#51a750]/20"
              />
            </div>
            <img
              src="https://placehold.co/44x44/e2f5e8/51a750?text=A"
              alt="Admin"
              className="w-11 h-11 rounded-full"
            />
          </div>
        </header>

        <div className="px-6 lg:px-10 pb-10">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#51a750] to-[#7bc96f] p-8 lg:p-10 text-white mb-8">
            <div className="max-w-2xl relative z-10">
              <span className="uppercase tracking-widest text-xs font-semibold text-white/80">
                Admin Insight
              </span>

              {/* BARU: Mengubah teks hardcode 124 menjadi jumlah riil dari API */}
              <h2 className="text-3xl lg:text-4xl font-black leading-tight mt-3 mb-4">
                {loading ? "Menghitung..." : `${stats.total} total laporan masuk.`}
              </h2>

              <p className="text-sm lg:text-base text-white/90 leading-relaxed">
                Terdapat {stats.pending} laporan baru status pending yang memerlukan verifikasi tindakan Anda sesegera mungkin.
              </p>

              <Link to="/admin/reports">
                <button className="mt-6 bg-white text-[#51a750] font-semibold px-6 py-3 rounded-full hover:scale-105 transition">
                  Lihat Detail Laporan
                </button>
              </Link>
            </div>

            <div className="absolute right-0 bottom-0 opacity-10 text-[220px] font-black">
              🌱
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-200/60 rounded-2xl p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-black">{stats.total}</span>
              </div>
              <p className="text-sm text-gray-600">Total Laporan Masuk</p>
            </div>
            <div className="bg-amber-100/80 rounded-2xl p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-amber-700">{stats.pending}</span>
              </div>
              <p className="text-sm text-amber-800">Menunggu Verifikasi (Pending)</p>
            </div>
            <div className="bg-blue-100/80 rounded-2xl p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-blue-700">{stats.processing}</span>
              </div>
              <p className="text-sm text-blue-800">Sedang Ditangani (Processing)</p>
            </div>
            <div className="bg-green-100/80 rounded-2xl p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-green-700">{stats.done}</span>
              </div>
              <p className="text-sm text-green-800">Selesai (Resolved / Done)</p>
            </div>
          </div>

          {/* CHARTS CONTAINER */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Chart Batang */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-2 flex flex-col min-h-[350px]">
              <h2 className="text-sm font-bold mb-4 text-gray-800">
                Jumlah Laporan berdasarkan Jenis Kategori
              </h2>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -20, bottom: 10 }} barCategoryGap="15%">
                    <defs>
                      <linearGradient id="colorGreenGradient" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#51a750" stopOpacity={1} />
                        <stop offset="100%" stopColor="#9ddc9b" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#4b5563" }} axisLine={false} tickLine={false} interval={0} height={50} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "#f3f4f6" }} />
                    <Bar dataKey="Jumlah" fill="url(#colorGreenGradient)" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart Pie */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between min-h-[350px]">
              <h2 className="text-sm font-bold mb-2 text-gray-800">
                Proporsi Status Penanganan
              </h2>
              <div className="flex-1 w-full min-h-[180px] flex items-center justify-center">
                {pieChartData.length === 0 ? (
                  <p className="text-xs text-gray-400">Tidak ada data status</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* TABLE + NOTIFICATION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* TABLE */}
            <div className="xl:col-span-2 bg-white rounded-[30px] border border-[#edf3ee] p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-black">Recent Reports</h2>
                  <p className="text-sm text-gray-500 mt-1">5 Laporan terbaru dari warga</p>
                </div>
                <Link to="/admin/reports" className="text-sm text-[#51a750] font-semibold">
                  Lihat Semua
                </Link>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 overflow-x-auto">
                {/* BARU: Render menggunakan `recentReports` yang sudah dibatasi 5 data saja */}
                {recentReports.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Belum ada data laporan masuk.</p>
                ) : (
                  <table className="w-full text-center border-collapse text-xs">
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
                      {recentReports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50">
                          <td className="py-3 font-medium text-gray-900">#{report.id}</td>
                          <td className="py-3">
                            <p className="font-semibold text-gray-800">{report.title}</p>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                              {report.category}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              report.priority === "high" ? "bg-red-100 text-red-700" :
                              report.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {report.priority}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 font-mono">
                            {report.location?.latitude ? parseFloat(report.location.latitude).toFixed(4) : "-"}, {" "}
                            {report.location?.longitude ? parseFloat(report.location.longitude).toFixed(4) : "-"}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${
                              report.status === "pending" ? "bg-amber-100 text-amber-800" :
                              report.status === "processing" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="py-3 text-center space-x-1">
                            {report.status === "pending" && (
                              <button onClick={() => handleStatusChange(report.id, "processing")} className="bg-blue-600 text-white px-2 py-1 rounded shadow hover:bg-blue-700 transition font-medium">
                                Proses
                              </button>
                            )}
                            {report.status === "processing" && (
                              <button onClick={() => handleStatusChange(report.id, "done")} className="bg-green-600 text-white px-2 py-1 rounded shadow hover:bg-green-700 transition font-medium">
                                Selesaikan
                              </button>
                            )}
                            {report.status === "done" && <span className="text-gray-400 italic">No Action</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* NOTIFICATION */}
            <div className="bg-white rounded-[30px] border border-[#edf3ee] p-6">
              <h2 className="text-lg font-bold text-black mb-6">Aktivitas Terbaru</h2>
              <div className="space-y-5">
                {/* BARU: Render menggunakan data `dynamicNotifications` riil */}
                {dynamicNotifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Belum ada aktivitas baru.</p>
                ) : (
                  dynamicNotifications.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start pb-5 border-b border-gray-50 last:border-none">
                      <div className="w-10 h-10 rounded-2xl bg-[#eef9f0] flex items-center justify-center">🔔</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}