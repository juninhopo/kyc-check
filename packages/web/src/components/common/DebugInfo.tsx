import { useState } from 'react';

interface DebugInfoProps {
  data: any;
}

export const DebugInfo = ({ data }: DebugInfoProps) => {
  const [showDebug, setShowDebug] = useState(false);

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <>
      <div className="text-center mt-4 sm:mt-6">
        <button
          onClick={toggleDebug}
          className="kyc-debug-btn rounded-md py-1 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm"
        >
          <span
            data-lang-pt={showDebug ? "Ocultar Informações de Debug" : "Mostrar Informações de Debug"}
            data-lang-en={showDebug ? "Hide Debug Information" : "Show Debug Information"}
          >
            {showDebug ? "Ocultar Informações de Debug" : "Mostrar Informações de Debug"}
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
              {data ? JSON.stringify(data, null, 2) : (
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
    </>
  );
};