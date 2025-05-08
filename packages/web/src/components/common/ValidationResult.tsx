'use client';

import { ValidationResult as ValidationResultType } from '@/services/api';
import { motion } from 'framer-motion';

interface ValidationResultProps {
  result: ValidationResultType | null;
  loading: boolean;
}

export function ValidationResult({ result, loading }: ValidationResultProps) {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center my-4 sm:my-6">
        <div className="kyc-spinner mb-4"></div>
        <span
          className="text-sm text-primary-600 dark:text-primary-400 mt-2"
          data-lang-pt="Processando, por favor aguarde..."
          data-lang-en="Processing, please wait..."
        >
          Processando, por favor aguarde...
        </span>
      </div>
    );
  }

  if (!result && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      }}
      className="mt-6 rounded-lg overflow-hidden"
    >
      {result && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`p-4 ${
            result.isMatch
              ? 'bg-green-50 dark:bg-green-900/30'
              : 'bg-red-50 dark:bg-red-900/30'
          }`}
        >
          <div className="flex items-center justify-center">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                result.isMatch
                  ? 'bg-green-100 dark:bg-green-800/50'
                  : 'bg-red-100 dark:bg-red-800/50'
              }`}
            >
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: result.isMatch ? 0 : 180 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${
                  result.isMatch
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {result.isMatch ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                )}
              </motion.svg>
            </div>

            <div className="ml-4">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className={`text-lg font-medium ${
                  result.isMatch
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {result.isMatch
                  ? 'As imagens correspondem!'
                  : 'As imagens não correspondem'}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-2 text-sm"
              >
                <p
                  className={`${
                    result.isMatch
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {result.message}
                </p>

                {result.similarity !== undefined && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-2"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Similaridade: {Math.round(result.similarity * 100)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(result.similarity * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={`h-2.5 rounded-full ${
                          result.isMatch
                            ? 'bg-green-600 dark:bg-green-500'
                            : 'bg-red-600 dark:bg-red-500'
                        }`}
                      ></motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}