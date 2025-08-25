import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

// Optional: GlitchText or animated text
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Floating Animated Blobs */}
      <div className="absolute w-full h-full top-0 left-0 -z-10">
        <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 left-10"></div>
        <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-20 right-0"></div>
        <div className="absolute w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-10 left-20"></div>
      </div>

      {/* Login Card */}
      <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
          <GlitchText text="Welcome Back" glitchIntensity="medium" />
        </h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-xl font-semibold text-white transition-all duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm text-purple-600">
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
