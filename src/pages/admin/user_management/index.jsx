import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/sidebar";
import { userService } from "../../../services/api"; // Memanggil userService dari api.js kamu

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Pagination Konsep Kamu
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ambil data user dari backend saat halaman dimuat
  useEffect(() => {
    fetchUserData();
  }, []);

  // Reset ke halaman 1 setiap kali user mengetik di kolom pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengubah status role (resident <-> admin)
  const handleRoleChange = async (id, currentRole) => {
    const targetRole = currentRole === "admin" ? "resident" : "admin";
    const confirmation = window.confirm(
      `Apakah Anda yakin ingin mengubah role user ini menjadi ${targetRole.toUpperCase()}?`
    );
    if (!confirmation) return;

    try {
      const res = await userService.updateUserRole(id, targetRole);
      if (res.success) {
        alert("Role user berhasil diperbarui!");
        fetchUserData(); // Refresh data tabel setelah sukses
      } else {
        alert("Gagal memperbarui role.");
      }
    } catch (error) {
      alert("Terjadi kesalahan server.");
      console.error(error);
    }
  };

  // Logika pencarian user berdasarkan nama, username, atau email
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(search) ||
        user.username?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    });
  }, [users, searchTerm]);

  // Statistik ringkas untuk User Management Dashboard
  const stats = useMemo(() => {
    return filteredUsers.reduce(
      (acc, user) => {
        if (user.role_name === "admin") acc.adminCount += 1;
        if (user.role_name === "resident") acc.residentCount += 1;
        return acc;
      },
      { adminCount: 0, residentCount: 0 }
    );
  }, [filteredUsers]);

  // --- VARIABEL KALKULASI PAGINATION (Sesuai Struktur Kamu) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Potong data user untuk ditampilkan per halaman
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredUsers, indexOfFirstItem, indexOfLastItem]);

  return (
    <div className="bg-[#f6faf7] min-h-screen lg:flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {/* TOPBAR */}
        <header className="px-6 lg:px-10 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-black">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Atur hak akses warga dan pengelola aplikasi EnviReport.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <img
              src="https://placehold.co/44x44/e2f5e8/51a750?text=A"
              alt="Admin"
              className="w-11 h-11 rounded-full"
            />
          </div>
        </header>

        <div className="px-6 lg:px-10 pb-10">
          {/* HERO BRIEF */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#51a750] to-[#7bc96f] p-8 text-white mb-8">
            <div className="max-w-2xl relative z-10">
              <span className="uppercase tracking-widest text-xs font-semibold text-white/80">
                Manajemen Ketertiban
              </span>
              <h2 className="text-2xl lg:text-3xl font-black leading-tight mt-2 mb-2">
                Kontrol Penuh Hak Akses Admin RT/RW
              </h2>
              <p className="text-xs lg:text-sm text-white/90 leading-relaxed">
                Total data yang terfilter saat ini: <strong>{filteredUsers.length} User</strong> ({stats.adminCount} Admin, {stats.residentCount} Resident).
              </p>
            </div>
            <div className="absolute right-4 bottom-0 opacity-10 text-[140px] font-black select-none">
              👥
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl border border-[#edf3ee] p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari nama, username, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f6faf7] border border-gray-100 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#51a750]/20"
              />
            </div>
            <div className="flex gap-3 text-xs w-full sm:w-auto justify-end">
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
                {stats.adminCount} Total Admin
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                {stats.residentCount} Total Resident
              </span>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-[30px] border border-[#edf3ee] p-6 overflow-hidden">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-black">Daftar Pengguna</h2>
              <p className="text-xs text-gray-500">Klik aksi pada kolom kanan untuk menaikkan/turunkan hak akses.</p>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">Memuat data pengguna...</p>
              ) : paginatedUsers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Tidak ada pengguna yang cocok.</p>
              ) : (
                <>
                  <table className="w-full text-center border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                        <th className="pb-3 text-left pl-4">Nama Lengkap</th>
                        <th className="pb-3">Username</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3 text-center">Aksi Manajemen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition">
                          <td className="py-4 text-left pl-4 font-bold text-gray-800">
                            {user.name}
                          </td>
                          <td className="py-4 text-gray-600 font-mono">@{user.username}</td>
                          <td className="py-4 text-gray-600">{user.email}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              user.role_name === "admin" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {user.role_name}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleRoleChange(user.id, user.role_name)}
                              className={`px-3 py-1.5 rounded-xl shadow-sm text-[11px] font-bold transition duration-200 ${
                                user.role_name === "admin"
                                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                                  : "bg-[#51a750] hover:bg-[#439242] text-white"
                              }`}
                            >
                              {user.role_name === "admin" ? "Turunkan ke Resident" : "Jadikan Admin"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* CONTROL PAGINATION DINAMIS SESUAI REQUEST */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} dari{" "}
                      {filteredUsers.length} pengguna ditemukan
                    </p>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#f5faf6] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed text-sm"
                      >
                        &larr;
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-10 h-10 rounded-full font-semibold text-sm transition ${
                            currentPage === pageNumber
                              ? "bg-[#51a750] text-white"
                              : "border border-gray-200 text-gray-500 hover:bg-[#f5faf6]"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button 
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-[#f5faf6] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed text-sm"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}