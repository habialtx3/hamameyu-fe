import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
// Import React Leaflet & Leaflet Core untuk penentuan lokasi granular
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import aset gambar marker default agar tidak pecah/hilang saat di-render
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { reportService } from "../../../services/api";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// FUNGSI: Kompres gambar otomatis di browser
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, "image/jpeg", 0.7);
      };
    };
  });
};

export default function ReportSubmissionPage() {
  const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
} = useForm({
  defaultValues: {
    priority: "medium",
    category: "",
  },
});

  const watchedImages = watch("images");
  const [mapCoords, setMapCoords] = useState({
    lat: 1.1278,
    lng: 104.0526,
  });
  
  // 🌟 TAMBAHKAN STATE LOADING AGAR USER TAHU PROSES SEDANG BERJALAN
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const CATEGORY_OPTIONS = [
    { value: "WASTE", label: "Sampah", icon: "🗑️" },
    { value: "SIGNS_AND_MARKINGS", label: "Rambu & Markah Jalan", icon: "🚧" },
    { value: "PUBLIC_FACILITIES", label: "Fasilitas Publik", icon: "🏢" },
    { value: "ROAD_AND_SIDEWALK", label: "Jalan & Trotoar Rusak", icon: "🛣️" },
    { value: "TREES_AND_GREEN_SPACE", label: "Pohon & Ruang Hijau", icon: "🌳" },
  ];

  const backPath = location.state?.from || "/";

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMapCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={[mapCoords.lat, mapCoords.lng]} />;
  };

  const onSubmit = async (data) => {
    if (!data.category) {
      alert("Silakan pilih kategori laporan terlebih dahulu.");
      return;
    }

    // Aktifkan loading & disable tombol
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    formData.append("location[latitude]", parseFloat(mapCoords.lat.toFixed(6)));
    formData.append("location[longitude]", parseFloat(mapCoords.lng.toFixed(6)));
    // Tambahkan field time_report dalam format ISO String untuk kebutuhan API AI
    formData.append("time_report", new Date().toISOString());

    if (data.images && data.images.length > 0) {
      const filesToUpload = Array.from(data.images).slice(0, 2);
      
      for (const file of filesToUpload) {
        if (file.size > 1024 * 1024) {
          const compressed = await compressImage(file);
          formData.append("images", compressed);
        } else {
          formData.append("images", file);
        }
      }
    }

    try {
      // Tembak API (Pengecekan duplikat AI & post data terjadi di dalam service ini)
      const result = await reportService.createReport(formData);

      if (result.success) {
        alert("Laporan Anda berhasil dikirim ke sistem aduan warga.");
        navigate(backPath);
      } else {
        alert(result.message || "Gagal mengirimkan laporan.");
      }
    } catch (error) {
      console.error("Error saat submit FormData:", error);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      // Matikan loading setelah selesai (baik sukses maupun gagal)
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-800">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white px-4 sm:px-6 md:px-8 py-4 flex items-center text-gray-600 shrink-0">
        <button
          onClick={() => navigate(backPath)}
          disabled={isSubmitting}
          className="flex items-center hover:text-black transition font-medium text-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
      </header>

      {/* CONTENT FORM */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* SISI KIRI: FORM DATA */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* JUDUL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Judul Laporan
                </label>
                <input
                  {...register("title", { required: "Judul laporan wajib diisi" })}
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Contoh: Tumpukan Sampah di Depan Gerbang Kompleks"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100 disabled:bg-gray-100"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title.message}</p>
                )}
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Deskripsi / Detail Kejadian
                </label>
                <textarea
                  {...register("description", { required: "Deskripsi kejadian wajib diisi" })}
                  rows="6"
                  disabled={isSubmitting}
                  placeholder="Jelaskan detail masalah..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm resize-none outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100 disabled:bg-gray-100"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.description.message}</p>
                )}
              </div>

              {/* GROUP SELECT: PRIORITAS & KATEGORI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Tingkat Prioritas
                  </label>
                  <select
                    {...register("priority")}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100 disabled:bg-gray-100"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="high">Tinggi / Mendesak (High)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Kategori Aduan Masalah
                  </label>
                  <select
                    {...register("category", { required: "Silakan pilih salah satu kategori" })}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100 disabled:bg-gray-100"
                  >
                    <option value="">Pilih kategori laporan</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.icon} {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* BUTTON SUBMIT DENGAN INDIKATOR LOADING */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-[#51a750] text-[#eef9f0] py-4 font-semibold hover:opacity-90 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memeriksa & Mengirim Laporan...
                    </>
                  ) : (
                    "Kirim Laporan Resmi Warga"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* SISI KANAN: MEDIA BUKTI & TITIK KOORDINAT */}
          <div className="w-full xl:w-96 flex flex-col gap-6">
            {/* FILE IMAGE UPLOAD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-black mb-3">Foto Lampiran Bukti (Maks 2)</h3>
              <div className={`relative border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 p-6 flex flex-col items-center justify-center text-center ${isSubmitting ? 'opacity-50 pointer-events-none' : 'hover:border-black transition-all'}`}>
                <div className="w-16 h-16 bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-gray-500 text-xs">
                  <p className="font-medium">Klik untuk pilih gambar</p>
                  <p className="text-[10px] mt-1 text-gray-400">Format JPEG/PNG hingga 2 file (Maks 2MB/file)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isSubmitting}
                  {...register("images")}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>

              {/* List Nama Gambar Terpilih */}
              {watchedImages && watchedImages.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 mb-1">File Terpilih:</p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    {Array.from(watchedImages)
                      .slice(0, 2)
                      .map((file, idx) => (
                        <li key={idx} className="truncate">
                          {file.name}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* LEAFLET GEOLOCATION PICKER */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-black">Tandai Lokasi Masalah</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Geser atau klik peta tepat pada posisi kejadian.</p>
              </div>
              <div className={`w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 relative z-10 ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}>
                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={14} className="w-full h-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              </div>
              <div className="mt-3 flex gap-2 text-[11px] font-mono text-gray-500 justify-between bg-gray-50 p-2 rounded-lg border">
                <span>Lat: {mapCoords.lat.toFixed(5)}</span>
                <span>Lng: {mapCoords.lng.toFixed(5)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}