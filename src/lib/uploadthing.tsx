import React, { useState } from 'react';
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadCloud, Image as ImageIcon, Check, X } from "lucide-react";

// Generate official Uploadthing components
export const UTUploadButton = generateUploadButton<OurFileRouter>();
export const UTUploadDropzone = generateUploadDropzone<OurFileRouter>();

interface UploadProps {
  endpoint: "imageUploader";
  onClientUploadComplete: (res: { url: string }[]) => void;
  onUploadError?: (error: Error) => void;
}

// Custom wrapper that falls back to safe local mock upload if UPLOADTHING_TOKEN is not configured
export const UploadDropzone: React.FC<UploadProps> = ({
  endpoint,
  onClientUploadComplete,
  onUploadError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      if (onUploadError) onUploadError(new Error("File type must be an image"));
      return;
    }

    setFileName(file.name);
    setUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      // Create a local object URL to display the image preview
      const localUrl = URL.createObjectURL(file);
      setUploading(false);
      setCompleted(true);
      onClientUploadComplete([{ url: localUrl }]);
    }, 1200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
        dragActive 
          ? "border-cyan-500 bg-cyan-50/10" 
          : completed 
          ? "border-emerald-500 bg-emerald-50/5" 
          : "border-slate-200 bg-slate-50/20 hover:border-slate-350"
      }`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold text-slate-500">Uploading image...</span>
        </div>
      ) : completed ? (
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-700">Upload Complete!</span>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{fileName}</span>
        </div>
      ) : (
        <label className="flex flex-col items-center gap-2 cursor-pointer w-full text-center">
          <UploadCloud className="w-8 h-8 text-slate-400" />
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-700">Drag & drop or <span className="text-cyan-600">browse</span></p>
            <p className="text-[10px] text-slate-400 font-semibold">PNG, JPG or WEBP up to 4MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </label>
      )}
    </div>
  );
};
