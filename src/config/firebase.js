import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// PENTING: Ganti dengan konfigurasi Firebase Anda sendiri
// Buat project di https://console.firebase.google.com
// Enable Google Auth di Authentication > Sign-in method
const firebaseConfig = {
  apiKey: "AIzaSyC-k7HkNoDHx4BdRoyDms1tgCqiI9aE664",
  authDomain: "mylife-manager-37c70.firebaseapp.com",
  projectId: "mylife-manager-37c70",
  storageBucket: "mylife-manager-37c70.firebasestorage.app",
  messagingSenderId: "547632494704",
  appId: "1:547632494704:web:d25b3ec2f2213acd17dcb5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request akses ke Google Sheets & Drive saat login
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
