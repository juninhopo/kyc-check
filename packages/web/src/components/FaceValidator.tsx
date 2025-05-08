'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faceValidationService, ValidationResult } from '@/services/api';
import { ImageUploader } from './common/ImageUploader';
import { ValidationResult as ValidationResultComponent } from './common/ValidationResult';
import { CompareButton } from './common/CompareButton';

export default function FaceValidator() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReferenceChange = (file: File) => {
    setReferenceImage(file);
    setError(null);
  };

  const handleSelfieChange = (file: File) => {
    setSelfieImage(file);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setValidationResult(null);

    if (!referenceImage || !selfieImage) {
      setError('Por favor, selecione ambas as imagens.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await faceValidationService.validateFaces(referenceImage, selfieImage);
      setValidationResult(result);
    } catch (err) {
      setError(`Erro na validação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setReferenceImage(null);
    setSelfieImage(null);
    setValidationResult(null);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold mb-6 text-primary-800 dark:text-gray-100"
      >
        Validação Facial KYC
      </motion.h2>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ImageUploader
              id="reference"
              label="Documento com Foto"
              labelPt="Documento com Foto"
              labelEn="ID Document with Photo"
              onImageChange={handleReferenceChange}
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ImageUploader
              id="selfie"
              label="Selfie"
              labelPt="Selfie"
              labelEn="Selfie"
              onImageChange={handleSelfieChange}
            />
          </motion.div>
        </motion.div>

        {/* Mensagens de erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md dark:bg-red-900 dark:text-red-200 dark:border-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center py-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear"
                }}
                className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full"
              />
            </motion.div>
          ) : (
            validationResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <ValidationResultComponent
                  result={validationResult}
                  loading={isLoading}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex gap-4 justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Limpar
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <CompareButton
              onClick={handleSubmit}
              disabled={!referenceImage || !selfieImage || isLoading}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}