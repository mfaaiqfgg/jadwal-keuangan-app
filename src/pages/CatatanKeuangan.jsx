import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getKeuanganSummary, deleteKeuangan } from '../services/googleSheets';
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Trash2,
  Loader2,
  RefreshCw,
  ReceiptText,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter
} from 'lucide-react';

const CatatanKeuangan = ({ navigate }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua'); // semua, income, pengeluaran

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getKeuanganSummary(user);
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus data keuangan ini?')) return;
    setDeletingId(id);
    try {
      await deleteKeuangan(user, id);
      await fetchData(); // Refresh
    } catch (err) {
      setError('Gagal menghapus data');
    } finally {
      setDeletingId(null);
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const filteredList = summary?.list?.filter(item => {
    if (filter === 'semua') return true;
    return item.tipe === filter;
  }) || [];

  const filters = [
    { value: 'semua', label: 'Semua' },
    { value: 'income', label: 'Income' },
    { value: 'pengeluaran', label: 'Pengeluaran' },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 backdrop-blur-lg border-b border-slate-700/50 px-4 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('home')}
              className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all border border-slate-700/50"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen size={22} className="text-emerald-400" />
              <div>
                <h1 className="text-lg font-bold text-white">Catatan Keuangan</h1>
                <p className="text-emerald-300/70 text-xs">Riwayat transaksi Anda</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all border border-slate-700/50"
          >
            <RefreshCw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
            <Loader2 size={32} className="animate-spin text-emerald-400 mb-3" />
            <p className="text-slate-400 text-sm">Memuat data keuangan...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-3 mb-5 animate-fade-in">
              {/* Saldo */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Saldo Bersih</p>
                    <p className={`text-2xl font-bold ${
                      (summary?.saldo || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatRupiah(summary?.saldo || 0)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    (summary?.saldo || 0) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <Wallet size={24} className={(summary?.saldo || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                  </div>
                </div>
              </div>

              {/* Income & Pengeluaran */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpCircle size={16} className="text-emerald-400" />
                    <p className="text-slate-400 text-xs">Total Income</p>
                  </div>
                  <p className="text-emerald-400 font-bold text-sm">
                    {formatRupiah(summary?.totalIncome || 0)}
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownCircle size={16} className="text-red-400" />
                    <p className="text-slate-400 text-xs">Total Pengeluaran</p>
                  </div>
                  <p className="text-red-400 font-bold text-sm">
                    {formatRupiah(summary?.totalPengeluaran || 0)}
                  </p>
                </div>
              </div>

              {/* Total Transaksi */}
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                <span className="text-slate-400 text-xs">Total Transaksi</span>
                <span className="text-white font-medium text-sm">{summary?.totalTransaksi || 0} transaksi</span>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-4">
              <Filter size={14} className="text-slate-500" />
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === f.value
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:bg-slate-700/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Transaction List */}
            {filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ReceiptText size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm mb-1">Belum ada catatan</p>
                <p className="text-slate-500 text-xs mb-4">Mulai catat income & pengeluaran Anda</p>
                <button
                  onClick={() => navigate('catatKeuangan')}
                  className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl text-sm border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                >
                  <PiggyBank size={16} />
                  Catat Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredList.slice().reverse().map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-xl p-3.5 flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.tipe === 'income' ? 'bg-emerald-500/15' : 'bg-red-500/15'
                    }`}>
                      {item.tipe === 'income' 
                        ? <TrendingUp size={18} className="text-emerald-400" />
                        : <TrendingDown size={18} className="text-red-400" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.keterangan}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.tanggal} • {item.jam}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${
                        item.tipe === 'income' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {item.tipe === 'income' ? '+' : '-'}{formatRupiah(item.nominal)}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all group shrink-0"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={14} className="animate-spin text-slate-400" />
                      ) : (
                        <Trash2 size={14} className="text-slate-600 group-hover:text-red-400 transition-colors" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatatanKeuangan;

