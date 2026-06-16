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

  // Fungsi interaktif untuk mengubah status laporan langsung dari dashboard (Mock RT/RW Action)
  const handleStatusChange = async (id, newStatus) => {
    const confirmation = window.confirm(`Ubah status laporan ke ${newStatus}?`);
    if (!confirmation) return;

    const res = await reportService.updateStatus(id, newStatus);
    if (res.success) {
      alert("Status laporan berhasil diperbarui!");
      fetchDashboardData(); // Muat ulang data terbaru
    } else {
      alert("Gagal mengubah status laporan.");
    }
  };

  const barChartData = useMemo(() => {
    // 1. Definisikan map di dalamuseMemo agar selalu bersih/reset jadi 0 setiap kali data berubah
    const categoriesMap = {
      WASTE: 0,
      SIGNS_AND_MARKINGS: 0,
      PUBLIC_FACILITIES: 0,
      ROAD_AND_SIDEWALK: 0,
      TREES_AND_GREEN_SPACE: 0,
    };

    reports.forEach((report) => {
      // 2. Ubah ke .toUpperCase() agar pas dengan key yang ada di categoriesMap
      const cat = report.category?.toUpperCase();

      if (categoriesMap[cat] !== undefined) {
        categoriesMap[cat] += 1;
      }
    });

    // 3. Ubah format menjadi array objek untuk Recharts
    return Object.keys(categoriesMap).map((key) => ({
      name: key.replace(/_/g, " "), // Opsional: Mengubah "ROAD_AND_SIDEWALK" jadi "ROAD AND SIDEWALK" agar rapi di chart
      Jumlah: categoriesMap[key],
    }));
  }, [reports]);

  // 2. Format Data untuk Chart Lingkaran (Status Laporan)
  const pieChartData = useMemo(() => {
    return [
      { name: "Pending", value: stats.pending, color: "#f59e0b" }, // Amber-500
      { name: "Processing", value: stats.processing, color: "#3b82f6" }, // Blue-500
      { name: "Done", value: stats.done, color: "#10b981" }, // Green-500
    ].filter((item) => item.value > 0); // Hanya tampilkan status yang memiliki data
  }, [stats]);

  return (
    // <>
    //   <div className="bg-[#fafafa] text-gray-800 h-screen overflow-hidden flex">
    //     <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex ">
    //       <div className="p-6 flex items-center gap-3">
    //         <img
    //           src="https://placehold.co/40x40/e2e8f0/64748b?text=A"
    //           alt="Admin"
    //           className="w-10 h-10 rounded-full"
    //         />
    //         <span className="font-semibold text-sm">Admin</span>
    //       </div>
    //       <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
    //         <div>
    //           <p className="text-xs font-semibold text-gray-400 mb-3 px-2">
    //             Dashboards
    //           </p>
    //           <ul className="space-y-1 text-sm font-medium">
    //             <li>
    //               <a
    //                 href="#"
    //                 className="flex items-center gap-3 px-3 py-2.5 bg-gray-100 rounded-lg text-black"
    //               >
    //                 <svg
    //                   className="w-4 h-4"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
    //                   />
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
    //                   />
    //                 </svg>
    //                 Overview
    //               </a>
    //             </li>
    //             <li>
    //               <a
    //                 href="#"
    //                 className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
    //               >
    //                 <svg
    //                   className="w-4 h-4"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    //                   />
    //                 </svg>
    //                 Semua Laporan
    //               </a>
    //             </li>
    //             <li>
    //               <a
    //                 href="#"
    //                 className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
    //               >
    //                 <svg
    //                   className="w-4 h-4"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    //                   />
    //                 </svg>
    //                 Peta Redzone
    //               </a>
    //             </li>
    //           </ul>
    //         </div>
    //         <div>
    //           <p className="text-xs font-semibold text-gray-400 mb-3 px-2">
    //             Pages
    //           </p>
    //           <ul className="space-y-1 text-sm font-medium">
    //             <li>
    //               <a
    //                 href="#"
    //                 className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
    //               >
    //                 <svg
    //                   className="w-4 h-4"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    //                   />
    //                 </svg>
    //                 Kelola Warga
    //               </a>
    //             </li>
    //             <li>
    //               <a
    //                 href="#"
    //                 className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
    //               >
    //                 <svg
    //                   className="w-4 h-4"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    //                   />
    //                 </svg>
    //                 Manajemen Petugas
    //               </a>
    //             </li>
    //             <li>
    //               <a
    //                 href="#"
    //                 className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
    //               >
    //                 <svg
    //                   className="w-4 h-4"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    //                   />
    //                 </svg>
    //                 Pengaturan AI
    //               </a>
    //             </li>
    //           </ul>
    //         </div>
    //       </nav>
    //     </aside>
    //     <main className="flex-1 flex flex-col h-full overflow-hidden">
    //       <header className="px-8 py-4 flex justify-center">
    //         <div className="relative w-full max-w-md">
    //           <svg
    //             className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    //             fill="none"
    //             stroke="currentColor"
    //             viewBox="0 0 24 24"
    //           >
    //             <path
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               strokeWidth={2}
    //               d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    //             />
    //           </svg>
    //           <input
    //             type="text"
    //             placeholder="Search..."
    //             className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
    //           />
    //         </div>
    //       </header>
    //       <div className="flex-1 overflow-y-auto px-8 pb-8">
    //         <div className="flex justify-between items-end mb-6 mt-2">
    //           <h1 className="text-xl font-bold text-black">Overview</h1>
    //           <button className="text-sm text-gray-500 flex items-center gap-1">
    //             Monthly{" "}
    //             <svg
    //               className="w-3 h-3"
    //               fill="none"
    //               stroke="currentColor"
    //               viewBox="0 0 24 24"
    //             >
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth={2}
    //                 d="M19 9l-7 7-7-7"
    //               />
    //             </svg>
    //           </button>
    //         </div>
    //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    //           <div className="bg-gray-200/60 rounded-2xl p-5">
    //             <div className="flex items-baseline gap-2 mb-1">
    //               <span className="text-2xl font-bold text-black">7,265</span>
    //               <span className="text-xs text-green-600 font-medium">
    //                 +11.01% ↗
    //               </span>
    //             </div>
    //             <p className="text-sm text-gray-600">
    //               Total Laporan Masuk
    //               <br />
    //               (Maret)
    //             </p>
    //           </div>
    //           <div className="bg-gray-200/60 rounded-2xl p-5">
    //             <div className="flex items-baseline gap-2 mb-1">
    //               <span className="text-2xl font-bold text-black">3,671</span>
    //               <span className="text-xs text-gray-500 font-medium">
    //                 -0.03% ↘
    //               </span>
    //             </div>
    //             <p className="text-sm text-gray-600 mt-5">
    //               Menunggu Verifikasi
    //             </p>
    //           </div>
    //           <div className="bg-gray-200/60 rounded-2xl p-5">
    //             <div className="flex items-baseline gap-2 mb-1">
    //               <span className="text-2xl font-bold text-black">156</span>
    //               <span className="text-xs text-red-500 font-medium">
    //                 -15.03% ↘
    //               </span>
    //             </div>
    //             <p className="text-sm text-gray-600 mt-5">Sedang Ditangani</p>
    //           </div>
    //           <div className="bg-gray-200/60 rounded-2xl p-5">
    //             <div className="flex items-baseline gap-2 mb-1">
    //               <span className="text-2xl font-bold text-black">2,318</span>
    //               <span className="text-xs text-green-600 font-medium">
    //                 +6.08% ↗
    //               </span>
    //             </div>
    //             <p className="text-sm text-gray-600 mt-5">Selesai (Resolved)</p>
    //           </div>
    //         </div>
    //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    //           <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-2 flex flex-col">
    //             <h2 className="text-sm font-bold mb-4">Tren Laporan Warga</h2>
    //             <img
    //               src="https://placehold.co/600x250/ffffff/d1d5db?text=Line+Chart+Placeholder"
    //               alt="Line Chart"
    //               className="w-full h-full object-cover rounded-lg"
    //             />
    //           </div>
    //           <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
    //             <h2 className="text-sm font-bold mb-4">Laporan by Kategori</h2>
    //             <div className="space-y-4 text-xs font-medium text-gray-600">
    //               <div className="flex items-center gap-4">
    //                 <span className="w-16">Waste</span>
    //                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
    //                   <div
    //                     className="bg-gray-800 h-1.5 rounded-full"
    //                     style={{ width: "45%" }}
    //                   />
    //                 </div>
    //               </div>
    //               <div className="flex items-center gap-4">
    //                 <span className="w-16">Facility</span>
    //                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
    //                   <div
    //                     className="bg-gray-800 h-1.5 rounded-full"
    //                     style={{ width: "70%" }}
    //                   />
    //                 </div>
    //               </div>
    //               <div className="flex items-center gap-4">
    //                 <span className="w-16">Flood</span>
    //                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
    //                   <div
    //                     className="bg-gray-800 h-1.5 rounded-full"
    //                     style={{ width: "30%" }}
    //                   />
    //                 </div>
    //               </div>
    //               <div className="flex items-center gap-4">
    //                 <span className="w-16">Water</span>
    //                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
    //                   <div
    //                     className="bg-gray-800 h-1.5 rounded-full"
    //                     style={{ width: "85%" }}
    //                   />
    //                 </div>
    //               </div>
    //               <div className="flex items-center gap-4">
    //                 <span className="w-16">Drainage</span>
    //                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
    //                   <div
    //                     className="bg-gray-800 h-1.5 rounded-full"
    //                     style={{ width: "25%" }}
    //                   />
    //                 </div>
    //               </div>
    //               <div className="flex items-center gap-4">
    //                 <span className="w-16">Other</span>
    //                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
    //                   <div
    //                     className="bg-gray-800 h-1.5 rounded-full"
    //                     style={{ width: "40%" }}
    //                   />
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //           <div className="bg-white rounded-2xl p-6 border border-gray-100 h-64 flex flex-col">
    //             <h2 className="text-sm font-bold mb-4">Trend Kategori</h2>
    //             <div className="flex-1 flex items-end justify-between px-2 gap-2 mt-4 text-[10px] text-gray-400">
    //               <div className="flex flex-col items-center gap-2 w-full">
    //                 <div className="w-full bg-blue-300 rounded-t-md h-24" />
    //                 Waste
    //               </div>
    //               <div className="flex flex-col items-center gap-2 w-full">
    //                 <div className="w-full bg-teal-300 rounded-t-md h-40" />
    //                 Facility
    //               </div>
    //               <div className="flex flex-col items-center gap-2 w-full">
    //                 <div className="w-full bg-black rounded-t-md h-28" />
    //                 Drainage
    //               </div>
    //               <div className="flex flex-col items-center gap-2 w-full">
    //                 <div className="w-full bg-blue-400 rounded-t-md h-44" />
    //                 Flood
    //               </div>
    //               <div className="flex flex-col items-center gap-2 w-full">
    //                 <div className="w-full bg-purple-300 rounded-t-md h-16" />
    //                 Water
    //               </div>
    //               <div className="flex flex-col items-center gap-2 w-full">
    //                 <div className="w-full bg-green-400 rounded-t-md h-32" />
    //                 Other
    //               </div>
    //             </div>
    //           </div>
    //           <div className="bg-white rounded-2xl p-6 border border-gray-100 h-64 flex flex-col mb-10">
    //             <h2 className="text-sm font-bold mb-4">
    //               Laporan Masuk by Location
    //             </h2>
    //             <div className="flex-1 flex items-center justify-center gap-8">
    //               <img
    //                 src="https://placehold.co/150x150/ffffff/d1d5db?text=Pie+Chart"
    //                 alt="Pie Chart"
    //                 className="w-32 h-32 rounded-full"
    //               />
    //               <div className="space-y-3 text-xs text-gray-600">
    //                 <div className="flex justify-between w-32">
    //                   <span className="flex items-center gap-2">
    //                     <div className="w-2 h-2 rounded-full bg-black" />
    //                     Tiban
    //                   </span>{" "}
    //                   <span className="font-medium">52.1%</span>
    //                 </div>
    //                 <div className="flex justify-between w-32">
    //                   <span className="flex items-center gap-2">
    //                     <div className="w-2 h-2 rounded-full bg-gray-500" />
    //                     Sekupang
    //                   </span>{" "}
    //                   <span className="font-medium">22.8%</span>
    //                 </div>
    //                 <div className="flex justify-between w-32">
    //                   <span className="flex items-center gap-2">
    //                     <div className="w-2 h-2 rounded-full bg-blue-400" />
    //                     Batam Centre
    //                   </span>{" "}
    //                   <span className="font-medium">13.9%</span>
    //                 </div>
    //                 <div className="flex justify-between w-32">
    //                   <span className="flex items-center gap-2">
    //                     <div className="w-2 h-2 rounded-full bg-green-300" />
    //                     Other
    //                   </span>{" "}
    //                   <span className="font-medium">11.2%</span>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </main>
    //     <aside className="w-80 bg-white border-l border-gray-100 flex flex-col hidden xl:flex overflow-hidden">
    //       <div className="p-6 overflow-y-auto h-full space-y-8">
    //         <div>
    //           <h3 className="text-sm font-semibold mb-4">Notifikasi</h3>
    //           <div className="space-y-4">
    //             <div className="flex gap-3 items-start">
    //               <img
    //                 src="https://placehold.co/32x32/e2e8f0/64748b?text=B"
    //                 className="w-8 h-8 rounded-full"
    //               />
    //               <div>
    //                 <p className="text-xs text-gray-800 leading-tight">
    //                   <b>Budi</b> Baru saja membuat Laporan...
    //                 </p>
    //                 <span className="text-[10px] text-gray-400">Just now</span>
    //               </div>
    //             </div>
    //             <div className="flex gap-3 items-start">
    //               <img
    //                 src="https://placehold.co/32x32/e2e8f0/64748b?text=J"
    //                 className="w-8 h-8 rounded-full"
    //               />
    //               <div>
    //                 <p className="text-xs text-gray-800 leading-tight">
    //                   <b>Jane</b> baru saja melaporkan t...
    //                 </p>
    //                 <span className="text-[10px] text-gray-400">
    //                   59 minutes ago
    //                 </span>
    //               </div>
    //             </div>
    //             <div className="flex gap-3 items-start">
    //               <img
    //                 src="https://placehold.co/32x32/e2e8f0/64748b?text=Y"
    //                 className="w-8 h-8 rounded-full"
    //               />
    //               <div>
    //                 <p className="text-xs text-gray-800 leading-tight">
    //                   <b>Yuta</b> baru saja melaporkan t...
    //                 </p>
    //                 <span className="text-[10px] text-gray-400">
    //                   12 hours ago
    //                 </span>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //         <div>
    //           <h3 className="text-sm font-semibold mb-4">Laporan</h3>
    //           <div className="space-y-4">
    //             <div className="flex gap-3 items-start">
    //               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
    //                 👤
    //               </div>
    //               <div>
    //                 <p className="text-xs text-gray-800 leading-tight">
    //                   Laporan di daerah X sedang...
    //                 </p>
    //                 <span className="text-[10px] text-gray-400">Just now</span>
    //               </div>
    //             </div>
    //             <div className="flex gap-3 items-start">
    //               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
    //                 ✔️
    //               </div>
    //               <div>
    //                 <p className="text-xs text-gray-800 leading-tight">
    //                   Laporan di daerah X sedang...
    //                 </p>
    //                 <span className="text-[10px] text-gray-400">Just now</span>
    //               </div>
    //             </div>
    //             <div className="flex gap-3 items-start">
    //               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
    //                 ➖
    //               </div>
    //               <div>
    //                 <p className="text-xs text-gray-800 leading-tight">
    //                   Laporan di daerah X sedang...
    //                 </p>
    //                 <span className="text-[10px] text-gray-400">Just now</span>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //         <div>
    //           <h3 className="text-sm font-semibold mb-4">Petugas Lapangan</h3>
    //           <div className="space-y-3">
    //             <div className="flex items-center gap-3">
    //               <img
    //                 src="https://placehold.co/32x32/ede9fe/7c3aed?text=Y"
    //                 className="w-8 h-8 rounded-full"
    //               />
    //               <span className="text-xs font-medium">Yanto</span>
    //             </div>
    //             <div className="flex items-center gap-3">
    //               <img
    //                 src="https://placehold.co/32x32/ede9fe/7c3aed?text=Y"
    //                 className="w-8 h-8 rounded-full"
    //               />
    //               <span className="text-xs font-medium">Yanto</span>
    //             </div>
    //             <div className="flex items-center gap-3">
    //               <img
    //                 src="https://placehold.co/32x32/ede9fe/7c3aed?text=Y"
    //                 className="w-8 h-8 rounded-full"
    //               />
    //               <span className="text-xs font-medium">Yanto</span>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </aside>
    //   </div>
    // </>

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
              {/* 1. Chart Batang: Kategori Laporan */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-2 flex flex-col min-h-[320px]">
                <h2 className="text-sm font-bold mb-4">
                  Jumlah Laporan berdasarkan Jenis Kategori
                </h2>
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
              </div>

              {/* 2. Chart Lingkaran: Proporsi Status Laporan */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between min-h-[320px]">
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

            {/* TABEL DATA AKTIF DARI API */}
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
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-gray-50 last:border-none hover:bg-gray-50/50"
                      >
                        <td className="py-3 font-medium text-gray-900">
                          #{report.id}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-gray-800">
                            {report.title}
                          </p>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                            {report.category}
                          </span>
                        </td>
                        <td className="py-3">
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
                        <td className="py-3 text-gray-500 font-mono">
                          {report.location?.latitude
                            ? parseFloat(report.location.latitude).toFixed(4)
                            : "-"}
                          ,{" "}
                          {report.location?.longitude
                            ? parseFloat(report.location.longitude).toFixed(4)
                            : "-"}
                        </td>
                        <td className="py-3">
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
                        <td className="py-3 text-center space-x-1">
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* SIDEBAR RIGHT */}
        <aside className="w-80 bg-white border-l border-gray-100 flex flex-col hidden xl:flex overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-8">
            <div>
              <h3 className="text-sm font-semibold mb-4">
                Aktivitas Laporan Terkini
              </h3>
              <div className="space-y-4">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                      {report.status === "pending"
                        ? "⏳"
                        : report.status === "processing"
                          ? "🔧"
                          : "✅"}
                    </div>
                    <div>
                      <p className="text-xs text-gray-800 leading-tight">
                        Laporan <b>{report.title}</b> berstatus{" "}
                        <span className="underline font-semibold">
                          {report.status}
                        </span>
                        .
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {report.time_report
                          ? new Date(report.time_report).toLocaleString("id-ID")
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
