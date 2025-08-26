import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import GlitchText from "@/components/GlitchText";
import CustomCursor from "@/components/CustomCursor";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); 
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-black">
      <CustomCursor />

      {/* 🔮 Floating Neon Blobs Background */}
      <div className="absolute w-full h-full top-0 left-0 -z-10">
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob top-0 left-10"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000 top-20 right-0"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000 bottom-10 left-20"></div>
      </div>

      {/* ✨ Header Section */}
      <div className="mt-10 text-center relative z-10">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)] animate-pulse">
          🚀 Code Crew 🚀
        </h1>
        <p className="text-white/70 mt-3 text-lg tracking-wide animate-fade-in">
          Start your <span className="text-pink-400 font-semibold">Journey Today</span>
        </p>
      </div>

      {/* Signup Card */}
      <div className="mt-12 bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 w-full max-w-sm animate-fade-in-up relative z-10">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          <GlitchText text="Create Account" glitchIntensity="medium" />
        </h1>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-xl font-semibold text-white transition-all duration-500 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 shadow-lg"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-pink-300">
          <button onClick={() => navigate("/login")} className="hover:underline">
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
