document.addEventListener("DOMContentLoaded", async () => {
    const components = [
        { id: "header-slot", file: "components/header.html" },
        { id: "about-slot", file: "components/about.html" },
        { id: "publications-slot", file: "components/publications.html" },
        { id: "activities-slot", file: "components/activities.html" },
        { id: "projects-slot", file: "components/projects.html" },
        { id: "teaching-slot", file: "components/teaching.html" },
        { id: "notes-slot", file: "components/notes.html" }
    ];

    await Promise.all(
        components.map(async (comp) => {
            try {
                const res = await fetch(comp.file);
                if (res.ok) {
                    const html = await res.text();
                    document.getElementById(comp.id).innerHTML = html;
                } else {
                    console.error(`No se ha podido cargar el componente: ${comp.file}`);
                    const slot = document.getElementById(comp.id);
                    slot.textContent = "No se ha podido cargar esta sección. Recarga la página para volver a intentarlo.";
                    slot.setAttribute("data-en", "This section could not be loaded. Reload the page to try again.");
                }
            } catch (err) {
                console.error(`Error al cargar ${comp.file}:`, err);
                const slot = document.getElementById(comp.id);
                slot.textContent = "No se ha podido cargar esta sección. Recarga la página para volver a intentarlo.";
                slot.setAttribute("data-en", "This section could not be loaded. Reload the page to try again.");
            }
        })
    );

    // Initialize Lucide icons after all DOM components are loaded
    if (window.lucide) {
        lucide.createIcons();
    }
    switchTab('about');
    resetAllFilters();
    initializeLanguage();
});
