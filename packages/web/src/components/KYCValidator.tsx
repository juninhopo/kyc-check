'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faceValidationService, ValidationResult } from '@/services/api';

// Import our new components
import { KYCHeader } from './common/KYCHeader';
import { ImageUploader } from './common/ImageUploader';
import { ValidationResult as ValidationResultComponent } from './common/ValidationResult';
import { DebugInfo } from './common/DebugInfo';
import { CompareButton } from './common/CompareButton';

const tabVariants = {
  inactive: { opacity: 0.6, },
  active: { opacity: 1,  },
};

const contentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function KYCValidator() {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [currentLang, setCurrentLang] = useState('pt-br');
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('face');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImage1Change = (file: File) => {
    setImage1(file);
  };

  const handleImage2Change = (file: File) => {
    setImage2(file);
  };

  const compareFaces = async () => {
    if (!image1 || !image2) return;

    setLoading(true);
    try {
      const result = await faceValidationService.validateFaces(image1, image2);
      setResult(result);
    } catch (error) {
      console.error("Erro na comparação:", error);
      setResult({
        isMatch: false,
        similarity: 0,
        message: 'Ocorreu um erro durante a comparação.'
      });
    } finally {
      setLoading(false);
    }
  };

  const switchLanguage = (lang: string) => {
    setCurrentLang(lang);

    if (isMounted) {
      const elements = document.querySelectorAll('[data-lang-pt], [data-lang-en]');
      elements.forEach(el => {
        const element = el as HTMLElement;
        if (lang === 'pt-br') {
          element.textContent = element.getAttribute('data-lang-pt');
        } else {
          element.textContent = element.getAttribute('data-lang-en');
        }
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!isMounted) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="kyc-card rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 mr-3 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-32 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="kyc-card p-4 h-40 bg-gray-100"></div>
            <div className="kyc-card p-4 h-40 bg-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto py-8 px-4 sm:px-6 md:px-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-primary-900 dark:text-gray-100">
          Sistema de Validação KYC
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Validação segura e precisa de identidade
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'face' ? 'active' : 'inactive'}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTabChange('face')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'face'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Validação Facial
          </motion.button>
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'document' ? 'active' : 'inactive'}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTabChange('document')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'document'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Validação de Documento
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={contentVariants}
        >
          {activeTab === 'face' && (
            <div className="kyc-card rounded-lg shadow-md p-6 sm:p-8 mb-8">
              <KYCHeader
                currentLang={currentLang}
                onLanguageChange={switchLanguage}
              />

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <ImageUploader
                  id="image1"
                  label="Imagem da Pessoa 1"
                  labelPt="Imagem da Pessoa 1"
                  labelEn="Person 1 Image"
                  onImageChange={handleImage1Change}
                />

                <ImageUploader
                  id="image2"
                  label="Imagem da Pessoa 2"
                  labelPt="Imagem da Pessoa 2"
                  labelEn="Person 2 Image"
                  onImageChange={handleImage2Change}
                />
              </div>

              <CompareButton
                onClick={compareFaces}
                disabled={!image1 || !image2 || loading}
              />

              <ValidationResultComponent
                result={result}
                loading={loading}
              />
            </div>
          )}
          {activeTab === 'document' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-gray-100">
                Validação de Documento
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Recurso de validação de documento em desenvolvimento.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <DebugInfo data={result} />
    </motion.div>
  );
}