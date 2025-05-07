(function() {
    // Sempre usar dark mode como padrão, independente da preferência do sistema
    if (localStorage.getItem('color-theme') === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // Caso não tenha preferência salva ou seja 'dark', usar dark mode
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
})();