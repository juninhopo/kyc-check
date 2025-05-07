document.addEventListener('DOMContentLoaded', () => {
    const image1Input = document.getElementById('image1');
    const image2Input = document.getElementById('image2');
    const compareButton = document.getElementById('compare');
    const preview1 = document.getElementById('preview1');
    const preview2 = document.getElementById('preview2');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const toggleDebugButton = document.getElementById('toggleDebug');
    const debugSection = document.getElementById('debug-section');
    const debugInfo = document.getElementById('debug-info');

    const ptBrButton = document.getElementById('pt-br');
    const enUsButton = document.getElementById('en-us');
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    let currentLanguage = 'pt';

    const setupTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        }
    };

    setupTheme();

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');

        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        localStorage.setItem('color-theme',
            document.documentElement.classList.contains('dark')
                ? 'dark'
                : 'light'
        );
    };

    themeToggleButton.addEventListener('click', toggleTheme);

    const translations = {
        'face-match': {
            'pt': 'As faces correspondem! Similaridade: {similarity}%',
            'en': 'Faces match! Similarity: {similarity}%'
        },
        'face-no-match': {
            'pt': 'As faces não correspondem. Similaridade: {similarity}%',
            'en': 'Faces don\'t match. Similarity: {similarity}%'
        },
        'select-images': {
            'pt': 'Por favor, selecione duas imagens.',
            'en': 'Please select two images.'
        },
        'processing-error': {
            'pt': 'Erro ao processar requisição: {error}',
            'en': 'Error processing request: {error}'
        },
        'show-debug': {
            'pt': 'Mostrar Informações de Debug',
            'en': 'Show Debug Information'
        },
        'hide-debug': {
            'pt': 'Ocultar Informações de Debug',
            'en': 'Hide Debug Information'
        },
        'no-info': {
            'pt': 'Nenhuma informação disponível.',
            'en': 'No information available.'
        }
    };

    /**
     * Change the UI language
     * @param {string} lang - Language code ('pt' or 'en')
     */
    const changeLanguage = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';

        if (lang === 'pt') {
            ptBrButton.classList.add('language-active');
            ptBrButton.classList.remove('opacity-50');
            enUsButton.classList.remove('language-active');
            enUsButton.classList.add('opacity-50');
        } else {
            enUsButton.classList.add('language-active');
            enUsButton.classList.remove('opacity-50');
            ptBrButton.classList.remove('language-active');
            ptBrButton.classList.add('opacity-50');
        }

        document.querySelectorAll('[data-lang-pt][data-lang-en]').forEach(element => {
            element.textContent = element.getAttribute(lang === 'pt' ? 'data-lang-pt' : 'data-lang-en');
        });

        const isDebugVisible = !debugSection.classList.contains('hidden');
        toggleDebugButton.querySelector('span').textContent = isDebugVisible
            ? translations[lang === 'pt' ? 'hide-debug' : 'show-debug'][lang]
            : translations[lang === 'pt' ? 'show-debug' : 'hide-debug'][lang];

        document.title = lang === 'pt' ? 'Validador Facial KYC' : 'KYC Facial Validator';

        if (!resultDiv.classList.contains('hidden')) {
            updateResultWithTranslation();
        }
    };

    const updateResultWithTranslation = () => {
        const similarityMatch = resultDiv.textContent.match(/(\d+)%/);
        if (!similarityMatch) return;

        const similarity = similarityMatch[1];
        const isMatch = resultDiv.classList.contains('bg-green-50') ||
                        resultDiv.classList.contains('dark:bg-green-900/30');

        const translationKey = isMatch ? 'face-match' : 'face-no-match';
        resultDiv.textContent = translations[translationKey][currentLanguage]
            .replace('{similarity}', similarity);
    };

    const updateUI = () => {
        const hasImage1 = image1Input.files && image1Input.files.length > 0;
        const hasImage2 = image2Input.files && image2Input.files.length > 0;

        if (hasImage1 && hasImage2) {
            compareButton.disabled = false;
            compareButton.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            compareButton.disabled = true;
            compareButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    };

    /**
     * Show image preview
     * @param {File} file - The image file
     * @param {HTMLElement} previewElement - Preview container element
     */
    const showPreview = (file, previewElement) => {
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                previewElement.innerHTML = '';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('max-w-full', 'max-h-full', 'object-contain');
                previewElement.appendChild(img);
            };

            reader.readAsDataURL(file);
        }
    };

    /**
     * Format debug information with syntax highlighting
     * @param {Object} debugInfo - The debug information object
     * @returns {string} Formatted HTML string with syntax highlighting
     */
    const formatDebugInfo = (debugInfo) => {
        if (!debugInfo) return translations['no-info'][currentLanguage];

        const jsonString = JSON.stringify(debugInfo, null, 4);

        const highlighted = jsonString.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                        match = match.replace(/"/g, '').replace(/:$/, ':');
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });

        return highlighted;
    };


    ptBrButton.addEventListener('click', () => changeLanguage('pt'));
    enUsButton.addEventListener('click', () => changeLanguage('en'));

    toggleDebugButton.addEventListener('click', () => {
        const isVisible = debugSection.classList.contains('hidden');
        if (isVisible) {
            debugSection.classList.remove('hidden');
            toggleDebugButton.querySelector('span').textContent = translations[currentLanguage === 'pt' ? 'hide-debug' : 'show-debug'][currentLanguage];
        } else {
            debugSection.classList.add('hidden');
            toggleDebugButton.querySelector('span').textContent = translations[currentLanguage === 'pt' ? 'show-debug' : 'hide-debug'][currentLanguage];
        }
    });

    image1Input.addEventListener('change', () => {
        showPreview(image1Input.files[0], preview1);
        updateUI();
    });

    image2Input.addEventListener('change', () => {
        showPreview(image2Input.files[0], preview2);
        updateUI();
    });

    compareButton.addEventListener('click', async () => {
        if (!image1Input.files[0] || !image2Input.files[0]) {
            resultDiv.textContent = translations['select-images'][currentLanguage];
            resultDiv.className = 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 p-4 rounded-md mt-4';
            resultDiv.classList.remove('hidden');
            return;
        }

        resultDiv.textContent = '';
        resultDiv.className = 'hidden';
        loadingDiv.classList.remove('hidden');
        compareButton.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image1', image1Input.files[0]);
            formData.append('image2', image2Input.files[0]);

            const response = await fetch('/api/validate-faces', {
                method: 'POST',
                headers: {
                    'Accept-Language': currentLanguage === 'pt' ? 'pt-BR' : 'en-US'
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const { isMatch, similarity, debugInfo } = result.data;
                const similarityPercent = Math.round(similarity * 100);

                if (isMatch) {
                    resultDiv.textContent = translations['face-match'][currentLanguage].replace('{similarity}', similarityPercent);
                    resultDiv.className = 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 p-4 rounded-md mt-4';
                } else {
                    resultDiv.textContent = translations['face-no-match'][currentLanguage].replace('{similarity}', similarityPercent);
                    resultDiv.className = 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 p-4 rounded-md mt-4';
                }

                document.getElementById('debug-info').innerHTML = `<pre class="json-formatter whitespace-pre-wrap">${formatDebugInfo(debugInfo)}</pre>`;
                resultDiv.classList.remove('hidden');
            } else {
                resultDiv.textContent = `Erro: ${result.error}`;
                resultDiv.className = 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 p-4 rounded-md mt-4';
                resultDiv.classList.remove('hidden');
            }
        } catch (error) {
            resultDiv.textContent = translations['processing-error'][currentLanguage].replace('{error}', error.message);
            resultDiv.className = 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 p-4 rounded-md mt-4';
            resultDiv.classList.remove('hidden');
        } finally {
            loadingDiv.classList.add('hidden');
            compareButton.disabled = false;
        }
    });
});