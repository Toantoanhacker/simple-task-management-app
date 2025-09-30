// src/main.js

// Import all modules
import { state, dom } from './components/state.js';
import * as api from './components/api.js';
import * as ui from './components/ui.js';
import * as handlers from './components/handlers.js';
import { setupLightboxListeners } from './components/lightbox.js';

/**
 * The main initialization function for the application.
 * Fetches all necessary data and performs the initial render.
 */
export async function initializeApp() {
    const [images, people, assignments] = await Promise.all([
        api.fetchImages(),
        api.fetchPeople(),
        api.fetchAssignments()
    ]);

    // Store fetched data in our global state
    state.allImages = images;
    state.allPeople = people;
    state.allAssignments = assignments;
    
    // Perform the initial render
    ui.renderGallery(state.allImages, state.allPeople, state.allAssignments);
    ui.renderPeople(state.allPeople);
}

// =======================================================
// SETUP GLOBAL EVENT LISTENERS
// =======================================================
function setupEventListeners() {
    dom.addPersonBtn.addEventListener('click', handlers.handleAddPerson);
    dom.addImageForm.addEventListener('submit', handlers.handleImageUpload);
    dom.addImageBtn.addEventListener('click', () => {
        dom.addImageModal.style.display = 'block';
    });
    
    dom.imageFileInput.addEventListener('change', handlers.handleFileSelect);
    // search listener
        dom.searchInput.addEventListener('input', handlers.handleSearch);

    // Modal closing listeners
    document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = handlers.closeAllModals);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) handlers.closeAllModals();
    });

    // Setup all lightbox-related events (zoom, pan, etc.)
    setupLightboxListeners();
}


// --- Start the application ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});