import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportService } from "../../../services/api"; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import aset gambar penanda (marker) default Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix bug ikon Leaflet default
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper Custom Icon berdasarkan prioritas
const createCustomIcon = (priority) => {
  let color = "#3b82f6"; // Low (Blue)
  if (priority?.toLowerCase() === "high") color = "#ef4444"; // High (Red)
  if (priority?.toLowerCase() === "medium") color = "#f59e0b"; // Medium (Amber)

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

// Komponen Pengendali Fokus Peta & Pemicu Popup Otomatis
function MapController({ activeReport }) {
  const map = useMap();

  useEffect(() => {
    if (activeReport && activeReport.location?.latitude && activeReport.location?.longitude) {
      const lat = parseFloat(activeReport.location.latitude);
      const lng = parseFloat(activeReport.location.longitude);
      
      // Geser titik tengah peta secara halus
      map.flyTo([lat, lng], 15, { duration: 1.5 });

      // Cari layer marker yang sesuai dan buka popup secara programmatik
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const markerLatLng = layer.getLatLng();
          if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
            setTimeout(() => {
              layer.openPopup();
            }, 1200); // Trigger popup setelah animasi perpindahan selesai
          }
        }
      });
    }
  }, [activeReport, map]);

  return null;
}

export default function MapReportPage() {
  const [reports, setReports] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("30 Hari Terakhir");
  
  // State interaksi peta dan pagination sidebar
  const [activeReport, setActiveReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const batamCenterCoordinates = [1.1278, 104.0526];

  // Pembersihan kata -duplicate atau -duplikat di akhir kalimat secara aman
  const getCleanTitle = (title) => {
    if (!title) return "";
    if (title.toLowerCase().endsWith("-duplicate")) return title.slice(0, -10);
    if (title.toLowerCase().endsWith("-duplikat")) return title.slice(0, -9);
    return title;
  };

  useEffect(() => {
    const fetchMapPageData = async () => {
      try {
        setLoading(true);
        const authResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          setCurrentUserId(authData.user?.id);
        }

        const responseJson = await reportService.getAllReports();
        if (responseJson && responseJson.success) {
          setReports(responseJson.data || []);
        } else if (Array.isArray(responseJson)) {
          setReports(responseJson);
        } else {
          throw new Error("Gagal memuat peta sebaran data");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error pada MapReportPage:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapPageData();
  }, []);

  // Perhitungan statistik dinamis
  const myReportsCount = currentUserId 
    ? reports.filter(r => r.user_id === currentUserId).length 
    : 0;

  const resolvedReportsCount = reports.filter(
    r => r.status?.toLowerCase() === "done" || r.status?.toLowerCase() === "selesai"
  ).length;

  // Logika Pagination per 4 data untuk List Nama Laporan di Sidebar
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReportsList = reports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-[#f6faf7] min-h-screen flex flex-col">
      
      {/* HEADER / TOPBAR */}
      <header className="px-4 sm:px-6 lg:px-10 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#edf3ee] bg-white">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-500 hover:text-black transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black">Peta Sebaran Laporan</h1>
            <p className="text-xs text-gray-500 mt-0.5">Pantau status penanganan fasilitas publik di sekitar tempat tinggalmu.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-10 text-xs font-medium focus:outline-none"
            >
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
              <option>All Time</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
          </div>

          <Link to="/reports/add" state={{ from: "/map-report" }}>
            <button className="bg-[#51a750] hover:bg-[#459144] text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-sm whitespace-nowrap">
              + Buat Laporan
            </button>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIDEBAR ANALYTICS & LIST PANEL */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          
          {/* CARD 1: Info Laporanku */}
          <div className="bg-white rounded-[24px] border border-[#edf3ee] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Laporan Saya</p>
              <h3 className="text-2xl font-black text-black mt-1">
                {loading ? "..." : `${myReportsCount} Laporan`}
              </h3>
              <span className="text-[11px] text-gray-400 block mt-1">Aduan aktif yang kamu kirim</span>
            </div>
            <div className="w-12 h-12 bg-green-50 text-[#51a750] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* CARD 2: Total Selesai Kota Batam */}
          <div className="bg-white rounded-[24px] border border-[#edf3ee] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Laporan Berhasil Ditangani</p>
              <h3 className="text-2xl font-black text-[#51a750] mt-1">
                {loading ? "..." : `${resolvedReportsCount} Selesai`}
              </h3>
              <span className="text-[11px] text-gray-400 block mt-1">Oleh tim respon cepat admin</span>
            </div>
            <div className="w-12 h-12 bg-[#eef9f0] text-[#51a750] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* CARD 3: LIST NAMA REPORTS DENGAN PAGINATION PER 4 */}
          <div className="bg-white rounded-[24px] border border-[#edf3ee] p-5 shadow-sm flex-1 flex flex-col justify-between min-h-[280px]">
            <div>
              <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-3">Daftar Berkas Nama Reports</h4>
              
              {loading ? (
                <p className="text-xs text-gray-400 animate-pulse py-4">Memuat nama berkas aduan...</p>
              ) : currentReportsList.length > 0 ? (
                <div className="space-y-2.5">
                  {currentReportsList.map((report, idx) => (
                    <div 
                      key={report.id || idx} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-gray-800 truncate m-0">
                          {getCleanTitle(report.title)}
                        </p>
                        <span className="text-[10px] text-gray-400">ID: #{report.id}</span>
                      </div>
                      
                      {report.location?.latitude && report.location?.longitude ? (
                        <button
                          onClick={() => setActiveReport(report)}
                          title="Fokuskan ke peta dan lihat detail"
                          className="p-1.5 bg-green-50 hover:bg-[#51a750] text-[#51a750] hover:text-white rounded-lg text-sm transition shrink-0 shadow-xs"
                        >
                          📍
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No GPS</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">Belum tersedia data laporan.</p>
              )}
            </div>

            {/* Navigasi Kecil Pagination Per 4 Item */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  ← Prev
                </button>
                <span className="text-[10px] text-gray-500 font-medium">Hal. {currentPage} dari {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

        </div>

        {/* MAP CONTAINER */}
        <div className="lg:col-span-2 bg-white rounded-[28px] border border-[#edf3ee] p-4 flex flex-col h-[500px] lg:h-auto min-h-[450px]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
            <span className="font-bold text-gray-700">Legenda Prioritas Kasus:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/> Tinggi</div>
              <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"/> Sedang</div>
              <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/> Rendah</div>
            </div>
          </div>

          {/* MAP RENDERING AREA */}
          <div className="flex-1 rounded-[22px] overflow-hidden border border-[#edf3ee] relative z-10">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                Memuat titik koordinat...
              </div>
            ) : (
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

                {/* Pasang Controller Aksi Klik Disini */}
                <MapController activeReport={activeReport} />

                {reports.map((report, idx) => {
                  if (!report.location?.latitude || !report.location?.longitude) return null;

                  const lat = parseFloat(report.location.latitude);
                  const lng = parseFloat(report.location.longitude);
                  const currentStatus = report.status?.toLowerCase() || "pending";

                  return (
                    <Marker
                      key={report.id || idx}
                      position={[lat, lng]}
                      icon={createCustomIcon(report.priority)}
                    >
                      <Popup>
                        <div className="p-1 font-sans text-black min-w-[210px] max-w-[250px]">
                          {report.images && report.images.length > 0 && (
                            <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100">
                              <img
                                src={`https://hamameyu.infinitelearningstudent.id${report.images[0]}`}
                                alt={report.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <h4 className="font-bold text-xs text-gray-900 truncate m-0">
                            {getCleanTitle(report.title)}
                          </h4>
                          <p className="text-[11px] text-gray-500 m-0 mt-1">
                            Status: <span className={`font-bold uppercase ${currentStatus === 'done' || currentStatus === 'selesai' ? 'text-green-600' : 'text-amber-500'}`}>{currentStatus}</span>
                          </p>

                          {/* Tombol rute dinamis /reports/:id */}
                          <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                            <Link 
                              to={`/reports/${report.id}`}
                              className="inline-block w-full bg-white hover:bg-gray-100 text-green-600 text-[10px] font-black py-1.5 px-3 rounded-md transition text-center"
                            >
                              Lihat Detail Selengkapnya →
                            </Link>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
          
          {error && (
            <p className="text-center text-xs text-red-500 mt-2">⚠️ Gagal memuat pin lokasi terbaru: {error}</p>
          )}
        </div>

      </div>
    </div>
  );
}