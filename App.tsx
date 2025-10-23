
import React, { useState, useEffect } from 'react';
import { Chat } from '@google/genai';
import { UploadedFile, KnowledgeItem } from './types';
import { getRefinementPrompt, generateReport } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import { HeaderIcon } from './components/icons';

type AnalysisStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [report, setReport] = useState<string>('');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({ status: 'idle', message: '' });
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [doctorFeedback, setDoctorFeedback] = useState<string>('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);

  const KNOWLEDGE_BASE_KEY = 'xray_feedback_knowledge_base_v2';

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

  const addKnowledge = (name: string, content: string) => {
    if (!content.trim()) return;
    if (knowledgeBase.some(item => item.content.trim() === content.trim())) return;

    const finalName = name.trim() || `${content.trim().substring(0, 40)}...`;

    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      name: finalName,
      content: content.trim()
    };

    const updatedKnowledgeBase = [...knowledgeBase, newItem];
    setKnowledgeBase(updatedKnowledgeBase);
    localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(updatedKnowledgeBase));
  };

  const removeKnowledge = (idToRemove: string) => {
    const updatedKnowledgeBase = knowledgeBase.filter(item => item.id !== idToRemove);
    setKnowledgeBase(updatedKnowledgeBase);
    localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(updatedKnowledgeBase));
  };

  const updateKnowledge = (idToUpdate: string, newName: string, newContent: string) => {
    if (!newContent.trim()) return;

    const finalName = newName.trim() || `${newContent.trim().substring(0, 40)}...`;

    const updatedKnowledgeBase = knowledgeBase.map(item => 
      item.id === idToUpdate 
        ? { ...item, name: finalName, content: newContent.trim() } 
        : item
    );
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
      setAnalysisStatus({ status: 'error', message: 'Please upload at least one X-ray image.'});
      return;
    }

    setAnalysisStatus({ status: 'loading', message: 'Starting analysis...' });
    setReport('');
    setChatSession(null);
    setDoctorFeedback('');

    try {
      const onStatusUpdate = (message: string) => {
        setAnalysisStatus({ status: 'loading', message });
      };
      
      const { reportText, chatSession: newChatSession } = await generateReport(
          uploadedFiles,
          knowledgeBase,
          onStatusUpdate
      );

      setReport(reportText);
      setChatSession(newChatSession);
      setAnalysisStatus({ status: 'success', message: 'Report generated successfully.' });
      
    } catch (err: any) {
      console.error(err);
      setAnalysisStatus({ status: 'error', message: err.message || 'An unexpected error occurred during analysis.' });
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!doctorFeedback.trim() || !chatSession) return;
    setIsRefining(true);
    setAnalysisStatus(prev => ({ ...prev, status: 'idle', message: ''}));

    try {
      const refinementPrompt = getRefinementPrompt(doctorFeedback);
      const response = await chatSession.sendMessage({ message: refinementPrompt });
      setReport(response.text);

      addKnowledge('', doctorFeedback); // Add feedback to knowledge base without a specific name
      
      setDoctorFeedback('');
    } catch (err) {
      console.error(err);
      setAnalysisStatus({ status: 'error', message: 'An error occurred while refining the report. Please check the console.' });
    } finally {
      setIsRefining(false);
    }
  };
  
  const sortedKnowledgeBase = [...knowledgeBase].sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

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
              isLoading={analysisStatus.status === 'loading'}
              statusMessage={analysisStatus.status === 'loading' ? analysisStatus.message : ''}
            />
            <KnowledgeBaseManager
              knowledgeBase={sortedKnowledgeBase}
              onAddKnowledge={addKnowledge}
              onRemoveKnowledge={removeKnowledge}
              onUpdateKnowledge={updateKnowledge}
            />
          </div>
          <div className="lg:col-span-3">
            <ReportDisplay 
              report={report}
              isLoading={analysisStatus.status === 'loading'}
              error={analysisStatus.status === 'error' ? analysisStatus.message : null}
              statusMessage={analysisStatus.status === 'loading' ? analysisStatus.message : ''}
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
