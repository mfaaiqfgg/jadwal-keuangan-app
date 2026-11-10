import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addJadwal } from '../services/googleSheets';
import { 
  ArrowLeft, 
  CalendarPlus, 
  Clock, 
  Calendar, 
  Type, 
  Repeat, 
  CalendarDays,
  CalendarCheck,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const HARI_LIST = [
  { value: 'Senin', label: 'Sen' },
  { value: 'Selasa', label: 'Sel' },
  { value: 'Rabu', label: 'Rab' },
  { value: 'Kamis', label: 'Kam' },
  { value: 'Jumat', label: 'Jum' },
  { value: 'Sabtu', label: 'Sab' },
  { value: 'Minggu', label: 'Min' },
];

const MasukkanAgenda = ({ navigate }) => {
  const { user } = useAuth();
  const [nama, setNama] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [tipePengulangan, setTipePengulangan] = useState('sekali');
  const [selectedHari, setSelectedHari] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleHari = (hari) => {
    setSelectedHari(prev => 
      prev.includes(hari) 
        ? prev.filter(h => h !== hari) 
        : [...prev, hari]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!nama.trim()) {
      setError('Nama agenda harus diisi');
      return;
    }

    if (tipePengulangan === 'sekali' && !tanggal) {
      setError('Tanggal harus dipilih untuk agenda satu kali');
      return;
    }

    if (tipePengulangan === 'hari_tertentu' && selectedHari.length === 0) {
      setError('Pilih minimal satu hari');
      return;
    }

    setLoading(true);
    try {
      await addJadwal(user, {
        nama: nama.trim(),
        tanggal: tipePengulangan === 'setiap_hari' ? 'Setiap Hari' : 
                 tipePengulangan === 'hari_tertentu' ? 'Hari Tertentu' : tanggal,
        jam: jam || '-',
        tipePengulangan,
        hari: tipePengulangan === 'hari_tertentu' ? selectedHari.join(', ') : 
              tipePengulangan === 'setiap_hari' ? 'Setiap Hari' : '-',
      });
      setSuccess(true);
      // Reset form
      setNama('');
      setTanggal('');
      setJam('');
      setTipePengulangan('sekali');
      setSelectedHari([]);
      // Auto hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan agenda');
    } finally {
      setLoading(false);
    }
  };

  const tipeOptions = [
    { 
      value: 'setiap_hari', 
      label: 'Setiap Hari', 
      icon: Repeat,
      desc: 'Berlaku setiap hari',
      color: 'blue'
    },
    { 
      value: 'hari_tertentu', 
      label: 'Hari Tertentu', 
      icon: CalendarDays,
      desc: 'Pilih hari-hari tertentu',
      color: 'purple'
    },
    { 
      value: 'sekali', 
      label: 'Saat Itu Saja', 
      icon: CalendarCheck,
      desc: 'Hanya pada tanggal tertentu',
      color: 'amber'
    },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-lg border-b border-slate-700/50 px-4 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('home')}
            className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all border border-slate-700/50"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarPlus size={22} className="text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Masukkan Agenda</h1>
              <p className="text-blue-300/70 text-xs">Tambah jadwal baru</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* Success Message */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm">Agenda berhasil disimpan! ✨</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Agenda */}
          <div className="animate-fade-in">
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <Type size={16} />
              Nama Agenda
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Rapat Tim, Olahraga, Kuliah..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          {/* Tipe Pengulangan */}
          <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-3">
              <Repeat size={16} />
              Tipe Pengulangan
            </label>
            <div className="space-y-2">
              {tipeOptions.map(opt => {
                const OptIcon = opt.icon;
                const isActive = tipePengulangan === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTipePengulangan(opt.value)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                      isActive 
                        ? 'bg-blue-500/15 border-blue-500/50 ring-1 ring-blue-500/30' 
                        : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                    }`}>
                      {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <OptIcon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilih Hari (untuk tipe hari_tertentu) */}
          {tipePengulangan === 'hari_tertentu' && (
            <div className="animate-fade-in">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-3">
                <CalendarDays size={16} />
                Pilih Hari
              </label>
              <div className="flex flex-wrap gap-2">
                {HARI_LIST.map(hari => {
                  const isSelected = selectedHari.includes(hari.value);
                  return (
                    <button
                      key={hari.value}
                      type="button"
                      onClick={() => toggleHari(hari.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/40 hover:bg-slate-700/50'
                      }`}
                    >
                      {hari.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tanggal (untuk tipe sekali) */}
          {tipePengulangan === 'sekali' && (
            <div className="animate-fade-in">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                <Calendar size={16} />
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm [color-scheme:dark]"
              />
            </div>
          )}

          {/* Jam */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <Clock size={16} />
              Jam <span className="text-slate-500 font-normal">(opsional)</span>
            </label>
            <input
              type="time"
              value={jam}
              onChange={(e) => setJam(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm [color-scheme:dark]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CalendarPlus size={20} />
                Simpan Agenda
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MasukkanAgenda;

