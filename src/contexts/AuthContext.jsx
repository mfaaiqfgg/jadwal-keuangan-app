import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan dalam AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek hasil redirect login (untuk mobile)
    getRedirectResult(auth).then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const oauthToken = credential?.accessToken || result._tokenResponse?.oauthAccessToken;
        if (oauthToken) {
          localStorage.setItem('google_access_token', oauthToken);
          sessionStorage.setItem('google_access_token', oauthToken);
        }
      }
    }).catch((err) => {
      console.warn('Redirect result error:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Coba popup dulu (desktop)
      const result = await signInWithPopup(auth, googleProvider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const oauthToken = credential?.accessToken || result._tokenResponse?.oauthAccessToken;
      if (oauthToken) {
        localStorage.setItem('google_access_token', oauthToken);
        sessionStorage.setItem('google_access_token', oauthToken);
      }
      return result.user;
    } catch (error) {
      // Kalau popup gagal/diblokir, pakai redirect
      if (
        error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        // Fallback ke redirect (berfungsi di mobile & browser yang blokir popup)
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    localStorage.removeItem('google_access_token');
    sessionStorage.removeItem('google_access_token');
    return await signOut(auth);
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
