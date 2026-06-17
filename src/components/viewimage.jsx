export default function ViewImage({ isOpen, src, alt, onClose }) {
  // Jika modal tidak aktif (false), jangan rendar apa-apa
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300 animate-fadeIn"
      onClick={onClose} // Klik di luar gambar untuk menutup pop-up
    >
      {/* Container Gambar */}
      <div 
        className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat gambar di-klik
      >
        {/* Tombol Close Silang */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 text-xl font-bold"
          aria-label="Close preview"
        >
          ✕
        </button>

        {/* Gambar Ukuran Penuh */}
        <img
          src={src}
          alt={alt || "Pratinjau Gambar"}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none animate-scaleUp"
        />
      </div>
    </div>
  );
}