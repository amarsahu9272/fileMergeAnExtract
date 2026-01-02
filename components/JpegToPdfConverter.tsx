
import React, { useState, useCallback, useRef } from 'react';
import type { FileWithPreview } from '../types';
import FileDropzone from './FileDropzone';
import { Spinner } from './Spinner';
import { TrashIcon, DownloadIcon, FileIcon, MergeIcon } from './icons';

// Declare global jspdf variable from CDN
declare const jspdf: any;

const JpegToPdfConverter: React.FC = () => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleFilesAccepted = useCallback((acceptedFiles: File[]) => {
        const filesWithPreview = acceptedFiles
            .filter(file => file.type === 'image/jpeg' || file.type === 'image/jpg')
            .map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }) as FileWithPreview);
        setFiles(prev => [...prev, ...filesWithPreview]);
        setPdfUrl(null);
    }, []);

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const filesClone = [...files];
        const draggedItemContent = filesClone.splice(dragItem.current, 1)[0];
        filesClone.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setFiles(filesClone);
    };

    const convertToPdf = async () => {
        if (files.length === 0) return;
        setIsConverting(true);
        setPdfUrl(null);

        try {
            // Robust global access for jspdf
            const jsPDFConstructor = jspdf?.jsPDF || (window as any).jspdf?.jsPDF || (window as any).jsPDF;
            if (!jsPDFConstructor) {
              throw new Error("PDF library not loaded. Please ensure you are online and refresh the page.");
            }

            const pdf = new jsPDFConstructor('p', 'mm', 'a4');
            const a4Width = 210;
            const a4Height = 297;
            const margin = 10;
            const maxWidth = a4Width - margin * 2;
            const maxHeight = a4Height - margin * 2;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const img = new Image();
                img.src = file.preview;

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        if (i > 0) {
                            pdf.addPage();
                        }
                        const imgWidth = img.width;
                        const imgHeight = img.height;
                        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

                        const newWidth = imgWidth * ratio;
                        const newHeight = imgHeight * ratio;

                        const x = (a4Width - newWidth) / 2;
                        const y = (a4Height - newHeight) / 2;

                        pdf.addImage(img, 'JPEG', x, y, newWidth, newHeight, undefined, 'FAST');
                        resolve();
                    };
                    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
                });
            }
            const pdfBlob = pdf.output('blob');
            setPdfUrl(URL.createObjectURL(pdfBlob));
        } catch (error: any) {
            console.error("Error converting to PDF:", error);
            alert(error.message || "An error occurred during PDF conversion.");
        } finally {
            setIsConverting(false);
        }
    };
    
    const resetState = () => {
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles([]);
        setPdfUrl(null);
        setIsConverting(false);
    };


    return (
        <div className="w-full bg-dark-card/80 backdrop-blur-lg border border-dark-border rounded-3xl shadow-2xl p-8 transition-all duration-500">
            {files.length === 0 ? (
                <FileDropzone onFilesAccepted={handleFilesAccepted} accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }} multiple={true} />
            ) : (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-dark-text-primary">Your Photos ({files.length})</h3>
                      <button onClick={resetState} className="text-sm text-dark-text-secondary hover:text-red-400 transition-colors">
                        Clear all
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 max-h-[500px] overflow-y-auto pr-2">
                        {files.map((file, index) => (
                            <div
                                key={file.name + index}
                                className="relative group aspect-square bg-dark-bg/50 border border-dark-border rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-brand-primary transition-all duration-300"
                                draggable
                                onDragStart={() => (dragItem.current = index)}
                                onDragEnter={() => (dragOverItem.current = index)}
                                onDragEnd={handleSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <img src={file.preview} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                  <p className="text-[10px] text-white truncate w-full">{file.name}</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                                >
                                    <TrashIcon className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {pdfUrl ? (
                             <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                                <a
                                    href={pdfUrl}
                                    download="merged.pdf"
                                    className="w-full sm:w-auto flex-grow justify-center inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download PDF
                                </a>
                                <button 
                                  onClick={resetState} 
                                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-8 py-4 bg-dark-bg border border-dark-border text-dark-text-primary font-bold rounded-2xl hover:bg-dark-border transition-all"
                                >
                                    <FileIcon className="w-5 h-5" />
                                    Convert More
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={convertToPdf}
                                    disabled={isConverting}
                                    className="w-full sm:w-auto flex-grow justify-center inline-flex items-center gap-3 px-10 py-5 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    {isConverting ? <><Spinner /> Building PDF...</> : <><MergeIcon className="w-5 h-5" /> Merge to PDF</>}
                                </button>
                             </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JpegToPdfConverter;
