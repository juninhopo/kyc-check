import React, { useState } from 'react';

interface DebugInfoProps {
  data: any;
}

const formatJSON = (obj: any): React.ReactElement => {
  const formatValue = (value: any, isKey = false): React.ReactElement => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'string') {
      return isKey ?
        <span className="text-yellow-500 dark:text-yellow-400">"{value}"</span> :
        <span className="text-green-500 dark:text-green-400">"{value}"</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-500 dark:text-blue-400">{value}</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-500 dark:text-purple-400">{String(value)}</span>;
    }

    if (Array.isArray(value)) {
      return formatArray(value);
    }

    if (typeof value === 'object') {
      return formatObject(value);
    }

    return <span>{String(value)}</span>;
  };

  const formatArray = (arr: any[]): React.ReactElement => {
    if (arr.length === 0) {
      return <span>[ ]</span>;
    }

    return (
      <span>
        [
        <div className="pl-4">
          {arr.map((item, index) => (
            <div key={index}>
              {formatValue(item)}
              {index < arr.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
        </div>
        ]
      </span>
    );
  };

  const formatObject = (obj: Record<string, any>): React.ReactElement => {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return <span>{ }</span>;
    }

    return (
      <span>
        {"{"}
        <div className="pl-4">
          {keys.map((key, index) => (
            <div key={key}>
              {formatValue(key, true)}: {formatValue(obj[key])}
              {index < keys.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
        </div>
        {"}"}
      </span>
    );
  };

  return formatObject(obj);
};

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
            {showDebug ? "Hide Debug Information" : "Show Debug Information"}
          </span>
        </button>
      </div>

      {showDebug && (
        <div id="debug-section" className="kyc-card rounded-lg shadow-md mt-4 sm:mt-6 p-4 sm:p-6 max-w-[800px] mx-auto">
          <h3
            className="text-lg sm:text-xl font-semibold font-display text-primary-700 dark:text-gray-200 mb-3 sm:mb-4 border-b pb-2"
            data-lang-pt="Informações de Debug"
            data-lang-en="Debug Information"
          >
            Debug Information
          </h3>
          <div id="debug-info" className="bg-gray-50 dark:bg-gray-800 text-primary-800 dark:text-gray-300 font-mono text-xs sm:text-sm p-3 sm:p-4 rounded-md overflow-auto max-h-64 sm:max-h-96 border">
            {data ? (
              <div className="json-formatter">
                {formatJSON(data)}
              </div>
            ) : (
              <span
                data-lang-pt="Nenhuma informação disponível."
                data-lang-en="No information available."
              >
                No information available.
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};