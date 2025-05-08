'use client';

import { ChangeEvent, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  id: string;
  label: string;
  labelPt?: string;
  labelEn?: string;
  onImageChange: (file: File) => void;
}

export function ImageUploader({
  id,
  label,
  labelPt,
  labelEn,
  onImageChange
}: ImageUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFile(file);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
      onImageChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    handleFile(file);
  };

  const removeImage = () => {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        data-lang-pt={labelPt}
        data-lang-en={labelEn}
      >
        {label}
      </label>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{
          opacity: 1,
          boxShadow: isDragging ? "0px 0px 0px 2px rgba(59, 130, 246, 0.5)" : "none"
        }}
        transition={{ duration: 0.2 }}
        className={`
          relative border-2 p-2 shadow-md border-dashed rounded-lg cursor-pointer
          ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60'}
          hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-all duration-200
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {!imageSrc ? (
            <motion.div
              key="upload-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center p-6 "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or JPEG
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="image-preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <motion.img
                initial={{ filter: "blur(8px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={{ duration: 0.5 }}
                src={imageSrc}
                alt="Selected image"
                className="object-contain w-full max-h-48 rounded-lg"
              />
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-2 right-2 p-1.5 bg-gray-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}