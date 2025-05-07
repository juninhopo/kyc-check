'use client';

import { useState, useEffect, useContext } from 'react';
import { faceValidationService, ValidationResult } from '@/services/api';
import { ThemeContext } from '@/components/providers/ThemeProvider';
import { MoonIcon, SunIcon } from '@/components/icons/ThemeIcons';
import './KYCValidator.css';

export default function KYCValidator() {
  const themeContext = useContext(ThemeContext);

  const [localTheme, setLocalTheme] = useState<string>('light');
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [currentLang, setCurrentLang] = useState('pt-br');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (!themeContext) {
      try {
        const storedTheme = localStorage?.getItem('theme');
        const prefersDark = window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
        setLocalTheme(initialTheme);

        if (initialTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      } catch (e) {
      }
    } else {
      setLocalTheme(themeContext.theme);

      if (themeContext.theme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }, [themeContext]);

  const handleThemeToggle = () => {
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';

    if (themeContext) {
      themeContext.setTheme(newTheme);
    } else {
      setLocalTheme(newTheme);
      localStorage.setItem('theme', newTheme);

      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  };

  const handleImage1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage1(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview1(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImage2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage2(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview2(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compareFaces = async () => {
    if (!image1 || !image2) return;

    setLoading(true);
    try {
      const result = await faceValidationService.validateFaces(image1, image2);
      setResult(result);
      setDebugInfo(result);
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

  const toggleDebug = () => {
    setShowDebug(!showDebug);
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

  const currentTheme = themeContext?.theme || localTheme;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="kyc-card rounded-lg shadow-md p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center">
            <img src="/kyc-icon.png" alt="KYC Icon" className="h-10 w-10 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-primary-800 dark:text-gray-100">KYC Check</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => switchLanguage('pt-br')}
                className={`flex items-center px-2 py-1 rounded-md ${currentLang === 'pt-br' ? 'kyc-lang-active' : 'opacity-50'}`}
              >
                <img src="https://flagcdn.com/w40/br.png" alt="Português" className="kyc-flag-icon" />
                <span className="ml-1">PT</span>
              </button>
              <button
                onClick={() => switchLanguage('en-us')}
                className={`flex items-center px-2 py-1 rounded-md ${currentLang === 'en-us' ? 'kyc-lang-active' : 'opacity-50'}`}
              >
                <img src="https://flagcdn.com/w40/us.png" alt="English" className="kyc-flag-icon" />
                <span className="ml-1">EN</span>
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleThemeToggle}
                className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={currentTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              >
                {currentTheme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-yellow-300" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-primary-800" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="kyc-card p-4 rounded-lg">
            <label
              htmlFor="image1"
              className="block text-primary-700 dark:text-gray-300 font-medium mb-2 text-sm"
              data-lang-pt="Imagem da Pessoa 1"
              data-lang-en="Person 1 Image"
            >
              Imagem da Pessoa 1
            </label>
            <div className="relative">
              <input
                type="file"
                id="image1"
                accept="image/*"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                onChange={handleImage1Change}
              />
              <div className="kyc-upload-area rounded-lg p-4 text-center flex flex-col items-center justify-center h-24 sm:h-32">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400 dark:text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span
                  className="text-xs sm:text-sm text-primary-500 dark:text-primary-400"
                  data-lang-pt="Clique ou arraste uma imagem"
                  data-lang-en="Click or drag an image"
                >
                  Clique ou arraste uma imagem
                </span>
              </div>
            </div>
          </div>

          <div className="kyc-card p-4 rounded-lg">
            <label
              htmlFor="image2"
              className="block text-primary-700 dark:text-gray-300 font-medium mb-2 text-sm"
              data-lang-pt="Imagem da Pessoa 2"
              data-lang-en="Person 2 Image"
            >
              Imagem da Pessoa 2
            </label>
            <div className="relative">
              <input
                type="file"
                id="image2"
                accept="image/*"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                onChange={handleImage2Change}
              />
              <div className="kyc-upload-area rounded-lg p-4 text-center flex flex-col items-center justify-center h-24 sm:h-32">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400 dark:text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span
                  className="text-xs sm:text-sm text-primary-500 dark:text-primary-400"
                  data-lang-pt="Clique ou arraste uma imagem"
                  data-lang-en="Click or drag an image"
                >
                  Clique ou arraste uma imagem
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="kyc-preview rounded-lg p-4 flex items-center justify-center h-48 sm:h-64">
            <div id="preview1" className="w-full h-full flex items-center justify-center">
              {preview1 ? (
                <img src={preview1} alt="Preview 1" className="max-h-full max-w-full object-contain" />
              ) : (
                <span
                  className="text-sm text-primary-500 dark:text-primary-400"
                  data-lang-pt="Prévia 1"
                  data-lang-en="Preview 1"
                >
                  Prévia 1
                </span>
              )}
            </div>
          </div>

          <div className="kyc-preview rounded-lg p-4 flex items-center justify-center h-48 sm:h-64">
            <div id="preview2" className="w-full h-full flex items-center justify-center">
              {preview2 ? (
                <img src={preview2} alt="Preview 2" className="max-h-full max-w-full object-contain" />
              ) : (
                <span
                  className="text-sm text-primary-500 dark:text-primary-400"
                  data-lang-pt="Prévia 2"
                  data-lang-en="Preview 2"
                >
                  Prévia 2
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={compareFaces}
            disabled={!image1 || !image2 || loading}
            className={`flex items-center kyc-compare-btn rounded-md py-2 px-4 text-sm font-medium ${(!image1 || !image2) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span
              data-lang-pt="Comparar Faces"
              data-lang-en="Compare Faces"
            >
              Comparar Faces
            </span>
          </button>
        </div>

        <div id="loading" className={`flex flex-col justify-center items-center my-4 sm:my-6 ${loading ? '' : 'hidden'}`}>
          <div className="kyc-spinner mb-4"></div>
          <span
            className="text-sm text-primary-600 dark:text-primary-400 mt-2"
            data-lang-pt="Processando, por favor aguarde..."
            data-lang-en="Processing, please wait..."
          >
            Processando, por favor aguarde...
          </span>
        </div>

        {result && (
          <div
            id="result"
            className={`rounded-md p-3 sm:p-4 text-center font-medium text-sm sm:text-base ${result.isMatch ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}
          >
            {result.isMatch
              ? `As faces correspondem! Similaridade: ${(result.similarity * 100).toFixed(2)}%`
              : `As faces não correspondem. Similaridade: ${(result.similarity * 100).toFixed(2)}%`}
          </div>
        )}
      </div>

      <div className="text-center mt-4 sm:mt-6">
        <button
          onClick={toggleDebug}
          className="kyc-debug-btn rounded-md py-1 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm  "
        >
          <span
            data-lang-pt="Mostrar Informações de Debug"
            data-lang-en="Show Debug Information"
          >
            {showDebug ? 'Ocultar Informações de Debug' : 'Mostrar Informações de Debug'}
          </span>
        </button>
      </div>

      {showDebug && (
        <div id="debug-section" className="kyc-card rounded-lg shadow-md mt-4 sm:mt-6 p-4 sm:p-6">
          <h3
            className="text-lg sm:text-xl font-semibold font-display text-primary-700 dark:text-gray-200 mb-3 sm:mb-4 border-b pb-2"
            data-lang-pt="Informações de Debug"
            data-lang-en="Debug Information"
          >
            Informações de Debug
          </h3>
          <div id="debug-info" className="bg-gray-50 dark:bg-gray-800 text-primary-800 dark:text-gray-300 font-mono text-xs sm:text-sm p-3 sm:p-4 rounded-md overflow-auto max-h-64 sm:max-h-96 border">
            <pre className="json-formatter">
              {debugInfo ? JSON.stringify(debugInfo, null, 2) : (
                <span
                  data-lang-pt="Nenhuma informação disponível."
                  data-lang-en="No information available."
                >
                  Nenhuma informação disponível.
                </span>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}