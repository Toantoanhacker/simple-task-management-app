import { createClient } from '@supabase/supabase-js';

// 1. SETUP & INITIALIZATION
const VITE_db_URL = import.meta.env.VITE_db_URL;
const VITE_db_ANON_KEY = import.meta.env.VITE_db_ANON_KEY;
const supabase = createClient(VITE_db_URL, VITE_db_ANON_KEY);

// DOM Elements
const gallery = document.getElementById('gallery');
const sidebar = document.querySelector('.sidebar');
const personNameInput = document.getElementById('person-name-input');
const addPersonBtn = document.getElementById('add-person-btn');
const peopleTagsContainer = document.getElementById('people-tags-container');
const personColorInput = document.getElementById('person-color-input');

// Modal Elements
const addImageBtn = document.getElementById('add-image-btn');
const addImageModal = document.getElementById('add-image-modal');
const addImageForm = document.getElementById('add-image-form');
const assignPersonModal = document.getElementById('assign-person-modal');
let currentlyAssigningImageId = null;

// NEW: Get direct references to the form inputs for the new feature
const imageCaptionInput = document.getElementById('image-caption-input');
const imageFileInput = document.getElementById('image-file-input');

// Lightbox and Zoom state variables
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
let scale = 1;
let isPanning = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;

// 2. DATA FETCHING FUNCTIONS
async function fetchImages() {
  const { data, error } = await supabase.from('images').select('*').order('created_at');
  if (error) console.error('Error fetching images:', error);
  return data;
}

async function fetchPeople() {
    const { data, error } = await supabase.from('people').select('*');
    if (error) console.error('Error fetching people:', error);
    return data;
}

