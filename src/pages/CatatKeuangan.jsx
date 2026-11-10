import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addKeuangan } from '../services/googleSheets';
import { 
  ArrowLeft, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';

const CatatKeuangan = ({ navigate }) => {
  const { user } = useAuth();
  const [tipe, setTipe] = useState('income');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const formatRupiah = (value) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleNominalChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setNominal(raw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!nominal || parseInt(nominal) === 0) {
      setError('Nominal harus diisi');
      return;
    }

    if (!keterangan.trim()) {
      setError('Keterangan harus diisi');
      return;
    }

    setLoading(true);
    try {
      await addKeuangan(user, {
        tipe,
        nominal: parseInt(nominal),
        keterangan: keterangan.trim(),
      });
      setSuccess(true);
      setNominal('');
      setKeterangan('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 backdrop-blur-lg border-b border-slate-700/50 px-4 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('home')}
            className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all border border-slate-700/50"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <PiggyBank size={22} className="text-emerald-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Catat Keuangan</h1>
              <p className="text-emerald-300/70 text-xs">Income & Pengeluaran</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* Success */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm">
              {tipe === 'income' ? 'Income' : 'Pengeluaran'} berhasil dicatat! ✨
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipe Selector */}
          <div className="animate-fade-in">
            <label className="text-slate-300 text-sm font-medium mb-3 block">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipe('income')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  tipe === 'income'
                    ? 'bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tipe === 'income' ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                }`}>
                  <TrendingUp size={24} className={tipe === 'income' ? 'text-emerald-400' : 'text-slate-500'} />
                </div>
                <span className={`text-sm font-medium ${tipe === 'income' ? 'text-emerald-300' : 'text-slate-400'}`}>
                  Income
                </span>
                <span className="text-xs text-slate-500">Pemasukan</span>
              </button>

              <button
                type="button"
                onClick={() => setTipe('pengeluaran')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  tipe === 'pengeluaran'
                    ? 'bg-red-500/15 border-red-500/50 ring-1 ring-red-500/30'
                    : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tipe === 'pengeluaran' ? 'bg-red-500/20' : 'bg-slate-700/50'
                }`}>
                  <TrendingDown size={24} className={tipe === 'pengeluaran' ? 'text-red-400' : 'text-slate-500'} />
                </div>
                <span className={`text-sm font-medium ${tipe === 'pengeluaran' ? 'text-red-300' : 'text-slate-400'}`}>
                  Pengeluaran
                </span>
                <span className="text-xs text-slate-500">Pengeluaran</span>
              </button>
            </div>
          </div>

          {/* Nominal */}
          <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <DollarSign size={16} />
              Nominal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={nominal ? formatRupiah(nominal) : ''}
                onChange={handleNominalChange}
                placeholder="0"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-lg font-semibold"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <FileText size={16} />
              Keterangan
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Gaji bulanan, Makan siang, Beli buku..."
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
              tipe === 'income' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20 text-white'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/20 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan {tipe === 'income' ? 'Income' : 'Pengeluaran'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CatatKeuangan;

