import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import CustomCursor from "@/components/CustomCursor";
import FloatingElements from "@/components/FloatingElements";
import GlitchText from "@/components/GlitchText";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
      </div>
      
      <CustomCursor />
      <FloatingElements />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="card-premium p-12 text-center space-y-8">
            {/* Error Icon with Animation */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative bg-background/50 backdrop-blur-sm rounded-full p-8 border border-border/50">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>

            {/* 404 Text with Glitch Effect */}
            <div className="space-y-4">
              <h1 className="text-8xl font-bold">
                <GlitchText text="404" glitchIntensity="high" />
              </h1>
              <h2 className="text-3xl font-semibold text-foreground">
                Page Not Found
              </h2>
            </div>

            {/* Path Information */}
            <div className="space-y-2">
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
                <Search className="h-4 w-4 text-muted-foreground" />
                <code className="text-sm text-primary font-mono">
                  {location.pathname}
                </code>
              </div>
            </div>

            {/* Auto-redirect Notice */}
            <div className="text-sm text-muted-foreground">
              <p>Redirecting to home in{' '}
                <span className="font-bold text-primary">
                  {countdown}
                </span>
                {' '}seconds...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGoHome}
                className="btn-premium group"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Go to Home
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="lg"
                className="border-border/50 hover:border-primary/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Decorative Elements */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/30">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  <GlitchText text="Lost?" glitchIntensity="low" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Check the URL
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-purple-500">
                  <GlitchText text="Error" glitchIntensity="low" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Page missing
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-pink-500">
                  <GlitchText text="Oops!" glitchIntensity="low" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Try again
                </p>
              </div>
            </div>
          </div>

          {/* Floating Error Messages */}
          <div className="absolute -top-10 left-10 animate-float-slow">
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400">
              404 ERROR
            </div>
          </div>
          <div className="absolute -bottom-10 right-10 animate-float-slow" style={{ animationDelay: '2s' }}>
            <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-400">
              NOT FOUND
            </div>
          </div>
          <div className="absolute top-1/2 -left-20 animate-float-slow" style={{ animationDelay: '4s' }}>
            <div className="px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full text-xs text-pink-400">
              MISSING
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;