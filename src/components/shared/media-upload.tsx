"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MediaUploadProps {
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];
  onRemove?: (index: number) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function MediaUpload({
  onUpload,
  existingUrls = [],
  onRemove,
  maxFiles = 5,
  accept = "image/*",
  className = "",
  disabled = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Calculate new dimensions (max 1920x1080)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.8 quality
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            resolve(compressedDataUrl);
          } else {
            reject(new Error("Failed to compress image"));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    if (existingUrls.length + files.length > maxFiles) {
      toast({ 
        title: `Maximum ${maxFiles} files allowed`,
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        
        // Compress image
        const compressedDataUrl = await compressImage(file);
        
        // Convert data URL to Blob
        const response = await fetch(compressedDataUrl);
        const blob = await response.blob();
        
        // Upload to server
        const formData = new FormData();
        formData.append("file", blob, file.name);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        }

        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      onUpload(uploadedUrls);
      toast({ title: `${uploadedUrls.length} file(s) uploaded successfully!` });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ 
        title: "Failed to upload files",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [existingUrls.length, maxFiles, compressImage, onUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            dragActive ? "bg-primary/10" : "bg-slate-100 dark:bg-slate-800"
          }`}>
            {uploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Upload className={`h-6 w-6 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </div>
          
          <div>
            <p className="text-sm font-semibold text-foreground">
              {uploading ? "Uploading..." : dragActive ? "Drop files here" : "Click or drag files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.includes("image") ? "PNG, JPG, WebP" : "All files"} · Max {maxFiles} files
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
              {uploadProgress.toFixed(0)}% complete
            </p>
          </div>
        )}
      </div>

      {/* File Previews */}
      {existingUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-video rounded-lg overflow-hidden border group"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="object-cover w-full h-full"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warning for max files */}
      {existingUrls.length >= maxFiles && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Maximum file limit reached. Remove some files to upload more.</span>
        </div>
      )}
    </div>
  );
}
