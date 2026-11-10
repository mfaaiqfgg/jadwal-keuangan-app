import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CalendarDays, 
  Wallet, 
  LogOut, 
  CalendarPlus, 
  ListChecks,
  PiggyBank,
  BookOpen,
  ChevronRight,
  User
} from 'lucide-react';

const HomePage = ({ navigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    {
      title: 'Jadwal',
      icon: CalendarDays,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/25',
      description: 'Kelola jadwal & agenda Anda',
      subItems: [
        { 
          label: 'Jadwal Saya', 
          icon: ListChecks, 
          page: 'jadwalSaya',
          desc: 'Lihat semua jadwal aktif'
        },
        { 
          label: 'Masukkan Agenda', 
          icon: CalendarPlus, 
          page: 'masukkanAgenda',
          desc: 'Tambah jadwal baru'
        },
      ]
    },
    {
      title: 'Keuangan',
      icon: Wallet,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/25',
      description: 'Catat income & pengeluaran',
      subItems: [
        { 
          label: 'Catat Income & Pengeluaran', 
          icon: PiggyBank, 
          page: 'catatKeuangan',
          desc: 'Input transaksi baru'
        },
        { 
          label: 'Catatan Keuangan', 
          icon: BookOpen, 
          page: 'catatanKeuangan',
          desc: 'Lihat riwayat & ringkasan'
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-lg border-b border-slate-700/50 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-lg font-bold text-white">ML</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">MyLife Manager</h1>
              <p className="text-blue-300 text-xs">Kelola hidup lebih teratur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-slate-800/60 hover:bg-red-500/20 rounded-xl transition-all duration-200 group border border-slate-700/50"
            title="Logout"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-blue-500/50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user?.displayName || 'Pengguna'}
            </p>
            <p className="text-blue-300/70 text-xs truncate">{user?.email}</p>
          </div>
          <div className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full border border-green-500/30">
            Online
          </div>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="px-4 pt-6 space-y-5">
        {menuItems.map((menu) => {
          const MenuIcon = menu.icon;
          return (
            <div key={menu.title} className="animate-slide-up">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${menu.color} flex items-center justify-center ${menu.shadow} shadow-lg`}>
                  <MenuIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">{menu.title}</h2>
                  <p className="text-slate-400 text-xs">{menu.description}</p>
                </div>
              </div>

              {/* Sub Menu Items */}
              <div className="space-y-2">
                {menu.subItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.page}
                      onClick={() => navigate(item.page)}
                      className="w-full bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-sm border border-slate-700/40 hover:border-slate-600/60 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 group active:scale-[0.98]"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${menu.color} bg-opacity-20 flex items-center justify-center shrink-0`}>
                        <ItemIcon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white font-medium text-sm">{item.label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 px-4">
        <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
          <p className="text-slate-500 text-xs">
            💾 Data tersimpan otomatis di Google Sheets Anda
          </p>
        </div>
        <p className="text-slate-600 text-xs mt-3">© 2026 MyLife Manager v1.0</p>
      </div>
    </div>
  );
};

export default HomePage;

