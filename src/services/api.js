const BASE_URL = `/api`;

// ==========================================
// 1. REPORT SERVICE
// ==========================================
export const reportService = {
  // Create Report menggunakan FormData (mendukung upload gambar)
  createReport: async (formData) => {
    try {
      const response = await fetch(`${BASE_URL}/reports`, {
        method: "POST",
        credentials: "include", // Tetap wajib agar cookie token (JWT) kamu ikut terkirim
        body: formData, // Mengirim objek FormData
      });
      
      return await response.json();
    } catch (error) {
      console.error("Gagal membuat laporan di service:", error);
      return { success: false, message: "Terjadi kesalahan jaringan." };
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