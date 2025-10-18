
import React, { useCallback, useState, useRef } from 'react';
import { UploadCloudIcon } from './icons';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  accept: { [key: string]: string[] };
  multiple: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesAccepted, accept, multiple }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptedMimeTypes = Object.keys(accept).join(',');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAccepted(Array.from(e.dataTransfer.files));
    }
  }, [onFilesAccepted]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAccepted(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const acceptedFormats = Object.values(accept).flat().join(', ').toUpperCase();

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-brand-primary bg-indigo-900/20' : 'border-dark-border hover:border-brand-secondary hover:bg-dark-card/50'}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptedMimeTypes}
        multiple={multiple}
        onChange={handleChange}
      />
      <div className="text-center">
        <UploadCloudIcon className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragActive ? 'text-brand-primary' : 'text-dark-text-secondary'}`} />
        <p className="text-lg font-semibold text-dark-text-primary">
          Drop files here or <span className="text-brand-secondary">click to browse</span>
        </p>
        <p className="mt-2 text-sm text-dark-text-secondary">
          Supports: {acceptedFormats}
        </p>
      </div>
    </div>
  );
};

export default FileDropzone;
