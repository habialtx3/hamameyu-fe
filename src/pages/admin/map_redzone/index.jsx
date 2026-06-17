import { useEffect, useState, useMemo, useRef } from "react";
import { reportService } from "../../../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate, Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Sidebar from "../components/sidebar";
import ViewImage from "../../../components/ViewImages";

// Fix bug ikon Leaflet default
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Komponen Pembantu untuk Mengontrol Pergerakan & Zoom Peta
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Helper Custom Icon SVG berdasarkan prioritas
const createCustomIcon = (priority) => {
  let color = "#3b82f6"; 
  if (priority?.toLowerCase() === "high") color = "#ef4444"; 
  if (priority?.toLowerCase() === "medium") color = "#f59e0b"; 

  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-8 h-8">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742c1.008-.704 2.215-1.72 3.245-3.003C18.825 15.286 20 12.87 20 10c0-4.694-3.562-8.5-7.75-8.5S4.5 5.306 4.5 10c0 2.87 1.175 5.286 2.203 7.592 1.03 1.283 2.237 2.3 3.245 3.003a16.975 16.975 0 001.144.742zm1.71-12.1a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clip-rule="evenodd" />
    </svg>
  `;

  return L.divIcon({
    html: svgTemplate,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function AdminRedzonePage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [redzones, setRedzones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("7 Hari Terakhir");

  // Wadah referensi penanda untuk membuka pop-up secara remote 🌟
  const markerRefs = useRef({});

  // State navigasi peta dinamis
  const batamCenterCoordinates = [1.1278, 104.0526];
  const [mapCenter, setMapCenter] = useState(batamCenterCoordinates);
  const [mapZoom, setMapZoom] = useState(12);

  // State untuk pagination tabel laporan individu
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");

  const getAreaFromCoordinates = (lat, lng) => {
    if (!lat || !lng) return "Batam Centre";
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const areas = [
      { name: "Bengkong", lat: 1.1414, lng: 104.0284 },
      { name: "Batam Centre", lat: 1.1278, lng: 104.0526 },
      { name: "Sekupang", lat: 1.1224, lng: 103.9482 },
      { name: "Tiban", lat: 1.1112, lng: 103.9712 },
      { name: "Batu Ampar", lat: 1.1512, lng: 104.0012 },
      { name: "Nongsa", lat: 1.1611, lng: 104.1012 },
    ];

    let closestArea = areas[0];
    let minDistance = Infinity;

    areas.forEach((area) => {
      const distance = Math.sqrt(Math.pow(latitude - area.lat, 2) + Math.pow(longitude - area.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestArea = area;
      }
    });
    return closestArea.name;
  };

  const getCategoryLabel = (category) => {
    if (!category) return "Laporan Umum";
    switch (category.toUpperCase()) {
      case "WASTE": return "Pengelolaan Sampah";
      case "SIGNS_AND_MARKINGS": return "Rambu & Markah Jalan";
      case "PUBLIC_FACILITIES": return "Fasilitas Publik";
      case "ROAD_AND_SIDEWALK": return "Jalan & Trotoar Rusak";
      case "TREES_AND_GREEN_SPACE": return "Pohon & Ruang Terbuka";
      default:
        return category.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const fetchAndProcessData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();

      if (response && response.success) {
        let rawReports = response.data || [];

        // Modifikasi judul dan filter duplicate ke special concern
        rawReports = rawReports.map((report) => {
          let updatedTitle = report.title || "Laporan Tanpa Judul";
          let isSpecialConcern = false;

          if (updatedTitle.toLowerCase().includes("-duplicate")) {
            updatedTitle = updatedTitle.replace(/-duplicate/gi, "").trim();
            isSpecialConcern = true;
          }

          return {
            ...report,
            title: updatedTitle,
            isSpecialConcern: isSpecialConcern,
          };
        });

        setReports(rawReports);

        // Pengelompokan area untuk ringkasan zona risiko
        const groups = {};
        rawReports.forEach((report) => {
          const areaName = getAreaFromCoordinates(report.location?.latitude, report.location?.longitude);

          if (!groups[areaName]) {
            groups[areaName] = { area: areaName, reportsCount: 0, categories: {} };
          }

          groups[areaName].reportsCount += 1;
          const catLabel = getCategoryLabel(report.category);
          groups[areaName].categories[catLabel] = (groups[areaName].categories[catLabel] || 0) + 1;
        });

        const processedZones = Object.values(groups).map((zone) => {
          let dominantIssue = "Umum";
          let maxCount = 0;
          Object.entries(zone.categories).forEach(([cat, count]) => {
            if (count > maxCount) {
              maxCount = count;
              dominantIssue = cat;
            }
          });

          let riskLevel = "Low";
          if (zone.reportsCount > 10) riskLevel = "High";
          else if (zone.reportsCount > 4) riskLevel = "Medium";

          return {
            area: zone.area,
            level: riskLevel,
            reports: zone.reportsCount,
            issue: dominantIssue,
          };
        });

        processedZones.sort((a, b) => b.reports - a.reports);
        setRedzones(processedZones);
      } else {
        throw new Error(response.message || "Gagal mengambil data laporan");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const confirmation = window.confirm(`Ubah status laporan ke ${newStatus}?`);
    if (!confirmation) return;

    const res = await reportService.updateStatus(id, newStatus);
    if (res.success) {
      alert("Status laporan berhasil diperbarui!");
      fetchAndProcessData();
    } else {
      alert("Gagal mengubah status laporan.");
    }
  };

  // Aksi interaktif klik baris menuju titik peta + Buka popup secara otomatis 🌟
  const handleFocusToMarker = (reportId, latitude, longitude) => {
    if (!latitude || !longitude) return;
    
    // 1. Pindahkan titik pusat koordinat dan perbesar peta
    setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
    setMapZoom(16); 

    // 2. Picu fungsi pembukaan popup Leaflet menggunakan ref marker terkait
    setTimeout(() => {
      const targetMarker = markerRefs.current[reportId];
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }, 400); // Penundaan 400ms agar animasi transisi peta selesai terlebih dahulu
  };

  // Logika Pagination untuk Laporan Individu
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  const totalAreaRedzone = redzones.length;
  const highRiskAreas = redzones.filter((z) => z.level === "High").length;
  const totalReportsCount = reports.length;

  const getLevelStyle = (level) => {
    switch (level) {
      case "High": return "bg-red-100 text-red-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-[#f6faf7] min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* TOPBAR */}
        <header className="px-4 sm:px-6 lg:px-10 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">Dashboard Redzone</h1>
            <p className="text-sm text-gray-500 mt-1">
              Pantau koordinat laporan aktif warga di Kota Batam secara berdampingan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full px-5 py-3 pr-12 text-sm focus:outline-none w-full sm:w-auto"
              >
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
                <option>1 Tahun</option>
              </select>
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-10 pb-10">
          {/* SUMMARY STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-[28px] border border-[#edf3ee] p-6">
              <p className="text-sm text-gray-500">Total Area Terdeteksi</p>
              <h2 className="text-3xl font-black mt-2 text-black">{loading ? "..." : `${totalAreaRedzone} Area`}</h2>
            </div>
            <div className="bg-white rounded-[28px] border border-[#edf3ee] p-6">
              <p className="text-sm text-gray-500">Area Risiko Tinggi</p>
              <h2 className="text-3xl font-black mt-2 text-red-600">{loading ? "..." : `${highRiskAreas} Area`}</h2>
            </div>
            <div className="bg-white rounded-[28px] border border-[#edf3ee] p-6 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">Total Semua Laporan</p>
              <h2 className="text-3xl font-black mt-2 text-[#51a750]">{loading ? "..." : totalReportsCount.toLocaleString("id-ID")}</h2>
            </div>
          </div>

          {/* UTILITY LOG LOADING/ERROR */}
          {loading && <div className="text-center py-10 text-gray-500 text-sm animate-pulse">Mengambil statistik database geospasial...</div>}
          {error && <div className="text-center py-6 text-red-500 text-sm bg-red-50 border border-red-100 rounded-2xl mb-6">⚠️ Gagal sinkronisasi peta: {error}</div>}

          {/* SYSTEM INTERAKTIF: LAYOUT SEBELAH SEBELAHAN 🌟 */}
          {!loading && !error && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-8">
              
              {/* SISI KIRI: MAP VIEW CONTAINER */}
              <div className="bg-white rounded-[30px] border border-[#edf3ee] p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-black">Peta Sebaran Laporan</h2>
                    {/* LEGEND BADGE */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> High</div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium</div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Low</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pin lokasi asli dari data laporan masuk.</p>
                </div>

                <div className="h-[400px] xl:h-[490px] rounded-[24px] overflow-hidden border border-[#e5f1e7] relative z-10">
                  <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="w-full h-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController center={mapCenter} zoom={mapZoom} />

                    {reports.map((report, idx) => {
                      if (!report.location?.latitude || !report.location?.longitude) return null;
                      const lat = parseFloat(report.location.latitude);
                      const lng = parseFloat(report.location.longitude);
                      const currentStatus = report.status?.toLowerCase() || "pending";
                      const fullSrc = `https://hamameyu.infinitelearningstudent.id${report.images?.[0]}`;
                      const keyId = report.id || idx;

                      return (
                        <Marker 
                          key={keyId} 
                          position={[lat, lng]} 
                          icon={createCustomIcon(report.priority)}
                          ref={(el) => { if (el) markerRefs.current[keyId] = el; }}
                        >
                          <Popup>
                            <div className="p-1 font-sans text-black min-w-[200px] max-w-[240px]">
                              {report.images && report.images.length > 0 ? (
                                <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100 cursor-pointer relative">
                                  <img
                                    src={fullSrc}
                                    alt={report.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onClick={() => {
                                      setSelectedImg(fullSrc);
                                      setIsModalOpen(true);
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-20 rounded-xl mb-2 bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                                  Tidak ada foto bukti
                                </div>
                              )}

                              <div className="flex gap-1 items-center">
                                <span className="bg-gray-100 text-gray-700 font-mono text-[9px] px-1.5 py-0.5 rounded">ID: {report.id}</span>
                                {report.isSpecialConcern && (
                                  <span className="bg-red-100 text-red-600 font-bold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-tight">Special Concern</span>
                                )}
                              </div>

                              <h4 className="font-bold text-xs border-b pb-1 mt-1 mb-1 text-gray-900 truncate">
                                <Link to={`/admin/reports/${report.id}`} state={{ from: "/admin/map-redzone" }} className="text-black hover:text-[#51a750] block">
                                  {report.title}
                                </Link>
                              </h4>

                              <p className="text-[11px] text-gray-600 m-0">Kategori: <span className="font-medium text-black">{getCategoryLabel(report.category)}</span></p>
                              <p className="text-[11px] text-gray-600 m-0">Prioritas: <span className={`font-bold ${report.priority?.toLowerCase() === "high" ? "text-red-600" : report.priority?.toLowerCase() === "medium" ? "text-amber-600" : "text-blue-600"}`}>{report.priority || "low"}</span></p>
                              <p className="text-[11px] text-gray-600 m-0 mb-2">Status: <span className="font-medium text-gray-800 uppercase">{currentStatus}</span></p>

                              <div className="mt-1 pt-1.5 border-t border-gray-100 flex justify-center">
                                {currentStatus === "pending" && (
                                  <button onClick={() => handleStatusChange(report.id, "processing")} className="w-full bg-blue-600 text-white text-[11px] py-1 rounded font-semibold text-center">Proses</button>
                                )}
                                {currentStatus === "processing" && (
                                  <button onClick={() => handleStatusChange(report.id, "done")} className="w-full bg-green-600 text-white text-[11px] py-1 rounded font-semibold text-center">Selesaikan</button>
                                )}
                                {currentStatus === "done" && (
                                  <span className="text-gray-400 italic text-[11px] py-0.5 block text-center">✓ Selesai</span>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>

              {/* SISI KANAN: TABEL DATA INDIVIDU & PAGINATION */}
              <div className="bg-white rounded-[30px] border border-[#edf3ee] p-4 sm:p-6 overflow-hidden h-full flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-black">Daftar Laporan Tiap Data</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Baris merah muda menandakan perhatian khusus (Special Concern).</p>
                    </div>
                    <div className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
                      {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, reports.length)} dari {reports.length} Data
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                          <th className="pb-3 font-medium">Judul Laporan</th>
                          <th className="pb-3 font-medium">Wilayah</th>
                          <th className="pb-3 font-medium">Prioritas</th>
                          <th className="pb-3 font-medium text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentReports.map((report, index) => {
                          const reportKey = report.id || index;
                          return (
                            <tr 
                              key={reportKey} 
                              className={`border-b border-gray-50 transition text-xs ${
                                report.isSpecialConcern 
                                  ? "bg-red-50/70 hover:bg-red-100/80" 
                                  : "hover:bg-[#f8fcf8]"
                              }`}
                            >
                              <td className="py-3.5 max-w-[180px]">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1 rounded">#{report.id}</span>
                                    {report.isSpecialConcern && (
                                      <span className="text-[8px] font-extrabold bg-red-200 text-red-700 px-1 rounded uppercase tracking-tight">Special Concern</span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-black mt-0.5 truncate">{report.title}</span>
                                </div>
                              </td>
                              <td className="font-medium text-gray-600">
                                {getAreaFromCoordinates(report.location?.latitude, report.location?.longitude)}
                              </td>
                              <td>
                                <span className={`font-bold uppercase text-[10px] ${report.priority?.toLowerCase() === "high" ? "text-red-600" : report.priority?.toLowerCase() === "medium" ? "text-amber-600" : "text-blue-600"}`}>
                                  {report.priority || "low"}
                                </span>
                              </td>
                              <td className="text-center">
                                <button 
                                  onClick={() => handleFocusToMarker(reportKey, report.location?.latitude, report.location?.longitude)}
                                  className="bg-white border border-[#51a750] text-[#51a750] text-[11px] px-3 py-1.5 rounded-full font-bold hover:bg-[#51a750] hover:text-white transition shadow-sm"
                                >
                                  Lihat Map
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PAGINATION CONTROLLER */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-full font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    ← Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-7 h-7 rounded-full text-xs font-bold transition ${
                          currentPage === pageNumber ? "bg-[#51a750] text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-full font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    Next →
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TABEL AGREGASI DETAIL AREA REDZONE (DIPOSISIKAN DI PALING BAWAH) */}
          {!loading && !error && (
            <div className="hidden lg:block bg-white rounded-[30px] border border-[#edf3ee] p-6 overflow-hidden">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-black">Detail Ringkasan Area Redzone</h2>
                <p className="text-sm text-gray-500 mt-1">Statistik akumulasi laporan berdasarkan pembagian wilayah administratif terdekat.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-gray-100">
                      <th className="pb-4 font-medium">Wilayah</th>
                      <th className="pb-4 font-medium">Tingkat Risiko</th>
                      <th className="pb-4 font-medium">Jumlah Laporan</th>
                      <th className="pb-4 font-medium">Masalah Dominan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redzones.map((item, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-[#f8fcf8] transition">
                        <td className="py-4 font-semibold text-sm text-black">{item.area}</td>
                        <td>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getLevelStyle(item.level)}`}>
                            {item.level === "High" ? "Risiko Tinggi" : item.level === "Medium" ? "Risiko Sedang" : "Risiko Rendah"}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">{item.reports} laporan aktif</td>
                        <td className="text-sm text-gray-600">{item.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL POP-UP VIEW IMAGE CONTAINER */}
      <ViewImage
        isOpen={isModalOpen}
        src={selectedImg}
        alt="Detail Pratinjau Bukti Geospasial"
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}