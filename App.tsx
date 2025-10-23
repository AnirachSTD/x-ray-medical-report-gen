
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { UploadedFile } from './types';
import { getInitialPrompt, getRefinementPrompt } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [doctorFeedback, setDoctorFeedback] = useState<string>('');
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);

  const KNOWLEDGE_BASE_KEY = 'xray_feedback_knowledge_base';

  useEffect(() => {
    // Load knowledge base from localStorage on initial render
    try {
      const storedFeedback = JSON.parse(localStorage.getItem(KNOWLEDGE_BASE_KEY) || '[]');
      setKnowledgeBase(storedFeedback);
    } catch (e) {
      console.error("Failed to parse knowledge base from localStorage", e);
      setKnowledgeBase([]);
    }
  }, []);

  const addKnowledge = (newKnowledge: string) => {
    if (!newKnowledge.trim() || knowledgeBase.includes(newKnowledge.trim())) return;
    const updatedKnowledgeBase = [...knowledgeBase, newKnowledge.trim()];
    setKnowledgeBase(updatedKnowledgeBase);
    localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(updatedKnowledgeBase));
  };

  const removeKnowledge = (indexToRemove: number) => {
    const updatedKnowledgeBase = knowledgeBase.filter((_, index) => index !== indexToRemove);
    setKnowledgeBase(updatedKnowledgeBase);
    localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(updatedKnowledgeBase));
  };

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
    setChatSession(null);
    setDoctorFeedback('');

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

      const knowledgeBasePrompt = knowledgeBase.map((fb, i) => `- Item ${i + 1}: ${fb}`).join('\n');
      const initialPrompt = getInitialPrompt(knowledgeBasePrompt);
      
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
      setChatSession(chat);

      const imageParts = base64Images.map((img, index) => ({
        inlineData: { data: img, mimeType: mimeTypes[index] },
      }));

      const MAX_RETRIES = 3;
      let lastError: any = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const response = await chat.sendMessage({ message: { parts: [{ text: initialPrompt }, ...imageParts] } });
          setReport(response.text);
          lastError = null; // Clear error on success
          break; // Exit loop on success
        } catch (err: any) {
          lastError = err;
          // Check if it's a 503 error
          if (err.message && (err.message.includes('503') || err.message.toUpperCase().includes('UNAVAILABLE'))) {
            if (attempt < MAX_RETRIES - 1) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
              setError(`Model is busy. Retrying attempt ${attempt + 2} of ${MAX_RETRIES}...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          } else {
            // It's a different error, so break immediately
            throw err;
          }
        }
      }

      if (lastError) {
        // If the loop finished with an error, it must be the 503 error
         throw new Error("The AI model is currently overloaded. Please try again later.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!doctorFeedback.trim() || !chatSession) return;
    setIsRefining(true);
    setError(null);
    try {
      const refinementPrompt = getRefinementPrompt(doctorFeedback);
      const response = await chatSession.sendMessage({ message: refinementPrompt });
      setReport(response.text);

      addKnowledge(doctorFeedback);
      
      setDoctorFeedback('');
    } catch (err) {
      console.error(err);
      setError('An error occurred while refining the report. Please check the console.');
    } finally {
      setIsRefining(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <FileUpload 
              files={uploadedFiles}
              onFilesAdded={addFiles}
              onRemoveFile={handleRemoveFile}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
            <KnowledgeBaseManager
              knowledgeBase={knowledgeBase}
              onAddKnowledge={addKnowledge}
              onRemoveKnowledge={removeKnowledge}
            />
          </div>
          <div className="lg:col-span-3">
            <ReportDisplay 
              report={report}
              isLoading={isLoading}
              error={error}
              feedback={doctorFeedback}
              onFeedbackChange={setDoctorFeedback}
              onFeedbackSubmit={handleFeedbackSubmit}
              isRefining={isRefining}
            />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini. For educational and research purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
