// Navigation and controls for the static portfolio.
function switchTab(tabId) {
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (!activeTab) return;

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.toggle('active', tab === activeTab);
    });
    document.querySelectorAll('.nav-btn').forEach(button => {
        const active = button.id === `nav-${tabId}`;
        button.classList.toggle('text-indigo-800', active);
        button.classList.toggle('dark:text-indigo-400', active);
        button.classList.toggle('font-semibold', active);
        button.classList.toggle('text-slate-600', !active);
        button.classList.toggle('dark:text-slate-400', !active);
        if (active) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });
}

function updateThemeControls() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('theme-icon-dark')?.classList.toggle('hidden', isDark);
    document.getElementById('theme-icon-light')?.classList.toggle('hidden', !isDark);
    document.getElementById('theme-toggle')?.setAttribute('aria-label', isDark
        ? translateText('Activar tema claro', 'Switch to light theme')
        : translateText('Activar tema oscuro', 'Switch to dark theme'));
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    updateThemeControls();
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.classList.toggle('hidden');
    updateMobileMenuControls();
}

function updateMobileMenuControls() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    const expanded = !menu.classList.contains('hidden');
    const button = document.getElementById('mobile-menu-btn');
    button?.setAttribute('aria-expanded', String(expanded));
    button?.setAttribute('aria-label', expanded
        ? translateText('Cerrar menú de navegación', 'Close navigation menu')
        : translateText('Abrir menú de navegación', 'Open navigation menu'));
}

function toggleAbstract(id) {
    const abstract = document.getElementById(id);
    if (!abstract) return;
    const expanded = !abstract.classList.toggle('hidden');
    document.querySelector(`[aria-controls="${id}"]`)?.setAttribute('aria-expanded', String(expanded));
}

function createFilterHandler(cardSelector, buttonSelector) {
    return function(category = 'all') {
        document.querySelectorAll(cardSelector).forEach(card => {
            const categories = (card.dataset.category || '').split(/\s+/);
            card.style.display = category === 'all' || categories.includes(category) ? '' : 'none';
        });
        document.querySelectorAll(buttonSelector).forEach(button => {
            const active = button.dataset.filter === category;
            button.classList.toggle('bg-white', active);
            button.classList.toggle('dark:bg-slate-800', active);
            button.classList.toggle('shadow-sm', active);
            button.classList.toggle('text-slate-900', active);
            button.classList.toggle('dark:text-white', active);
            button.classList.toggle('text-slate-600', !active);
            button.classList.toggle('dark:text-slate-400', !active);
            button.setAttribute('aria-pressed', String(active));
        });
    };
}

const filterPubs = createFilterHandler('.pub-card', '.pub-filter-btn');
const filterPubs2 = createFilterHandler('.pub-card2', '.pub-filter-btn2');

function resetAllFilters() {
    filterPubs('all');
    filterPubs2('all');
}

function filterProjects() {
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const query = normalize(document.getElementById('project-search')?.value.trim() || '');
    let visibleCount = 0;
    document.querySelectorAll('.project-card').forEach(card => {
        // Search both versions so changing language preserves the search results.
        const translations = [...card.querySelectorAll('[data-en]')]
            .map(element => `${element.dataset.es || ''} ${element.dataset.en}`).join(' ');
        const matches = normalize(`${card.textContent} ${translations}`).includes(query);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });
    document.getElementById('project-empty')?.classList.toggle('hidden', visibleCount > 0);
}

let bibtexTrigger = null;
let copyTimeout = null;

function resetCopyButton() {
    const button = document.getElementById('copy-bibtex-btn');
    if (!button) return;
    clearTimeout(copyTimeout);
    button.disabled = false;
    button.classList.remove('bg-emerald-600');
    button.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
    button.innerHTML = '<i data-lucide="copy" class="w-4 h-4" aria-hidden="true"></i>' +
        `<span data-es="Copiar cita" data-en="Copy citation">${translateText('Copiar cita', 'Copy citation')}</span>`;
    if (window.lucide) lucide.createIcons();
}

function openBibtexModal(bibId) {
    const citation = bibliography[bibId];
    const modal = document.getElementById('bibtex-modal');
    const container = document.getElementById('bibtex-content');
    if (!modal || !container || !citation) return;
    bibtexTrigger = document.activeElement;
    resetCopyButton();
    container.textContent = citation;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    modal.querySelector('button')?.focus();
}

function closeBibtexModal() {
    const modal = document.getElementById('bibtex-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    resetCopyButton();
    bibtexTrigger?.focus();
}

async function copyBibtex(button) {
    const content = document.getElementById('bibtex-content')?.textContent;
    if (!content) return;
    try {
        await navigator.clipboard.writeText(content);
        button.disabled = true;
        button.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
        button.classList.add('bg-emerald-600');
        button.innerHTML = '<i data-lucide="check" class="w-4 h-4" aria-hidden="true"></i>' +
            `<span data-es="¡Copiado!" data-en="Copied!">${translateText('¡Copiado!', 'Copied!')}</span>`;
        if (window.lucide) lucide.createIcons();
    } catch (error) {
        button.innerHTML = '<span data-es="Selecciona y copia el texto de la cita" data-en="Select and copy the citation text">' +
            translateText('Selecciona y copia el texto de la cita', 'Select and copy the citation text') + '</span>';
    }
    copyTimeout = setTimeout(resetCopyButton, 3000);
}

// Keep the citation dialog usable with the keyboard.
document.addEventListener('keydown', event => {
    const modal = document.getElementById('bibtex-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    if (event.key === 'Escape') closeBibtexModal();
    if (event.key === 'Tab') {
        const buttons = [...modal.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    }
});

document.getElementById('bibtex-modal')?.addEventListener('click', event => {
    if (event.target.id === 'bibtex-modal') closeBibtexModal();
});
