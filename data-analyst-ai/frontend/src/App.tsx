import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebaseConfig";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

// Ensure auth persistence across browser sessions
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Auth persistence set to local"))
  .catch((err) => console.error("Error setting auth persistence:", err));

const queryClient = new QueryClient();

const App = () => {
  const [user, loading] = useAuthState(auth);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/" replace />}
            />
            <Route
              path="/forgot-password"
              element={!user ? <ForgotPassword /> : <Navigate to="/" replace />}
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={user ? <Index /> : <Navigate to="/login" replace />}
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
