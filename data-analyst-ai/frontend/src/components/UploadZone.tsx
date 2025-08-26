import { useState } from 'react';
import { Upload, FileSpreadsheet, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

const UploadZone = ({ onFileUpload }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`upload-zone ${isDragging ? 'border-primary bg-primary/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-lg opacity-30"></div>
            <div className="relative bg-card rounded-full p-6">
              <Upload className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Upload your dataset
            </h3>
            <p className="text-muted-foreground">
              Drag and drop your CSV or Excel file here, or click to browse
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <FileSpreadsheet className="h-4 w-4" />
              <span>CSV</span>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <span>Excel</span>
            </div>
          </div>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild className="btn-premium">
            <label htmlFor="file-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;