async function fetchAssignments() {
    const { data, error } = await supabase.from('assignments').select('image_id, person_id');
    if (error) console.error('Error fetching assignments:', error);
    return data;
}
// 3. RENDERING FUNCTIONS (Building the HTML)
function renderGallery(images, people, assignments) {
  gallery.innerHTML = '';
  sidebar.innerHTML = '<h2>Navigation</h2><hr/>';

  if (!images || images.length === 0) {
    gallery.innerHTML = '<p style="color: white; font-size: 1.2em;">No images yet. Add one with the "+" button!</p>';
    return;
  }
    
  images.forEach(image => {
    const figure = document.createElement('figure');
    figure.id = image.id;

    // Create all elements before appending to avoid overwriting issues
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-image-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.title = 'Delete Image';
    deleteBtn.onclick = () => handleDeleteImage(image.id, image.image_url);

    const img = document.createElement('img');
    img.src = image.image_url;
    img.alt = image.caption;


// editable figcaption
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = image.caption;
    figcaption.contentEditable = true; // This makes the element directly editable in the browser
    figcaption.addEventListener('blur', () => handleCaptionUpdate(image.id, figcaption.textContent)); // Save on blur (when user clicks away)

    const assignedTagsDiv = document.createElement('div');
    assignedTagsDiv.className = 'assigned-tags';
    const imageAssignments = assignments.filter(a => a.image_id === image.id);
    imageAssignments.forEach(assignment => {
      const person = people.find(p => p.id === assignment.person_id);
      if (person) {
        const tag = document.createElement('span');
        tag.className = 'assigned-tag';
        tag.style.backgroundColor = person.tag_color;
        tag.innerHTML = `${person.name} <span class="remove-assignment" data-person-id="${person.id}">&times;</span>`;
        assignedTagsDiv.appendChild(tag);
      }
    });
    
    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    tasksDiv.innerHTML = `
      <label class="custom-checkbox">
        <input type="checkbox" class="task-checkbox" data-task="frontend_done" ${image.frontend_done ? 'checked' : ''}>
        <span class="checkmark"></span>
        Front-end
      </label>
      <label class="custom-checkbox">
        <input type="checkbox" class="task-checkbox" data-task="backend_done" ${image.backend_done ? 'checked' : ''}>
        <span class="checkmark"></span>
        Back-end
      </label>
    `;

        // ✨ NEW: Create the elements for the notes feature
    const notesToggleBtn = document.createElement('button');
    notesToggleBtn.className = 'notes-toggle-btn';
    notesToggleBtn.textContent = 'Show/Hide Notes';

      if (image.notes && image.notes.trim() !== '') {
        notesToggleBtn.classList.add('has-notes');
    }

    const notesSection = document.createElement('div');
    notesSection.className = 'notes-section';

    const notesContent = document.createElement('div');
    notesContent.className = 'notes-content';
    notesContent.contentEditable = true;
    notesContent.textContent = image.notes || ''; // Display existing notes or empty string
    notesContent.addEventListener('blur', () => handleNotesUpdate(image.id, notesContent.textContent)); // Save on blur
    
    notesSection.appendChild(notesContent);

    // Toggle visibility of the notes section
    notesToggleBtn.onclick = () => {
        const isHidden = notesSection.style.display === 'none' || !notesSection.style.display;
        notesSection.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            notesContent.focus(); // Auto-focus when showing
        }
    };
    
    const assignBtn = document.createElement('button');
    assignBtn.className = 'assign-button';
    assignBtn.textContent = '+ Assign Person';
    assignBtn.onclick = () => openAssignModal(image.id, image.caption, people);
    
    // Append all created elements in the correct order
    figure.appendChild(deleteBtn);
    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.appendChild(assignedTagsDiv);
    figure.appendChild(tasksDiv);
    figure.appendChild(notesToggleBtn); // Add the notes toggle button
    figure.appendChild(notesSection);   // Add the (initially hidden) notes section
    figure.appendChild(assignBtn);
    
    // Add event listeners for dynamic content
    tasksDiv.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => handleTaskUpdate(image.id, checkbox.dataset.task, checkbox.checked));
    });
    assignedTagsDiv.querySelectorAll('.remove-assignment').forEach(btn => {
        btn.onclick = () => handleRemoveAssignment(image.id, btn.dataset.personId);
    });

    // Create and append the sidebar link with status indicators
    const sidebarLinkContainer = document.createElement('a');
    sidebarLinkContainer.href = `#${image.id}`;
    sidebarLinkContainer.className = 'nav-link-container';
    
    const linkText = document.createElement('span');
    // NEW: Add a class to the link text so CSS can target it
    linkText.className = 'nav-link-text';
    linkText.textContent = image.caption;

    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.className = 'status-indicators';
    if (image.frontend_done) {
        const feIndicator = document.createElement('span');
        feIndicator.className = 'status-indicator frontend-complete';
        feIndicator.title = 'Front-end complete';
        indicatorsDiv.appendChild(feIndicator);
    }
    if (image.backend_done) {
        const beIndicator = document.createElement('span');
        beIndicator.className = 'status-indicator backend-complete';
        beIndicator.title = 'Back-end complete';
        indicatorsDiv.appendChild(beIndicator);
    }
    
    sidebarLinkContainer.appendChild(linkText);
    sidebarLinkContainer.appendChild(indicatorsDiv);
    sidebar.appendChild(sidebarLinkContainer);
    
    gallery.appendChild(figure);
  });

  addLightboxListeners();
  addHighlightListeners();
}

