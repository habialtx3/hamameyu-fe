const BASE_URL = `/api`;

// ==========================================
// 1. REPORT SERVICE
// ==========================================
export const reportService = {
  // Create Report menggunakan FormData (mendukung upload gambar)
  // Create Report dengan proteksi AI Duplicate Checker
  createReport: async (formData) => {
    try {
      // 1. Ambil data kategori dan waktu
      const category = formData.get("category");
      const timeReport = formData.get("time_report") || new Date().toISOString();

      // 2. Ambil koordinat menggunakan key bracket persis seperti di Bruno
      const latRaw = formData.get("location[latitude]");
      const lngRaw = formData.get("location[longitude]");

      const latitude = latRaw ? parseFloat(latRaw) : 0;
      const longitude = lngRaw ? parseFloat(lngRaw) : 0;

      console.log("Data dikirim ke AI -> Lat:", latitude, "Lng:", longitude, "Cat:", category);

      // 3. Tembak API AI untuk cek duplikasi
      const aiUrl = "https://artnaaa-hamemayu-loka.hf.space/predict/bulk-duplicate";
      const aiResponse = await fetch(aiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_report: {
            time_report: timeReport,
            location: {
              latitude: latitude,
              longitude: longitude
            },
            category: category
          }
        })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();

        // 4. JIKA DUPLIKAT: Tambahkan imbuhan "-duplicate" pada field title di FormData
        if (aiResult.is_duplicate === true) {
          const originalTitle = formData.get("title") || "";
          formData.set("title", `${originalTitle}-duplicate`);
          console.log("⚠️ AI Mendeteksi Duplikat! Judul diubah menjadi:", formData.get("title"));
        } else {
          console.log("✅ Aman, AI menyatakan laporan bukan duplikat.");
        }
      } else {
        console.warn("Gagal terhubung ke AI Duplicate Checker, lanjut simpan laporan standar.");
      }

      // 5. Kirim data asli/termodifikasi ke API VPS Utama
      const response = await fetch(`${BASE_URL}/reports`, {
        method: "POST",
        credentials: "include",
        body: formData, // Browser otomatis setup boundary multipart form
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("RESPON ERROR ASLI DARI VPS:", errorText);
        return { success: false, message: `Server Error: ${response.status} - ${errorText}` };
      }

      return await response.json();
    } catch (error) {
      console.error("Gagal membuat laporan di service:", error);
      return { success: false, message: "Terjadi kesalahan jaringan atau server." };
    }
  },

  // Get All Reports
  getAllReports: async () => {
    try {
      const response = await fetch(`${BASE_URL}/reports`);
      if (!response.ok) throw new Error('Gagal mengambil semua laporan');
      return await response.json();
    } catch (error) {
      console.error(error);
      return { success: false, data: [] };
    }
  },

  // Update Report Status
  updateStatus: async (id, status) => {
    try {
      const response = await fetch(`${BASE_URL}/reports/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Gagal memperbarui status laporan');
      return await response.json();
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  },

  // Get Historical Reports (Untuk tren visualisasi data)
  getHistory: async (category, startTime, limit = 100) => {
    try {
      const response = await fetch(
        `${BASE_URL}/reports/history?category=${category}&start_time=${startTime}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Gagal mengambil riwayat laporan');
      return await response.json();
    } catch (error) {
      console.error(error);
      return { success: false, data: { report_count: 0, reports: {} } };
    }
  }
};

// ==========================================
// 2. USER SERVICE (BARU 🌟)
// ==========================================
export const userService = {
  // Ambil semua user untuk tabel manajemen admin
  getAllUsers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'GET',
        credentials: 'include' // 🌟 Wajib agar cookie token JWT ikut terkirim
      });
      if (!response.ok) throw new Error('Gagal mengambil daftar user');
      return await response.json();
    } catch (error) {
      console.error("Error di userService.getAllUsers:", error);
      return { success: false, data: [] };
    }
  },

  // Mengubah role user (admin <-> resident)
  updateUserRole: async (id, role) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 🌟 Wajib agar cookie token JWT ikut terkirim
        body: JSON.stringify({ role }), // Mengirim objek { "role": "admin" / "resident" }
      });
      if (!response.ok) throw new Error('Gagal memperbarui role user');
      return await response.json();
    } catch (error) {
      console.error("Error di userService.updateUserRole:", error);
      return { success: false, message: "Gagal memperbarui role." };
    }
  }
};