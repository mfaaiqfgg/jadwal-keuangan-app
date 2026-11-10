import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getJadwalList, deleteJadwal } from '../services/googleSheets';
import { 
  ArrowLeft, 
  ListChecks, 
  Repeat, 
  CalendarDays, 
  CalendarCheck, 
  Clock, 
  Trash2, 
  Loader2,
  CalendarX,
  RefreshCw,
  CalendarPlus
} from 'lucide-react';

const JadwalSaya = ({ navigate }) => {
  const { user } = useAuth();
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua'); // semua, setiap_hari, hari_tertentu, sekali

  const fetchJadwal = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getJadwalList(user);
      // Filter hanya yang aktif
      setJadwalList(list.filter(j => j.status === 'aktif'));
    } catch (err) {
      setError(err.message || 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return;
    setDeletingId(id);
    try {
      await deleteJadwal(user, id);
      setJadwalList(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      setError('Gagal menghapus jadwal');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredList = filter === 'semua' 
    ? jadwalList 
    : jadwalList.filter(j => j.tipePengulangan === filter);

  const getTipeIcon = (tipe) => {
    switch(tipe) {
      case 'setiap_hari': return <Repeat size={14} className="text-blue-400" />;
      case 'hari_tertentu': return <CalendarDays size={14} className="text-purple-400" />;
      default: return <CalendarCheck size={14} className="text-amber-400" />;
    }
  };

  const getTipeLabel = (tipe) => {
    switch(tipe) {
      case 'setiap_hari': return 'Setiap Hari';
      case 'hari_tertentu': return 'Hari Tertentu';
      default: return 'Sekali';
    }
  };

  const getTipeBadgeColor = (tipe) => {
    switch(tipe) {
      case 'setiap_hari': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'hari_tertentu': return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default: return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  const filters = [
    { value: 'semua', label: 'Semua' },
    { value: 'setiap_hari', label: 'Harian' },
    { value: 'hari_tertentu', label: 'Mingguan' },
    { value: 'sekali', label: 'Sekali' },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-lg border-b border-slate-700/50 px-4 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('home')}
              className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all border border-slate-700/50"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <ListChecks size={22} className="text-blue-400" />
              <div>
                <h1 className="text-lg font-bold text-white">Jadwal Saya</h1>
                <p className="text-blue-300/70 text-xs">{jadwalList.length} jadwal aktif</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchJadwal}
            disabled={loading}
            className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all border border-slate-700/50"
          >
            <RefreshCw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:bg-slate-700/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-blue-400 mb-3" />
            <p className="text-slate-400 text-sm">Memuat jadwal...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CalendarX size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-sm mb-1">Belum ada jadwal</p>
            <p className="text-slate-500 text-xs mb-4">Mulai dengan menambahkan agenda baru</p>
            <button
              onClick={() => navigate('masukkanAgenda')}
              className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl text-sm border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <CalendarPlus size={16} />
              Tambah Agenda
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((jadwal, index) => (
              <div
                key={jadwal.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">{jadwal.nama}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Tipe Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getTipeBadgeColor(jadwal.tipePengulangan)}`}>
                        {getTipeIcon(jadwal.tipePengulangan)}
                        {getTipeLabel(jadwal.tipePengulangan)}
                      </span>

                      {/* Jam */}
                      {jadwal.jam && jadwal.jam !== '-' && (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                          <Clock size={12} />
                          {jadwal.jam}
                        </span>
                      )}
                    </div>

                    {/* Tanggal/Hari Info */}
                    <p className="text-slate-500 text-xs mt-2">
                      {jadwal.tipePengulangan === 'setiap_hari' && '🔄 Berlaku setiap hari'}
                      {jadwal.tipePengulangan === 'hari_tertentu' && `📅 ${jadwal.hari}`}
                      {jadwal.tipePengulangan === 'sekali' && `📌 ${jadwal.tanggal}`}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(jadwal.id)}
                    disabled={deletingId === jadwal.id}
                    className="p-2 bg-slate-700/50 hover:bg-red-500/20 rounded-lg transition-all group shrink-0"
                  >
                    {deletingId === jadwal.id ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : (
                      <Trash2 size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalSaya;

