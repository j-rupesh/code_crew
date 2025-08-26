import { useState } from 'react';
import { toast } from 'sonner';
import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import UploadZone from '@/components/UploadZone';
import QueryInterface from '@/components/QueryInterface';
import ResultsDisplay from '@/components/ResultsDisplay';
import AnimatedBackground from '@/components/AnimatedBackground';
import CustomCursor from '@/components/CustomCursor';
import FloatingElements from '@/components/FloatingElements';
import GlitchText from '@/components/GlitchText';
import { Loader2, FileSpreadsheet, X, CheckCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    data: any[];
    summary: string;
    chartType: 'bar' | 'line' | 'pie';
  } | null>(null);

  const [accountOpen, setAccountOpen] = useState(false); // <-- toggle for avatar

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Failed to logout');
    }
  };

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setResults(null);
    toast.success(`File "${uploadedFile.name}" uploaded successfully!`);
  };

  const handleQuery = async (question: string) => {
    if (!file) return toast.error('Please upload a file first');
    setIsLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    try {
      const response = await fetch('http://localhost:5000/api/query', { method: 'POST', body: formData });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze data');
      }
      const data = await response.json();
      setResults({ data: data.data, summary: data.summary, chartType: data.chartType || 'bar' });
      toast.success('Analysis complete!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!results) return;
    const csv = [
      Object.keys(results.data[0]).join(','),
      ...results.data.map((row) => Object.values(row).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-results.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResults(null);
    toast.info('File removed');
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
      </div>

      <CustomCursor />
      <FloatingElements />

      {/* Account Avatar Dropdown */}
      <div className="absolute top-4 right-4 z-20">
        <div
          className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg cursor-pointer border-2 border-white/30 dark:border-gray-700/30 shadow-md hover:scale-105 transition-transform"
          onClick={() => setAccountOpen(!accountOpen)}
        >
          {auth.currentUser?.photoURL ? (
            <img src={auth.currentUser.photoURL} alt="Profile" className="h-full w-full rounded-full" />
          ) : auth.currentUser?.displayName ? (
            auth.currentUser.displayName[0].toUpperCase()
          ) : auth.currentUser?.email ? (
            auth.currentUser.email[0].toUpperCase()
          ) : (
            'U'
          )}
        </div>

        {/* Expanded Account Info */}
        {accountOpen && (
          <div className="mt-2 w-64 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl px-5 py-3 shadow-xl border border-white/20 dark:border-gray-700/30 transition-all">
            <div className="flex items-center space-x-4 mb-3">
              {auth.currentUser?.photoURL ? (
                <img src={auth.currentUser.photoURL} alt="Profile" className="h-12 w-12 rounded-full border-2 border-primary" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {auth.currentUser?.displayName
                    ? auth.currentUser.displayName[0].toUpperCase()
                    : auth.currentUser?.email
                    ? auth.currentUser.email[0].toUpperCase()
                    : 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-sm">
                  {auth.currentUser?.displayName
                    ? auth.currentUser.displayName
                    : auth.currentUser?.email
                    ? auth.currentUser.email.split('@')[0]
                    : 'Unknown User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {auth.currentUser?.email || 'No email'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center space-x-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-800 transition-colors rounded-full px-3 py-1 w-full justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Logout</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="text-center mb-12 pt-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <GlitchText text="DataMind" glitchIntensity="medium" />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}AI Analyst
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your data. Ask your questions. Get instant insights.
            </p>
          </header>

          {/* Main Content Area */}
          <div className="space-y-8">
            {!file ? (
              <UploadZone onFileUpload={handleFileUpload} />
            ) : (
              <div className="card-premium p-6 flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <CheckCircle className="h-4 w-4 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB • Ready for analysis
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRemoveFile}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            {file && <QueryInterface onQuery={handleQuery} isLoading={isLoading} />}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div className="absolute inset-0 h-12 w-12 bg-primary/20 rounded-full blur-xl animate-pulse" />
                </div>
                <p className="text-lg text-muted-foreground">
                  <GlitchText text="Analyzing your data..." blinking />
                </p>
              </div>
            )}

            {results && !isLoading && (
              <ResultsDisplay
                data={results.data}
                insight={results.summary}
                chartType={results.chartType}
                onExport={handleExport}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;