import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png"; // Pastikan path logo benar

const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("password", password);

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Simpan ke localStorage
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("username", name);

        // Kirim objek yang benar ke App.js
        onLogin({ user_id: data.user_id, name: name });
        navigate("/chat");
      } else {
        setError(data.detail || "Login gagal.");
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
        {successMessage && <div className="bg-green-500/80 text-center p-3 rounded-lg mb-4">{successMessage}</div>}
        <form onSubmit={handleLogin}>
          <img src={logo} alt="Studiva Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-6 text-center">Login ke Akun Anda</h1>
          <div className="space-y-4">
            <input type="text" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9EBC8A]" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9EBC8A]" />
          </div>
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full mt-6 bg-[#73946B] hover:bg-[#9EBC8A] p-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-500">
            {loading ? "Memproses..." : "Login"}
          </button>
          <p className="text-sm text-center mt-6">
            Sudah punya akun?{" "}
            <Link
              to="/signup"
              className="font-semibold underline hover:text-[#9EBC8A]"
            >
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;