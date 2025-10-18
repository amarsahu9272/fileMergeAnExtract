
import React, { useState, useCallback, useRef } from 'react';
import type { FileWithPreview } from '../types';
import FileDropzone from './FileDropzone';
import { Spinner } from './Spinner';
import { TrashIcon, DownloadIcon, FileIcon } from './icons';

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
            .filter(file => file.type === 'image/jpeg')
            .map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
        setFiles(prev => [...prev, ...filesWithPreview]);
        setPdfUrl(null);
    }, []);

    const removeFile = (fileName: string) => {
        const newFiles = files.filter(file => file.name !== fileName);
        setFiles(newFiles);
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
            const { jsPDF } = jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const a4Width = 210;
            const a4Height = 297;
            const margin = 10;
            const maxWidth = a4Width - margin * 2;
            const maxHeight = a4Height - margin * 2;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const img = new Image();
                img.src = file.preview;

                await new Promise<void>(resolve => {
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

                        pdf.addImage(img, 'JPEG', x, y, newWidth, newHeight);
                        resolve();
                    };
                });
            }
            const pdfBlob = pdf.output('blob');
            setPdfUrl(URL.createObjectURL(pdfBlob));
        } catch (error) {
            console.error("Error converting to PDF:", error);
            alert("An error occurred during PDF conversion.");
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
        <div className="w-full bg-dark-card border border-dark-border rounded-xl shadow-lg p-6 animate-fade-in">
            {files.length === 0 ? (
                <FileDropzone onFilesAccepted={handleFilesAccepted} accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }} multiple={true} />
            ) : (
                <div>
                    <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Your Files (Drag to reorder)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 max-h-80 overflow-y-auto pr-2">
                        {files.map((file, index) => (
                            <div
                                key={file.name + index}
                                className="relative group p-2 border-2 border-dashed border-dark-border rounded-lg cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={() => (dragItem.current = index)}
                                onDragEnter={() => (dragOverItem.current = index)}
                                onDragEnd={handleSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <img src={file.preview} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                                <p className="text-xs text-dark-text-secondary truncate mt-2">{file.name}</p>
                                <button
                                    onClick={() => removeFile(file.name)}
                                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                        {pdfUrl ? (
                             <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                                <a
                                    href={pdfUrl}
                                    download="merged.pdf"
                                    className="w-full sm:w-auto flex-grow justify-center inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download PDF
                                </a>
                                <button onClick={resetState} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-dark-border text-base font-medium rounded-md text-dark-text-secondary bg-dark-card hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition">
                                    <FileIcon className="w-5 h-5" />
                                    Convert More
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={convertToPdf}
                                    disabled={isConverting}
                                    className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
                                >
                                    {isConverting ? <><Spinner /> Converting...</> : "Merge to PDF"}
                                </button>
                                <button onClick={resetState} className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-3 border border-dark-border text-base font-medium rounded-md text-dark-text-secondary bg-dark-card hover:bg-gray-600 transition">
                                    Clear Files
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

