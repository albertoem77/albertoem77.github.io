// Keep the original Spanish alongside each English translation in the markup.
const LANGUAGE_STORAGE_KEY = 'portfolio-language';
let currentLanguage = 'es';

function getPreferredLanguage() {
    try {
        return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'es';
    } catch (error) {
        return 'es';
    }
}

function translateText(spanish, english) {
    return currentLanguage === 'en' ? english : spanish;
}

function setLanguage(language, persist = true) {
    if (language !== 'es' && language !== 'en') return;
    currentLanguage = language;
    document.documentElement.lang = language;

    document.querySelectorAll('[data-en]').forEach(element => {
        if (!element.hasAttribute('data-es')) {
            element.setAttribute('data-es', element.textContent);
        }
        element.textContent = element.getAttribute(`data-${language}`);
    });

    ['aria-label', 'placeholder', 'content'].forEach(attribute => {
        document.querySelectorAll(`[data-en-${attribute}]`).forEach(element => {
            const spanishAttribute = `data-es-${attribute}`;
            if (!element.hasAttribute(spanishAttribute)) {
                element.setAttribute(spanishAttribute, element.getAttribute(attribute) || '');
            }
            element.setAttribute(attribute, element.getAttribute(`data-${language}-${attribute}`));
        });
    });

    document.querySelectorAll('[data-language]').forEach(button => {
        const selected = button.dataset.language === language;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('bg-white', selected);
        button.classList.toggle('dark:bg-slate-700', selected);
        button.classList.toggle('shadow-sm', selected);
        button.classList.toggle('text-indigo-700', selected);
        button.classList.toggle('dark:text-indigo-300', selected);
    });

    // These controls describe their current state, so update them after the text.
    if (typeof updateThemeControls === 'function') updateThemeControls();
    if (typeof updateMobileMenuControls === 'function') updateMobileMenuControls();
    if (typeof filterProjects === 'function') filterProjects();

    if (persist) {
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch (error) {
            // Switching language also works when browser storage is unavailable.
        }
    }
}

function initializeLanguage() {
    setLanguage(getPreferredLanguage(), false);
}

initializeLanguage();
