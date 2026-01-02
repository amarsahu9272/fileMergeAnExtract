
import React, { useState } from 'react';
import JpegToPdfConverter from './components/JpegToPdfConverter';
import PdfToJpegConverter from './components/PdfToJpegConverter';
import { MergeIcon, SplitIcon, GithubIcon } from './components/icons';
import type { ConversionMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('jpeg-to-pdf');

  const renderConverter = () => {
    return (
      <div key={mode} className="animate-slide-up">
        {mode === 'jpeg-to-pdf' ? <JpegToPdfConverter /> : <PdfToJpegConverter />}
      </div>
    );
  };

  const getTabClass = (currentMode: ConversionMode) => {
    const isActive = mode === currentMode;
    return `relative flex items-center gap-2.5 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-bg ${
      isActive
        ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 transform scale-105'
        : 'text-dark-text-secondary hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <div className="min-h-screen bg-dark-bg font-sans text-dark-text-primary selection:bg-brand-primary/30 relative overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
            <MergeIcon className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
            File<span className="text-brand-primary">Merge</span>
          </h1>
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and purely client-side conversion. 
            No file ever leaves your device.
          </p>
        </header>

        <main>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex bg-dark-card/50 backdrop-blur-md p-1.5 rounded-2xl border border-dark-border shadow-2xl">
              <button
                onClick={() => setMode('jpeg-to-pdf')}
                className={getTabClass('jpeg-to-pdf')}
                aria-pressed={mode === 'jpeg-to-pdf'}
              >
                <MergeIcon className="w-5 h-5" />
                JPEG to PDF
              </button>
              <button
                onClick={() => setMode('pdf-to-jpeg')}
                className={getTabClass('pdf-to-jpeg')}
                aria-pressed={mode === 'pdf-to-jpeg'}
              >
                <SplitIcon className="w-5 h-5" />
                PDF to JPEG
              </button>
            </div>
          </div>

          <div className="relative z-10">
            {renderConverter()}
          </div>
        </main>
        
        <footer className="mt-20 py-8 border-t border-dark-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-dark-text-secondary text-sm">
                <div className="flex items-center gap-6">
                  <span className="hover:text-white transition-colors cursor-default">Privacy Protected</span>
                  <span className="hover:text-white transition-colors cursor-default">In-Browser Only</span>
                </div>
                
                <a 
                  href="https://github.com/your-repo/filemerge" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card border border-dark-border hover:border-brand-primary hover:text-white transition-all duration-300"
                >
                    <GithubIcon className="w-4 h-4" />
                    <span>View on GitHub</span>
                </a>
                
                <div className="text-center md:text-right">
                  <p>© 2024 FileMerge. 100% Client-Side.</p>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
