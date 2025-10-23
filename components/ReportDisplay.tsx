import React, { useRef } from 'react';
import { DownloadIcon, WarningIcon, RefineIcon } from './icons';

// This line is to inform TypeScript about the jsPDF global variable from the script tag
declare const jspdf: any;

interface ReportDisplayProps {
  report: string;
  isLoading: boolean;
  error: string | null;
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onFeedbackSubmit: () => void;
  isRefining: boolean;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, isLoading, error, feedback, onFeedbackChange, onFeedbackSubmit, isRefining }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = () => {
    if (!report) return;

    const { jsPDF } = jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    const title = 'AI-Generated Radiology Report';
    doc.setFontSize(18);
    doc.text(title, 40, 60);

    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(report, 515); // 595 (A4 width) - 40*2 (margins)
    doc.text(splitText, 40, 90);

    doc.save('radiology-report.pdf');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold">Generating report, please wait...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-500 bg-red-50 p-4 rounded-lg">
            <WarningIcon />
            <p className="mt-2 font-semibold">An Error Occurred</p>
            <p className="text-sm text-center">{error}</p>
          </div>
        );
    }
    
    if (report) {
      return (
        <div ref={reportContentRef} className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap p-4">
            {report.split('**').map((part, index) => 
                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
            )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-5xl mb-4">🩺</div>
        <p className="text-lg font-semibold">Your report will appear here</p>
        <p className="text-sm text-center">Upload one or more X-ray images and click "Analyze" to begin.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-700">Generated Report</h2>
        <button
          onClick={handleExportPdf}
          disabled={!report || isLoading}
          className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors"
        >
          <DownloadIcon />
          <span className="ml-2">Export PDF</span>
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg flex-grow overflow-y-auto h-96 relative">
        {renderContent()}
        {isRefining && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 font-semibold">Refining report with feedback...</p>
            </div>
        )}
      </div>
      
      {report && !isLoading && (
        <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Doctor's Review & Feedback</h3>
            <p className="text-sm text-gray-500 mb-3">
                Add corrections or additional findings below. The AI will use your feedback to generate a refined report and improve future analyses.
            </p>
            <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={4}
                placeholder="e.g., 'Missed subtle fracture on the left femoral neck. Please re-evaluate.'"
                value={feedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                disabled={isRefining}
                aria-label="Doctor's Feedback Input"
            />
            <button
                onClick={onFeedbackSubmit}
                disabled={!feedback.trim() || isRefining}
                className="w-full mt-3 flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
            >
                {isRefining ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Refining...
                    </>
                ) : (
                    <>
                        <RefineIcon />
                        Save Feedback & Refine Report
                    </>
                )}
            </button>
        </div>
      )}

      { !report && !isLoading && (
          <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-xs rounded-md">
            <p><strong className="font-bold">Disclaimer:</strong> This is an AI-generated report for informational purposes only. It is not a substitute for professional medical advice. Always consult a qualified healthcare provider.</p>
          </div>
      )}
    </div>
  );
};

export default ReportDisplay;
