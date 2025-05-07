'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

// Exportamos o ThemeContext diretamente para ser acessível por componentes
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>('light');
  const [mounted, setMounted] = useState(false);

  // Efeito para inicializar o tema com base nas preferências do usuário
  useEffect(() => {
    // Primeiro, definimos montado como true para evitar renderização SSR do tema
    setMounted(true);

    // Verifica o tema salvo no localStorage ou usa a preferência do sistema
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Define o tema inicial
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Aplica o tema ao documento
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  // Função para alternar o tema
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  // Valor do contexto com o tema atual e a função para alterá-lo
  const contextValue = {
    theme,
    setTheme: handleSetTheme,
  };

  // Durante SSR ou antes da hidratação, renderiza apenas o placeholder dos filhos
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para acessar o contexto do tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export default ThemeProvider;