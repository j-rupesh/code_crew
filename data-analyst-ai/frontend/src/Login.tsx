import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

// Optional Components
import GlitchText from "@/components/GlitchText";
import CustomCursor from "@/components/CustomCursor";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) return setError("Enter your email to reset password");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Subtle Glass Effect Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5 -z-10"></div>

      {/* 🔥 Attractive Header Section */}
      <div className="mt-10 text-center relative z-10">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] animate-pulse">
          🚀 Code Crew 🚀
        </h1>
        <p className="text-white/70 mt-3 text-lg tracking-wide animate-fade-in">
          Join the <span className="text-purple-400 font-semibold">Future of Coding</span>
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-12 bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 w-full max-w-sm animate-fade-in-up">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          <GlitchText text="Welcome Back" glitchIntensity="medium" />
        </h1>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-xl font-semibold text-white transition-all duration-500 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm text-purple-300">
          <button onClick={handleResetPassword} className="hover:underline">
            Forgot Password?
          </button>
          <button onClick={() => navigate("/signup")} className="hover:underline">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
