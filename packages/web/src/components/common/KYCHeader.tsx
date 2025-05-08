import { useContext } from 'react';
import { ThemeContext } from '@/components/providers/ThemeProvider';
import { MoonIcon, SunIcon } from '@/components/icons/ThemeIcons';
import { LanguageSwitcher } from './LanguageSwitcher';

interface KYCHeaderProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const KYCHeader = ({ currentLang, onLanguageChange }: KYCHeaderProps) => {
  const themeContext = useContext(ThemeContext);

  const handleThemeToggle = () => {
    if (themeContext) {
      const newTheme = themeContext.theme === 'dark' ? 'light' : 'dark';
      themeContext.setTheme(newTheme);
    }
  };

  const currentTheme = themeContext?.theme || 'light';

  return (
    <div className="flex flex-col  items-center sm:flex-row sm:justify-between mb-6 sm:mb-8 gap-4">
      <div className="flex items-center">
        <img src="/kyc-icon.png" alt="KYC Icon" className="h-10 w-10 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-primary-800 dark:text-gray-100">KYC Check</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
        />
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
  );
};