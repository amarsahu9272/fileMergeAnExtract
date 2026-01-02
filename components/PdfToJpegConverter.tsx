
import React, { useState, useCallback } from 'react';
import FileDropzone from './FileDropzone';
import { Spinner } from './Spinner';
import { DownloadIcon, FileIcon, TrashIcon, SplitIcon } from './icons';

// Declare global pdfjsLib and JSZip variables from CDN
declare const pdfjsLib: any;
declare const JSZip: any;

const PdfToJpegConverter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [zipUrl, setZipUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleFileAccepted = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0 && acceptedFiles[0].type === 'application/pdf') {
            setFile(acceptedFiles[0]);
            setZipUrl(null);
            setProgress({ current: 0, total: 0 });
        }
    }, []);

    const convertToJpeg = async () => {
        if (!file) return;
        setIsConverting(true);
        setZipUrl(null);

        try {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                if (!e.target?.result) return;
                
                try {
                  const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
                  
                  // Safe access to pdfjsLib
                  const lib = pdfjsLib || (window as any).pdfjsLib;
                  if (!lib) throw new Error("PDF library not loaded. Check your internet connection.");
                  
                  const pdf = await lib.getDocument({ data: typedarray }).promise;
                  
                  setProgress({ current: 0, total: pdf.numPages });
                  const zip = new JSZip();

                  for (let i = 1; i <= pdf.numPages; i++) {
                      setProgress({ current: i, total: pdf.numPages });
                      const page = await pdf.getPage(i);
                      // High scale for better quality JPEG
                      const viewport = page.getViewport({ scale: 2.0 });
                      const canvas = document.createElement('canvas');
                      const context = canvas.getContext('2d');
                      if (!context) throw new Error("Could not initialize rendering engine.");
                      
                      canvas.height = viewport.height;
                      canvas.width = viewport.width;

                      await page.render({ canvasContext: context, viewport: viewport }).promise;
                      
                      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
                      const base64Data = jpegDataUrl.split(',')[1];
                      
                      const fileName = `${file.name.replace(/\.pdf$/i, '')}_page_${i}.jpg`;
                      zip.file(fileName, base64Data, { base64: true });
                  }

                  const zipBlob = await zip.generateAsync({ type: 'blob' });
                  setZipUrl(URL.createObjectURL(zipBlob));
                } catch (innerError: any) {
                  console.error("Conversion error:", innerError);
                  alert(`Conversion failed: ${innerError.message}`);
                } finally {
                  setIsConverting(false);
                }
            };
            fileReader.onerror = () => {
              alert("Failed to read the local file.");
              setIsConverting(false);
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error: any) {
            console.error("Outer error:", error);
            alert("An error occurred. The file might be corrupted or protected.");
            setIsConverting(false);
        }
    };
    
    const resetState = () => {
        setFile(null);
        setZipUrl(null);
        setIsConverting(false);
        setProgress({ current: 0, total: 0 });
    };

    return (
        <div className="w-full bg-dark-card/80 backdrop-blur-lg border border-dark-border rounded-3xl shadow-2xl p-8 transition-all duration-500">
            {!file ? (
                <FileDropzone onFilesAccepted={handleFileAccepted} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} />
            ) : (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-dark-text-primary mb-6">Source PDF</h3>
                    <div className="flex items-center justify-between p-5 bg-dark-bg/50 border border-dark-border rounded-2xl mb-8 group hover:border-brand-primary transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                              <FileIcon className="w-7 h-7 text-red-500"/>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-dark-text-primary truncate max-w-[180px] sm:max-w-md">{file.name}</span>
                              <span className="text-xs text-dark-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </div>
                        <button onClick={resetState} className="p-2 hover:bg-red-500/10 text-dark-text-secondary hover:text-red-500 rounded-lg transition-all">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="flex flex-col gap-6 items-center">
                        {zipUrl ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                                <a
                                    href={zipUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}_images.zip`}
                                    className="w-full sm:w-auto flex-grow justify-center inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download ZIP Archive
                                </a>
                                <button 
                                  onClick={resetState} 
                                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-8 py-4 bg-dark-bg border border-dark-border text-dark-text-primary font-bold rounded-2xl hover:bg-dark-border transition-all"
                                >
                                    <FileIcon className="w-5 h-5" />
                                    Convert Another
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={convertToJpeg}
                                disabled={isConverting}
                                className="w-full sm:w-auto px-12 py-5 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                            >
                                {isConverting ? (
                                  <><Spinner /> Processing Pages...</>
                                ) : (
                                  <><SplitIcon className="w-5 h-5" /> Extract to JPEG Images</>
                                )}
                            </button>
                        )}

                        {isConverting && progress.total > 0 && (
                            <div className="w-full max-w-md animate-fade-in">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-dark-text-secondary font-medium text-xs uppercase tracking-wider">Converting...</span>
                                  <span className="text-brand-secondary font-bold">{Math.round((progress.current / progress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-dark-bg rounded-full h-3 border border-dark-border overflow-hidden">
                                    <div 
                                      className="bg-brand-primary h-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-center text-xs text-dark-text-secondary mt-3">
                                  Page {progress.current} of {progress.total}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfToJpegConverter;
