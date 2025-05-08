import { useState, useEffect } from 'react';

interface LanguageSwitcherProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSwitcher = ({ currentLang, onLanguageChange }: LanguageSwitcherProps) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onLanguageChange('pt-br')}
        className={`flex items-center px-2 py-1 rounded-md light:border dark:bg-[#323a4e] ${currentLang === 'pt-br' ? 'kyc-lang-active shadow' : 'opacity-50'}`}
      >
        <img src="https://flagcdn.com/w40/br.png" alt="Português" className="kyc-flag-icon" />
        <span className="ml-1">PT</span>
      </button>
      <button
        onClick={() => onLanguageChange('en-us')}
        className={`flex items-center px-2 py-1 rounded-md light:border dark:bg-[#323a4e] ${currentLang === 'en-us' ? 'kyc-lang-active shadow' : 'opacity-50'}`}
      >
        <img src="https://flagcdn.com/w40/us.png" alt="English" className="kyc-flag-icon" />
        <span className="ml-1">EN</span>
      </button>
    </div>
  );
};