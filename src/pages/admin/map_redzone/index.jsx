import { useEffect, useState, useMemo } from "react";
import { reportService } from "../../../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate, Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import aset gambar penanda (marker) default Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Sidebar from "../components/sidebar";
// Import komponen ViewImage untuk fitur pop-up gambar 🌟
import ViewImage from "../../../components/ViewImage";

// Fix bug ikon Leaflet default
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper untuk membuat Custom Icon berwarna berdasarkan prioritas laporan menggunakan SVG
const createCustomIcon = (priority) => {
  let color = "#3b82f6"; // Default Blue untuk Low
  if (priority?.toLowerCase() === "high") color = "#ef4444"; // Red
  if (priority?.toLowerCase() === "medium") color = "#f59e0b"; // Amber/Yellow

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

  // State untuk manajemen modal gambar 🌟
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");

  const batamCenterCoordinates = [1.1278, 104.0526];

  // Fungsi pembantu pemetaan wilayah & label
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
      const distance = Math.sqrt(
        Math.pow(latitude - area.lat, 2) + Math.pow(longitude - area.lng, 2),
      );
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
      case "WASTE":
        return "Pengelolaan Sampah";
      case "SIGNS_AND_MARKINGS":
        return "Rambu & Markah Jalan";
      case "PUBLIC_FACILITIES":
        return "Fasilitas Publik";
      case "ROAD_AND_SIDEWALK":
        return "Jalan & Trotoar Rusak";
      case "TREES_AND_GREEN_SPACE":
        return "Pohon & Ruang Terbuka";
      default:
        return category
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Fungsi utama fetching dan pemrosesan data wilayah risiko
  const fetchAndProcessData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();

      if (response && response.success) {
        const rawReports = response.data || [];
        setReports(rawReports);

        const groups = {};
        rawReports.forEach((report) => {
          const areaName = getAreaFromCoordinates(
            report.location?.latitude,
            report.location?.longitude,
          );

          if (!groups[areaName]) {
            groups[areaName] = {
              area: areaName,
              reportsCount: 0,
              categories: {},
            };
          }

          groups[areaName].reportsCount += 1;
          const catLabel = getCategoryLabel(report.category);
          groups[areaName].categories[catLabel] =
            (groups[areaName].categories[catLabel] || 0) + 1;
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

  // Fungsi Handler untuk Mengubah Status dari dalam Popup Map
  const handleStatusChange = async (id, newStatus) => {
    const confirmation = window.confirm(`Ubah status laporan ke ${newStatus}?`);
    if (!confirmation) return;

    const res = await reportService.updateStatus(id, newStatus);
    if (res.success) {
      alert("Status laporan berhasil diperbarui!");
      fetchAndProcessData(); // Re-fetch data agar peta & tabel langsung sinkron terupdate
    } else {
      alert("Gagal mengubah status laporan.");
    }
  };

  const totalAreaRedzone = redzones.length;
  const highRiskAreas = redzones.filter((z) => z.level === "High").length;
  const totalReportsCount = reports.length;

  const getLevelStyle = (level) => {
    switch (level) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-[#f6faf7] min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* TOPBAR */}
        <header className="px-4 sm:px-6 lg:px-10 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Peta Redzone
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pantau semua koordinat laporan aktif warga di Kota Batam secara real-time.
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
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                ▼
              </span>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-10 pb-10">
          {/* SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-[28px] border border-[#edf3ee] p-6">
              <p className="text-sm text-gray-500">Total Area Terdeteksi</p>
              <h2 className="text-3xl font-black mt-2 text-black">
                {loading ? "..." : `${totalAreaRedzone} Area`}
              </h2>
            </div>
            <div className="bg-white rounded-[28px] border border-[#edf3ee] p-6">
              <p className="text-sm text-gray-500">Area Risiko Tinggi</p>
              <h2 className="text-3xl font-black mt-2 text-red-600">
                {loading ? "..." : `${highRiskAreas} Area`}
              </h2>
            </div>
            <div className="bg-white rounded-[28px] border border-[#edf3ee] p-6 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">Total Semua Laporan</p>
              <h2 className="text-3xl font-black mt-2 text-[#51a750]">
                {loading ? "..." : totalReportsCount.toLocaleString("id-ID")}
              </h2>
            </div>
          </div>

          {/* MAP CONTAINER */}
          <div className="bg-white rounded-[30px] border border-[#edf3ee] p-4 sm:p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Peta Sebaran Laporan Individu
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Menampilkan pin lokasi asli dari setiap laporan yang dikirim warga.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-black">
                  <div className="w-3 h-3 rounded-full bg-red-500" /> Prioritas Tinggi (High)
                </div>
                <div className="flex items-center gap-2 text-black">
                  <div className="w-3 h-3 rounded-full bg-amber-500" /> Prioritas Sedang (Medium)
                </div>
                <div className="flex items-center gap-2 text-black">
                  <div className="w-3 h-3 rounded-full bg-blue-500" /> Prioritas Rendah (Low)
                </div>
              </div>
            </div>

            {/* MAP RENDERING AREA */}
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-[28px] overflow-hidden border border-[#e5f1e7] relative z-10">
              <MapContainer
                center={batamCenterCoordinates}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {!loading &&
                  !error &&
                  reports.map((report, idx) => {
                    if (!report.location?.latitude || !report.location?.longitude) return null;

                    const lat = parseFloat(report.location.latitude);
                    const lng = parseFloat(report.location.longitude);
                    const currentStatus = report.status?.toLowerCase() || "pending";
                    const fullSrc = `https://hamameyu.infinitelearningstudent.id${report.images?.[0]}`;

                    return (
                      <Marker
                        key={report.id || idx}
                        position={[lat, lng]}
                        icon={createCustomIcon(report.priority)}
                      >
                        <Popup>
                          <div className="p-1 font-sans text-black min-w-[200px] max-w-[240px]">
                            {report.images && report.images.length > 0 ? (
                              <div className="w-full h-28 rounded-xl overflow-hidden mb-2.5 bg-gray-100 border border-gray-100 cursor-pointer group relative">
                                <img
                                  src={fullSrc}
                                  alt={report.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                  loading="lazy"
                                  // Tambahkan event click untuk memicu modal pop-up ViewImage 🌟
                                  onClick={() => {
                                    setSelectedImg(fullSrc);
                                    setIsModalOpen(true);
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-24 rounded-xl mb-2.5 bg-gray-100 flex items-center justify-center text-gray-400 text-[11px]">
                                Tidak ada foto bukti
                              </div>
                            )}

                            <span className="bg-gray-100 text-gray-700 font-mono text-[10px] px-2 py-0.5 rounded">
                              ID: {report.id}
                            </span>

                            {/* JUDUL JADI LINK DIRECT KE DETAIL LAPORAN 🌟 */}
                            <h4 className="font-bold text-sm border-b pb-1 mt-1.5 mb-1 text-gray-900 truncate">
                              <Link 
                                to={`/admin/reports/${report.id}`} 
                                state={{ from: "/admin/map-redzone" }}
                                className="text-black hover:text-[#51a750] hover:underline transition-all block"
                              >
                                {report.title}
                              </Link>
                            </h4>

                            <p className="text-xs text-gray-600 m-0 leading-relaxed">
                              Kategori:{" "}
                              <span className="font-medium text-black">
                                {getCategoryLabel(report.category)}
                              </span>
                            </p>

                            <p className="text-xs text-gray-600 m-0 leading-relaxed">
                              Prioritas:{" "}
                              <span
                                className={`font-bold ${
                                  report.priority?.toLowerCase() === "high"
                                    ? "text-red-600"
                                    : report.priority?.toLowerCase() === "medium"
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {report.priority || "low"}
                              </span>
                            </p>

                            <p className="text-xs text-gray-600 m-0 mb-3 leading-relaxed">
                              Status:{" "}
                              <span className="font-medium text-gray-800 uppercase text-[11px]">
                                {currentStatus}
                              </span>
                            </p>

                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-center">
                              {currentStatus === "pending" && (
                                <button
                                  onClick={() => handleStatusChange(report.id, "processing")}
                                  className="w-full bg-blue-600 text-white text-xs py-1.5 rounded shadow hover:bg-blue-700 transition font-semibold text-center"
                                >
                                  Proses Laporan
                                </button>
                              )}
                              {currentStatus === "processing" && (
                                <button
                                  onClick={() => handleStatusChange(report.id, "done")}
                                  className="w-full bg-green-600 text-white text-xs py-1.5 rounded shadow hover:bg-green-700 transition font-semibold text-center"
                                >
                                  Selesaikan
                                </button>
                              )}
                              {currentStatus === "done" && (
                                <span className="text-gray-400 italic text-xs py-1 block text-center">
                                  ✓ Laporan Selesai
                                </span>
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

          {/* STATES METRICS UTILITY */}
          {loading && (
            <div className="text-center py-10 text-gray-500 text-sm animate-pulse">
              Mengambil statistik geospasial database...
            </div>
          )}
          {error && (
            <div className="text-center py-6 text-red-500 text-sm bg-red-50 border border-red-100 rounded-2xl">
              ⚠️ Gagal sinkronisasi peta: {error}
            </div>
          )}

          {/* MOBILE CARD VIEW */}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-4 lg:hidden mb-8">
              {redzones.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#edf3ee] rounded-[24px] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-black text-base">
                        {item.area}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Masalah: {item.issue}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getLevelStyle(item.level)}`}
                    >
                      {item.level === "High"
                        ? "Risiko Tinggi"
                        : item.level === "Medium"
                          ? "Risiko Sedang"
                          : "Risiko Rendah"}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Jumlah Laporan</p>
                      <h4 className="text-xl font-black text-black mt-1">
                        {item.reports} Laporan
                      </h4>
                    </div>
                    <button className="bg-[#eef9f0] text-[#51a750] text-sm px-5 py-3 rounded-full font-semibold">
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DESKTOP TABLE VIEW */}
          {!loading && !error && (
            <div className="hidden lg:block bg-white rounded-[30px] border border-[#edf3ee] p-6 overflow-hidden">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">
                  Detail Area Redzone
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Statistik akumulasi laporan aktif berdasarkan wilayah administratif terdekat.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-gray-100">
                      <th className="pb-4 font-medium">Wilayah</th>
                      <th className="pb-4 font-medium">Tingkat Risiko</th>
                      <th className="pb-4 font-medium">Jumlah Laporan</th>
                      <th className="pb-4 font-medium">Masalah Dominan</th>
                      <th className="pb-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redzones.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 hover:bg-[#f8fcf8] transition"
                      >
                        <td className="py-5 font-semibold text-sm text-black">
                          {item.area}
                        </td>
                        <td>
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getLevelStyle(item.level)}`}
                          >
                            {item.level === "High"
                              ? "Risiko Tinggi"
                              : item.level === "Medium"
                                ? "Risiko Sedang"
                                : "Risiko Rendah"}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">
                          {item.reports} laporan aktif
                        </td>
                        <td className="text-sm text-gray-600">{item.issue}</td>
                        <td>
                          <button className="bg-[#eef9f0] text-[#51a750] text-xs px-4 py-2 rounded-full font-semibold hover:scale-105 transition">
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL POP-UP VIEW IMAGE CONTAINER 🌟 */}
      <ViewImage
        isOpen={isModalOpen}
        src={selectedImg}
        alt="Detail Pratinjau Bukti Geospasial"
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}