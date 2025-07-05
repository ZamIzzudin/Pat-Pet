import React, { useState, useRef } from 'react';
import { PinataEvidenceUploader } from '@/lib/pinataUploader';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  selectedFile?: File | null;
  preview?: string | null;
  disabled?: boolean;
}

export function FileUploadZone({
  onFileSelect,
  acceptedTypes = "image/*,video/*,.pdf,.doc,.docx,.txt,.zip",
  maxSizeMB = 10,
  selectedFile,
  preview,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Basic validation before passing to parent
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`File size too large. Maximum: ${maxSizeMB}MB`);
          return;
        }
        onFileSelect(file);
      } catch (error) {
        alert(`Invalid file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      try {
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`File size too large. Maximum: ${maxSizeMB}MB`);
          return;
        }
        onFileSelect(file);
      } catch (error) {
        alert(`Invalid file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-[#eeff82] bg-[#6b4b5b]' 
            : 'border-[#92848b] hover:border-[#eeff82] hover:bg-[#6b4b5b]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📎</div>
          <div>
            <p className="text-sm font-medium">
              {selectedFile ? 'Click to change file' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-[#eeff82]">
              Max size: {maxSizeMB}MB • Supports: Images, Videos, PDFs, Documents
            </p>
          </div>
        </div>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-[#6b4b5b] p-3 rounded">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {PinataEvidenceUploader.getFileTypeIcon(selectedFile.type)}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{selectedFile.name}</p>
              <p className="text-xs text-[#eeff82]">
                {PinataEvidenceUploader.formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && PinataEvidenceUploader.isImageFile(selectedFile?.type || '') && (
        <div className="bg-[#6b4b5b] p-3 rounded">
          <p className="text-sm font-semibold mb-2">Preview:</p>
          <img
            src={preview}
            alt="Evidence preview"
            className="max-w-full max-h-40 object-contain rounded mx-auto"
          />
        </div>
      )}
    </div>
  );
}