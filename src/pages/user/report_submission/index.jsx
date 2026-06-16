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

// 🌟 FUNGSI BARU: Kompres gambar otomatis di browser agar ukurannya di bawah 1MB (Lolos Nginx 413)
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024; // Batasi resolusi maksimal lebar 1024px agar file ringan
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
        }, "image/jpeg", 0.7); // Mengompres kualitas hingga 70% (Ukuran file turun drastis)
      };
    };
  });
};

export default function ReportSubmissionPage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      priority: "medium",
      category: "",
    },
  });

  // Ambil state untuk preview nama file gambar yang diunggah
  const watchedImages = watch("images");

  const [mapCoords, setMapCoords] = useState({
    lat: 1.1278, // Titik default awal: Batam Centre
    lng: 104.0526,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const CATEGORY_OPTIONS = [
    { value: "WASTE", label: "Sampah", icon: "🗑️" },
    { value: "SIGNS_AND_MARKINGS", label: "Rambu & Markah Jalan", icon: "🚧" },
    { value: "PUBLIC_FACILITIES", label: "Fasilitas Publik", icon: "🏢" },
    { value: "ROAD_AND_SIDEWALK", label: "Jalan & Trotoar Rusak", icon: "🛣️" },
    { value: "TREES_AND_GREEN_SPACE", label: "Pohon & Ruang Hijau", icon: "🌳" },
  ];

  console.log("Input bermasalah saat ini:", errors);
  const backPath = location.state?.from || "/";

  // Komponen pembantu internal Leaflet untuk menangkap aksi klik user di atas peta
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMapCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={[mapCoords.lat, mapCoords.lng]} />;
  };

  const onSubmit = async (data) => {
    // 1. Validasi dasar agar user memilih kategori
    if (!data.category) {
      alert("Silakan pilih kategori laporan terlebih dahulu.");
      return;
    }

    // 2. Susun payload dalam bentuk FormData
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    formData.append("location[latitude]", parseFloat(mapCoords.lat.toFixed(6)));
    formData.append("location[longitude]", parseFloat(mapCoords.lng.toFixed(6)));

    // 🌟 SEKARANG DIGANTI ASYNC LOOP UNTUK PROSES KOMPRESI GAMBAR
    if (data.images && data.images.length > 0) {
      const filesToUpload = Array.from(data.images).slice(0, 2);
      
      for (const file of filesToUpload) {
        // Jika file berukuran besar (di atas 1MB), kompres otomatis sebelum masuk FormData
        if (file.size > 1024 * 1024) {
          const compressed = await compressImage(file);
          formData.append("images", compressed);
        } else {
          formData.append("images", file);
        }
      }
    }

    try {
      // 3. Tembak API menggunakan reportService
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-800">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white px-4 sm:px-6 md:px-8 py-4 flex items-center text-gray-600 shrink-0">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center hover:text-black transition font-medium text-sm"
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
                  placeholder="Contoh: Tumpukan Sampah di Depan Gerbang Kompleks"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title.message}</p>
                )}
              </div>

              {/* DESKRIPSI (DESCRIPTION) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Deskripsi / Detail Kejadian
                </label>
                <textarea
                  {...register("description", { required: "Deskripsi kejadian wajib diisi" })}
                  rows="6"
                  placeholder="Jelaskan detail masalah..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm resize-none outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.description.message}</p>
                )}
              </div>

              {/* GROUP SELECT: PRIORITAS & KATEGORI (SUDAH DIPERBAIKI 🌟) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* TINGKAT PRIORITAS */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Tingkat Prioritas
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="high">Tinggi / Mendesak (High)</option>
                  </select>
                </div>

                {/* KATEGORI LAPORAN */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Kategori Aduan Masalah
                  </label>
                  <select
                    {...register("category", { required: "Silakan pilih salah satu kategori" })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-black focus:ring-4 focus:ring-gray-100"
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

              {/* BUTTON SUBMIT */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#51a750] text-[#eef9f0] py-4 font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  Kirim Laporan Resmi Warga
                </button>
              </div>
            </form>
          </div>

          {/* SISI KANAN: MEDIA BUKTI & TITIK KOORDINAT GEOSPASIAL */}
          <div className="w-full xl:w-96 flex flex-col gap-6">
            {/* FILE IMAGE UPLOAD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-black mb-3">Foto Lampiran Bukti (Maks 2)</h3>

              <div className="relative border-2 border-dashed border-gray-200 hover:border-black transition-all rounded-2xl bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
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
                  {...register("images")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
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

              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 relative z-10">
                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={14} className="w-full h-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              </div>

              {/* Log Informasi Koordinat Aktual */}
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