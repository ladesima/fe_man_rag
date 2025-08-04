// src/pages/HomePage.jsx

import React from "react";
import { Link } from "react-router-dom"; // Ganti useNavigate dengan Link
import logo from "../assets/logo.png";

const HomePage = () => {
  // Fungsi dan hook useNavigate tidak lagi diperlukan,
  // membuat komponen lebih bersih.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#537D5D] to-[#2a4a33] p-6">
      {/* Menambahkan animasi fade-in sederhana */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-lg w-full text-center text-white animate-fade-in">
        
        {/* Ukuran logo sedikit disesuaikan agar lebih proporsional */}
        <img src={logo} alt="Studiva Logo" className="w-28 h-28 mx-auto mb-4" />
        
        <h1 className="text-4xl font-bold mb-3 tracking-wide">SELAMAT DATANG</h1>
        <p className="text-base text-gray-200 mb-8">
          Platform pembelajaran cerdas berbasis AI untuk pendidikan SMA/MA Sederajat. Mulai sekarang dan temukan jawaban terbaik!
        </p>
        
        <div className="space-y-3">
          {/* Tombol dibungkus dengan komponen Link untuk navigasi */}
          <Link to="/chat" className="w-full">
            <button
              className="w-full px-4 py-3 bg-[#73946B] text-white hover:bg-[#9EBC8A] rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Mulai Chat 🚀
            </button>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;