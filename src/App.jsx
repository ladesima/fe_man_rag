import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";

function App() {
  // State untuk menyimpan data user, diambil dari localStorage
  const [user, setUser] = useState(() => {
    const savedUserId = localStorage.getItem("user_id");
    const savedUsername = localStorage.getItem("username");
    return savedUserId ? { id: savedUserId, name: savedUsername } : null;
  });

  // Fungsi ini akan dipanggil oleh LoginPage setelah login berhasil
  const handleLogin = (userData) => {
    // Menyimpan data user ke state
    setUser({ id: userData.user_id, name: userData.name });
  };
  
  // --- PERBAIKAN UTAMA ADA DI SINI ---
  // Fungsi logout sekarang tidak mengembalikan apa pun (void)
  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    setUser(null);
    // Baris "return <Navigate...>" dihapus.
    // React akan otomatis mengarahkan ke /login karena state 'user' menjadi null.
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/chat" /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/chat" /> : <SignupPage />} 
        />
        
        {/* Rute ChatPage yang Dilindungi */}
        <Route 
          path="/chat" 
          element={
            user ? (
              // Teruskan nama pengguna sebagai prop 'username'
              <ChatPage username={user.name} onLogout={handleLogout} />
            ) : (
              // Jika user null, otomatis arahkan ke login
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;