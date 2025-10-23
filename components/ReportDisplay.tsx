
import React, { useRef } from 'react';
import { DownloadIcon, WarningIcon } from './icons';

// This line is to inform TypeScript about the jsPDF global variable from the script tag
declare const jspdf: any;

interface ReportDisplayProps {
  report: string;
  isLoading: boolean;
  error: string | null;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, isLoading, error }) => {
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
      <div className="bg-gray-50 rounded-lg flex-grow overflow-y-auto h-96">
        {renderContent()}
      </div>
       <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-xs rounded-md">
            <p><strong className="font-bold">Disclaimer:</strong> This is an AI-generated report for informational purposes only. It is not a substitute for professional medical advice. Always consult a qualified healthcare provider.</p>
       </div>
    </div>
  );
};

export default ReportDisplay;
