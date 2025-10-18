
import React, { useState, useCallback } from 'react';
import FileDropzone from './FileDropzone';
import { Spinner } from './Spinner';
import { DownloadIcon, FileIcon, TrashIcon } from './icons';

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
                const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                
                setProgress({ current: 0, total: pdf.numPages });
                const zip = new JSZip();

                for (let i = 1; i <= pdf.numPages; i++) {
                    setProgress({ current: i, total: pdf.numPages });
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const base64Data = jpegDataUrl.split(',')[1];
                    
                    const fileName = `${file.name.replace(/\.pdf$/i, '')}-page-${i}.jpg`;
                    zip.file(fileName, base64Data, { base64: true });
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                setZipUrl(URL.createObjectURL(zipBlob));
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error converting PDF to JPEG:", error);
            alert("An error occurred during PDF conversion. The file might be corrupted or protected.");
        } finally {
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
        <div className="w-full bg-dark-card border border-dark-border rounded-xl shadow-lg p-6 animate-fade-in">
            {!file ? (
                <FileDropzone onFilesAccepted={handleFileAccepted} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} />
            ) : (
                <div>
                    <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Selected File</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 border border-dark-border rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                            <FileIcon className="w-6 h-6 text-brand-secondary"/>
                            <span className="font-medium text-dark-text-primary">{file.name}</span>
                        </div>
                        <button onClick={resetState} className="text-red-500 hover:text-red-400 p-1">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                        {zipUrl ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                                <a
                                    href={zipUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}.zip`}
                                    className="w-full sm:w-auto flex-grow justify-center inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download ZIP
                                </a>
                                <button onClick={resetState} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-dark-border text-base font-medium rounded-md text-dark-text-secondary bg-dark-card hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition">
                                    <FileIcon className="w-5 h-5" />
                                    Convert Another
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={convertToJpeg}
                                disabled={isConverting}
                                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
                            >
                                {isConverting ? <><Spinner /> Converting...</> : "Convert to JPEG"}
                            </button>
                        )}
                    </div>

                    {isConverting && progress.total > 0 && (
                        <div className="mt-6 text-center">
                            <p className="text-dark-text-secondary">Processing page {progress.current} of {progress.total}</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PdfToJpegConverter;
