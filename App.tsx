import React, { useState } from 'react';
import { UploadedFile } from './types';
import { analyzeXrays } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (filesToAdd: FileList | null) => {
    if (!filesToAdd) return;

    const newFiles: UploadedFile[] = [...filesToAdd]
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    if (newFiles.length > 0) {
      setUploadedFiles(prevFiles => {
        const existingFileNames = new Set(prevFiles.map(f => f.file.name));
        const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.file.name));
        return [...prevFiles, ...uniqueNewFiles];
      });
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one X-ray image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport('');

    try {
      const base64Images = await Promise.all(
        uploadedFiles.map(async ({ file }) => {
          const reader = new FileReader();
          return new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to read file as base64'));
                }
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });
        })
      );
      
      const mimeTypes = uploadedFiles.map(f => f.file.type);
      const generatedReport = await analyzeXrays(base64Images, mimeTypes);
      setReport(generatedReport);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <HeaderIcon />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 ml-3">
            AI X-Ray Report Generator
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileUpload 
            files={uploadedFiles}
            onFilesAdded={addFiles}
            onRemoveFile={handleRemoveFile}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          <ReportDisplay 
            report={report}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>

      <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini. For educational and research purposes only.</p>
      </footer>
    </div>
  );
};

export default App;