import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to reset your password
        </p>

        {message && (
          <p className="text-green-500 text-sm text-center mb-4">{message}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            required
          />
          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-indigo-600">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
