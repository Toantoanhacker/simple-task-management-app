// src/components/state.js

/**
 * Shared application state. Holds data that is fetched once and then used
 * by various components for rendering and filtering.
 */
export const state = {
    allImages: [],
    allPeople: [],
    allAssignments: [],
    selectedTags: [],
    currentlyAssigningImageId: null,
    lightbox: {
        scale: 1,
        isPanning: false,
        startX: 0,
        startY: 0,
        translateX: 0,
        translateY: 0,
    }
};

/**
 * A centralized object of references to all necessary DOM elements.
 * This prevents repeated getElementById calls throughout the code.
 */
export const dom = {
    gallery: document.getElementById('gallery'),
    sidebar: document.querySelector('.sidebar'),
    // Person management
    personNameInput: document.getElementById('person-name-input'),
    addPersonBtn: document.getElementById('add-person-btn'),
    peopleTagsContainer: document.getElementById('people-tags-container'),
    personColorInput: document.getElementById('person-color-input'),
    // Image management
    addImageBtn: document.getElementById('add-image-btn'),
    addImageModal: document.getElementById('add-image-modal'),
    addImageForm: document.getElementById('add-image-form'),
    imageCaptionInput: document.getElementById('image-caption-input'),
    imageFileInput: document.getElementById('image-file-input'),
    // Assignment modal
    assignPersonModal: document.getElementById('assign-person-modal'),
    // search
    searchInput: document.getElementById('search-input'),
    //search by tags
    tagFilterContainer: document.getElementById('tag-filter-container'),
    tagFilterBtn: document.getElementById('tag-filter-btn'),
    tagFilterDropdown: document.getElementById('tag-filter-dropdown'),
    tagFilterClearBtn: document.getElementById('tag-filter-clear-btn'),
    // Lightbox
    lightbox: document.getElementById('lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    zoomInBtn: document.getElementById('zoom-in-btn'),
    zoomOutBtn: document.getElementById('zoom-out-btn'),
};