import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Pastikan path logo benar

const SignupPage = () => {
  const [name, setName] = useState("");
  const [nisn, setNisn] = useState("");
  const [grade, setGrade] = useState("10");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://studiva.site/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nisn, grade, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/login", { 
          state: { message: "Pendaftaran berhasil! Silakan login." } 
        });
      } else {
        setError(data.detail || "Pendaftaran gagal.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#537D5D] to-[#2a4a33] p-6">
      <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full text-white animate-fade-in">
        <form onSubmit={handleSignup}>
          <img src={logo} alt="Studiva Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-6 text-center">Buat Akun Baru</h1>
          <div className="space-y-4">
            <input type="text" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9EBC8A]" />
            <input type="text" placeholder="NISN" value={nisn} onChange={(e) => setNisn(e.target.value)} required disabled={loading} className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9EBC8A]" />
            <select value={grade} onChange={(e) => setGrade(e.target.value)} required disabled={loading} className="w-full p-3 rounded-lg bg-green-800 text-white focus:outline-none focus:ring-2 focus:ring-[#9EBC8A] appearance-none">
              <option value="10">Kelas 10</option>
              <option value="11">Kelas 11</option>
              <option value="12">Kelas 12</option>
            </select>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9EBC8A]" />
          </div>
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full mt-6 bg-[#73946B] hover:bg-[#9EBC8A] p-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-500">
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
          <p className="text-sm text-center mt-6">Sudah punya akun? <Link to="/login" className="font-semibold underline hover:text-[#9EBC8A]">Masuk di sini</Link></p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;