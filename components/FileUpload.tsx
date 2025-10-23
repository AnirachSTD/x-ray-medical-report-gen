
import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { UploadIcon, XCircleIcon, AnalyzeIcon } from './icons';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesAdded: (files: FileList) => void;
  onRemoveFile: (fileName: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  statusMessage: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesAdded, onRemoveFile, onAnalyze, isLoading, statusMessage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEvent = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      onFilesAdded(droppedFiles);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
        onFilesAdded(selectedFiles);
    }
    e.target.value = ''; // Allow re-uploading the same file
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload X-Ray Images</h2>
      
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex-grow flex flex-col justify-center items-center hover:border-blue-400 transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
        onDragEnter={(e) => { handleDragEvent(e); setIsDragging(true); }}
        onDragLeave={(e) => { handleDragEvent(e); setIsDragging(false); }}
        onDragOver={handleDragEvent}
        onDrop={handleDrop}
      >
        <UploadIcon />
        <label htmlFor="file-upload" className="mt-4 text-blue-600 font-semibold cursor-pointer hover:underline">
          Choose files to upload
        </label>
        <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-600">Selected Files:</h3>
          <ul className="mt-3 space-y-3 max-h-60 overflow-y-auto pr-2">
            {files.map(({ file, preview }) => (
              <li key={file.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                <div className="flex items-center">
                  <img src={preview} alt={file.name} className="h-12 w-12 object-cover rounded-md mr-4 border" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button onClick={() => onRemoveFile(file.name)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <XCircleIcon />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-6">
        <button
          onClick={onAnalyze}
          disabled={isLoading || files.length === 0}
          className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {statusMessage || 'Analyzing...'}
            </>
          ) : (
            <>
              <AnalyzeIcon />
              Analyze and Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
