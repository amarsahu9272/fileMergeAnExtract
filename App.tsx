
import React, { useState } from 'react';
import JpegToPdfConverter from './components/JpegToPdfConverter';
import PdfToJpegConverter from './components/PdfToJpegConverter';
import { MergeIcon, SplitIcon, GithubIcon } from './components/icons';
import type { ConversionMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('jpeg-to-pdf');

  const renderConverter = () => {
    switch (mode) {
      case 'jpeg-to-pdf':
        return <JpegToPdfConverter />;
      case 'pdf-to-jpeg':
        return <PdfToJpegConverter />;
      default:
        return null;
    }
  };

  const getTabClass = (currentMode: ConversionMode) => {
    return `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary ${
      mode === currentMode
        ? 'bg-brand-primary text-white shadow-lg'
        : 'text-dark-text-secondary hover:bg-dark-card hover:text-white'
    }`;
  };

  return (
    <div className="min-h-screen bg-dark-bg font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            FileMerge
          </h1>
          <p className="mt-2 text-lg text-dark-text-secondary">
            Your simple, client-side file conversion tool.
          </p>
        </header>

        <main>
          <div className="flex justify-center mb-8 bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl border border-dark-border shadow-md max-w-sm mx-auto">
            <button
              onClick={() => setMode('jpeg-to-pdf')}
              className={getTabClass('jpeg-to-pdf')}
            >
              <MergeIcon className="w-5 h-5" />
              JPEG to PDF
            </button>
            <button
              onClick={() => setMode('pdf-to-jpeg')}
              className={getTabClass('pdf-to-jpeg')}
            >
              <SplitIcon className="w-5 h-5" />
              PDF to JPEG
            </button>
          </div>

          <div className="min-h-[400px]">
            {renderConverter()}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-dark-text-secondary text-sm">
            <a href="https://github.com/your-repo/filemerge" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-brand-secondary transition-colors">
                <GithubIcon className="w-4 h-4" />
                <span>View on GitHub</span>
            </a>
            <p className="mt-2">All conversions are done in your browser. No files are uploaded.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
