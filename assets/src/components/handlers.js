// src/components/handlers.js

import { supabase } from '../DBClient.js';
import { state, dom } from './state.js';
import { initializeApp } from '../main.js'; // Import initializeApp to trigger UI refreshes
import { renderGallery } from './ui.js';

// =======================================================
// SEARCH HANDLERS : NEW SECTION
// =======================================================

/**
 * Normalizes text for searching by removing cases, dashes, and underscores.
 * E.g., "Doctor_Add-Patient" -> "doctor add patient"
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string.
 */
function normalizeText(str) {
    if (!str) return '';
    return str
        .replace(/_|-/g, ' ') // Replace underscores and dashes with spaces
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters in camelCase
        .toLowerCase()
        .trim();
}

/**
 * Filters and re-renders the gallery based on the search input value.
 */
export function handleSearch() {
    const searchTerm = normalizeText(dom.searchInput.value);

    if (!searchTerm) {
        // If search is empty, render all images
        renderGallery(state.allImages, state.allPeople, state.allAssignments);
        return;
    }

    const filteredImages = state.allImages.filter(image => {
        const normalizedCaption = normalizeText(image.caption);
        return normalizedCaption.includes(searchTerm);
    });

    // Render only the filtered images
    renderGallery(filteredImages, state.allPeople, state.allAssignments);
}

// =======================================================
// MODAL HANDLERS
// =======================================================
export function openAssignModal(imageId, caption, people) {
    state.currentlyAssigningImageId = imageId;
    document.getElementById('assign-modal-caption').textContent = `"${caption}"`;
    const listDiv = document.getElementById('assignable-people-list');
    listDiv.innerHTML = '';
    people.forEach(person => {
        const btn = document.createElement('button');
        btn.className = 'assignable-person';
        btn.textContent = person.name;
        btn.style.borderLeft = `5px solid ${person.tag_color}`;
        btn.onclick = () => handleAssignPerson(person.id);
        listDiv.appendChild(btn);
    });
    dom.assignPersonModal.style.display = 'block';
}

export function closeAllModals() {
    dom.addImageModal.style.display = 'none';
    dom.assignPersonModal.style.display = 'none';
}

// =======================================================
// IMAGE HANDLERS
// =======================================================
export async function handleCaptionUpdate(imageId, newCaption) {
    const trimmedCaption = newCaption.trim();
    if (!trimmedCaption) {
        alert("Caption cannot be empty.");
        initializeApp();
        return;
    }
    const { error } = await supabase.from('images').update({ caption: trimmedCaption }).eq('id', imageId);
    if (error) {
        console.error('Error updating caption:', error);
        alert('Failed to save caption.');
    } else {
        const sidebarLinkText = document.querySelector(`a[href="#${imageId}"] .nav-link-text`);
        if (sidebarLinkText) sidebarLinkText.textContent = trimmedCaption;
    }
}

export async function handleNotesUpdate(imageId, newNotes) {
    const { error } = await supabase.from('images').update({ notes: newNotes.trim() }).eq('id', imageId);
    if (error) {
        console.error('Error updating notes:', error);
        alert('Failed to save notes.');
    }
}

export async function handleTaskUpdate(imageId, taskColumn, isChecked) {
  const { error } = await supabase.from('images').update({ [taskColumn]: isChecked }).eq('id', imageId);
  if (error) {
    console.error('Error updating task:', error);
    alert('Could not save task status.');
  } else {
    initializeApp();
  }
}

export async function handleDeleteImage(imageId, imageUrl) {
    if (!confirm('Are you sure you want to permanently delete this image?')) return;
    const fileName = imageUrl.split('/').pop();
    const [dbResult, storageResult] = await Promise.all([
        supabase.from('images').delete().eq('id', imageId),
        supabase.storage.from('images').remove([fileName])
    ]);
    if (dbResult.error || storageResult.error) {
        console.error('Error deleting image:', dbResult.error || storageResult.error);
        alert('Failed to delete image.');
    } else {
        initializeApp();
    }
}

// =======================================================
// UPLOAD HANDLERS
// =======================================================
export function handleFileSelect() {
    const files = dom.imageFileInput.files;
    if (files.length === 1) {
        const file = files[0];
        const fileName = file.name;
        const lastDotIndex = fileName.lastIndexOf('.');
        const captionText = (lastDotIndex !== -1) ? fileName.substring(0, lastDotIndex) : fileName;
        dom.imageCaptionInput.value = captionText;
        dom.addImageModal.style.display = 'block';
    } else if (files.length > 1) {
        handleMultipleImageUpload(files);
        dom.addImageForm.reset();
    }
}

export async function handleImageUpload(event) {
    event.preventDefault();
    const caption = dom.imageCaptionInput.value.trim();
    const imageFile = dom.imageFileInput.files[0];
    if (!caption || !imageFile) {
        alert('Please provide a caption and select an image file.');
        return;
    }
    const fileName = `${Date.now()}-${imageFile.name}`;
    try {
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        const { error: insertError } = await supabase.from('images').insert({
            caption: caption,
            image_url: urlData.publicUrl
        });
        if (insertError) throw insertError;
        closeAllModals();
        dom.addImageForm.reset();
        initializeApp();
    } catch (error) {
        console.error('Error during single image upload:', error);
        alert('Failed to upload image.');
    }
}

async function handleMultipleImageUpload(files) {
    alert(`Starting upload of ${files.length} images. This may take a moment.`);
    const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = file.name;
        const lastDotIndex = fileName.lastIndexOf('.');
        const captionText = (lastDotIndex !== -1) ? fileName.substring(0, lastDotIndex) : fileName;
        const uniqueFileName = `${Date.now()}-${fileName}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(uniqueFileName, file);
        if (uploadError) throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(uniqueFileName);
        const { error: insertError } = await supabase.from('images').insert({
            caption: captionText,
            image_url: urlData.publicUrl
        });
        if (insertError) throw new Error(`Database insert failed for ${fileName}: ${insertError.message}`);
    });
    try {
        await Promise.all(uploadPromises);
        alert('All images uploaded successfully!');
    } catch (error) {
        console.error("One or more uploads failed:", error);
        alert(`An error occurred during multi-upload. Check console for details.`);
    } finally {
        initializeApp();
    }
}

// =======================================================
// PERSON & ASSIGNMENT HANDLERS
// =======================================================
export async function handleAddPerson() {
  const name = dom.personNameInput.value.trim();
  const color = dom.personColorInput.value;
  if (!name) return;
  const { error } = await supabase.from('people').insert({ name, tag_color: color });
  if (error) {
    console.error('Error adding person:', error);
    alert('Failed to add person.');
  } else {
    dom.personNameInput.value = '';
    initializeApp();
  }
}

export async function handleDeletePerson(personId) {
    const { error } = await supabase.from('people').delete().eq('id', personId);
    if (error) {
        console.error('Error deleting person:', error);
        alert('Failed to delete person.');
    } else {
        initializeApp();
    }
}

export async function handleAssignPerson(personId) {
    if (!state.currentlyAssigningImageId) return;
    const { error } = await supabase.from('assignments').insert({
        image_id: state.currentlyAssigningImageId,
        person_id: personId
    });
    if (error) {
        console.error('Error assigning person:', error);
        if (error.code === '23505') alert('This person is already assigned to this task.');
        else alert('Failed to assign person.');
    } else {
        closeAllModals();
        initializeApp();
    }
}

export async function handleRemoveAssignment(imageId, personId) {
    const { error } = await supabase.from('assignments').delete().match({ image_id: imageId, person_id: personId });
    if (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment.');
    } else {
        initializeApp();
    }
}