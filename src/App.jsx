import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import JadwalSaya from './pages/JadwalSaya';
import MasukkanAgenda from './pages/MasukkanAgenda';
import CatatKeuangan from './pages/CatatKeuangan';
import CatatanKeuangan from './pages/CatatanKeuangan';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('home');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const navigate = (page) => setActivePage(page);

  const pages = {
    home: <HomePage navigate={navigate} />,
    jadwalSaya: <JadwalSaya navigate={navigate} />,
    masukkanAgenda: <MasukkanAgenda navigate={navigate} />,
    catatKeuangan: <CatatKeuangan navigate={navigate} />,
    catatanKeuangan: <CatatanKeuangan navigate={navigate} />,
  };

  return pages[activePage] || <HomePage navigate={navigate} />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