function renderPeople(people) {
    peopleTagsContainer.innerHTML = '';
    people.forEach(person => {
        const personTag = document.createElement('span');
        personTag.className = 'person-tag';
        personTag.style.backgroundColor = person.tag_color;
        personTag.innerHTML = `${person.name} <span class="delete-person" title="Delete person">&times;</span>`;
        personTag.querySelector('.delete-person').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete ${person.name}? This cannot be undone.`)) {
                handleDeletePerson(person.id);
            }
        };
        peopleTagsContainer.appendChild(personTag);
    });
}
// 4. DATA MANIPULATION & EVENT HANDLERS\

// NEW: Function to handle saving notes updates
async function handleNotesUpdate(imageId, newNotes) {
    const { error } = await supabase.from('images').update({ notes: newNotes.trim() }).eq('id', imageId);

    if (error) {
        console.error('Error updating notes:', error);
        alert('Failed to save notes.');
    }
}

//  NEW: Function to handle in-place caption updates
async function handleCaptionUpdate(imageId, newCaption) {
    const trimmedCaption = newCaption.trim();
    if (!trimmedCaption) {
        alert("Caption cannot be empty.");
        initializeApp(); // Reload to revert to the old caption
        return;
    }

    const { error } = await supabase.from('images').update({ caption: trimmedCaption }).eq('id', imageId);

    if (error) {
        console.error('Error updating caption:', error);
        alert('Failed to save caption.');
    } else {
        // Sync the sidebar link text without a full reload
        const sidebarLinkText = document.querySelector(`a[href="#${imageId}"] .nav-link-text`);
        if (sidebarLinkText) {
            sidebarLinkText.textContent = trimmedCaption;
        }
    }
}

//  NEW: Function dedicated to handling multi-file uploads
async function handleMultipleImageUpload(files) {
    alert(`Starting upload of ${files.length} images. This may take a moment.`);
    
    // Create an array of upload promises
    const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = file.name;
        const lastDotIndex = fileName.lastIndexOf('.');
        const captionText = (lastDotIndex !== -1) ? fileName.substring(0, lastDotIndex) : fileName;
        
        const uniqueFileName = `${Date.now()}-${fileName}`;

        // 1. Upload file
        const { error: uploadError } = await supabase.storage.from('images').upload(uniqueFileName, file);
        if (uploadError) throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);

        // 2. Get URL
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(uniqueFileName);

        // 3. Insert into database
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
        alert(`An error occurred during the multi-upload. Some files may not have been saved. Check the console for details.`);
    } finally {
        initializeApp(); // Refresh the gallery with all new images
    }
}

async function handleDeleteImage(imageId, imageUrl) {
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

async function handleAddPerson() {
  const name = personNameInput.value.trim();
  const color = personColorInput.value;
  if (!name) return;
  const { error } = await supabase.from('people').insert({ name, tag_color: color });
  if (error) {
    console.error('Error adding person:', error);
    alert('Failed to add person.');
  } else {
    personNameInput.value = '';
    initializeApp();
  }
}

async function handleDeletePerson(personId) {
    const { error } = await supabase.from('people').delete().eq('id', personId);
    if (error) {
        console.error('Error deleting person:', error);
        alert('Failed to delete person.');
    } else {
        initializeApp();
    }
}

async function handleAssignPerson(personId) {
    if (!currentlyAssigningImageId) return;
    const { error } = await supabase.from('assignments').insert({
        image_id: currentlyAssigningImageId,
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

async function handleRemoveAssignment(imageId, personId) {
    const { error } = await supabase.from('assignments').delete().match({ image_id: imageId, person_id: personId });
    if (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment.');
    } else {
        initializeApp();
    }
}

async function handleTaskUpdate(imageId, taskColumn, isChecked) {
  const { error } = await supabase.from('images').update({ [taskColumn]: isChecked }).eq('id', imageId);
  if (error) {
    console.error('Error updating task:', error);
    alert('Could not save task status.');
  } else {
    initializeApp(); // Refresh UI to show sidebar changes instantly
  }
}

async function handleImageUpload(event) {
    event.preventDefault();
    const caption = imageCaptionInput.value.trim();
    const imageFile = imageFileInput.files[0];
    
    // This function now exclusively handles the SINGLE file upload case
    if (!caption || !imageFile) {
        alert('Please provide a caption and select an image file.');
        return;
    }
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);
    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Failed to upload image.');
        return;
    }
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    const { error: insertError } = await supabase.from('images').insert({
        caption: caption,
        image_url: urlData.publicUrl
    });
    if (insertError) {
        console.error('Error saving image data:', insertError);
        alert('Failed to save image details.');
    } else {
        closeAllModals();
        addImageForm.reset();
        initializeApp();
    }
}

// 5. UTILITY & UI FUNCTIONS
function openAssignModal(imageId, caption, people) {
    currentlyAssigningImageId = imageId;
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
    assignPersonModal.style.display = 'block';
}

function closeAllModals() {
    addImageModal.style.display = 'none';
    assignPersonModal.style.display = 'none';
}

function addLightboxListeners() {
    gallery.addEventListener('click', (e) => {
        const img = e.target.closest('figure img');
        if (img) {
            lightbox.style.display = 'flex';
            lightboxImg.src = img.src;
        }
    });
}

function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    isPanning = false;
    updateImageTransform();
}

function updateImageTransform() {
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function closeLightbox() {
  lightbox.style.display = 'none';
  resetZoom();
}

function handleZoom(event) {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const oldScale = scale;
    if (event.deltaY < 0) scale += zoomSpeed; 
    else scale -= zoomSpeed;
    scale = Math.min(Math.max(0.5, scale), 4);
    const rect = lightboxImg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    translateX = mouseX - (mouseX - translateX) * (scale / oldScale);
    translateY = mouseY - (mouseY - translateY) * (scale / oldScale);
    updateImageTransform();
}

function addHighlightListeners() {
  const links = document.querySelectorAll(".sidebar a");
  links.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelectorAll(".gallery figure").forEach(fig => fig.classList.remove("highlight"));
      const targetId = link.getAttribute("href").substring(1);
      const targetFigure = document.getElementById(targetId);
      if (targetFigure) {
        targetFigure.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetFigure.classList.add("highlight");
        setTimeout(() => targetFigure.classList.remove("highlight"), 3000);
      }
    });
  });
}

async function initializeApp() {
  const [images, people, assignments] = await Promise.all([
    fetchImages(),
    fetchPeople(),
    fetchAssignments()
  ]);
  renderGallery(images, people, assignments);
  renderPeople(people);
}

// 6. GLOBAL EVENT LISTENERS
document.addEventListener('DOMContentLoaded', initializeApp);

addPersonBtn.addEventListener('click', handleAddPerson);
addImageForm.addEventListener('submit', handleImageUpload);
addImageBtn.addEventListener('click', () => addImageModal.style.display = 'block');

// MODIFIED: The file input listener now handles both single and multiple files
imageFileInput.addEventListener('change', () => {
    const files = imageFileInput.files;

    if (files.length === 1) {
        // SINGLE FILE: Show modal and pre-fill caption
        const file = files[0];
        const fileName = file.name;
        const lastDotIndex = fileName.lastIndexOf('.');
        const captionText = (lastDotIndex !== -1) ? fileName.substring(0, lastDotIndex) : fileName;
        imageCaptionInput.value = captionText;
        addImageModal.style.display = 'block'; // Show the modal for editing
    } else if (files.length > 1) {
        // MULTIPLE FILES: Skip modal and upload immediately
        handleMultipleImageUpload(files);
        addImageForm.reset(); // Clear the file input
    }
});


// Modal closing listeners
document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = closeAllModals);
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeAllModals();
});

// Lightbox specific listeners
document.querySelector('.close-lightbox').onclick = closeLightbox;
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Zoom and Pan event listeners
lightboxImg.addEventListener('wheel', handleZoom);
lightboxImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    lightboxImg.style.cursor = 'grabbing';
});
window.addEventListener('mouseup', () => {
    isPanning = false;
    lightboxImg.style.cursor = 'grab';
});
window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateImageTransform();
});
zoomInBtn.addEventListener('click', () => {
    scale = Math.min(4, scale + 0.2);
    updateImageTransform();
});
zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.5, scale - 0.2);
    updateImageTransform();
});