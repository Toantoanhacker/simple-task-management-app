import { createClient } from '@supabase/supabase-js';

//setup and init
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
const addImageModal = document.getElementById('add-image-modal'); // Corrected name
const addImageForm = document.getElementById('add-image-form');
const assignPersonModal = document.getElementById('assign-person-modal');
let currentlyAssigningImageId = null;

// Lightbox and Zoom state variables
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');

let scale = 1;
let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

//fech data from db
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

// ===================rendering functions====================================

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

    figure.innerHTML = `
      <img src="${image.image_url}" alt="${image.caption}">
      <figcaption>${image.caption}</figcaption>
    `;

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
    figure.appendChild(assignedTagsDiv);

    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    tasksDiv.innerHTML = `
      <label>
        <input type="checkbox" class="task-checkbox" data-task="frontend_done" ${image.frontend_done ? 'checked' : ''}>
        Front-end
      </label>
      <label>
        <input type="checkbox" class="task-checkbox" data-task="backend_done" ${image.backend_done ? 'checked' : ''}>
        Back-end
      </label>
    `;
    figure.appendChild(tasksDiv);
    
    const assignBtn = document.createElement('button');
    assignBtn.className = 'assign-button';
    assignBtn.textContent = '+ Assign Person';
    assignBtn.onclick = () => openAssignModal(image.id, image.caption, people);
    figure.appendChild(assignBtn);
    
    tasksDiv.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => handleTaskUpdate(image.id, checkbox.dataset.task, checkbox.checked));
    });

    assignedTagsDiv.querySelectorAll('.remove-assignment').forEach(btn => {
        btn.onclick = () => handleRemoveAssignment(image.id, btn.dataset.personId);
    });

    const sidebarLink = document.createElement('a');
    sidebarLink.href = `#${image.id}`;
    sidebarLink.textContent = image.caption;
    sidebar.appendChild(sidebarLink);
    
    gallery.appendChild(figure);
  });

  // FIX: This function call was missing. We add it back here.
  addLightboxListeners();
  
  addHighlightListeners(); //Activate the highlight feature
}

function renderPeople(people) {
    peopleTagsContainer.innerHTML = '';
    people.forEach(person => {
        const personTag = document.createElement('span');
        personTag.className = 'person-tag';
        
        personTag.innerHTML = `${person.name} <span class="delete-person" title="Delete person">&times;</span>`;
        personTag.style.backgroundColor = person.tag_color;

        personTag.querySelector('.delete-person').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete ${person.name}? This cannot be undone.`)) {
                handleDeletePerson(person.id);
            }
        };
        peopleTagsContainer.appendChild(personTag);
    });
}

// =======================even handling and data operations================================
async function handleAddPerson() {
  const name = personNameInput.value.trim();
  const color = personColorInput.value;
  if (!name) return;

  const { data, error } = await supabase.from('people').insert({ name: name, tag_color: color }).select();
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
        if (error.code === '23505') {
          alert('This person is already assigned to this task.');
        } else {
          alert('Failed to assign person.');
        }
    } else {
        closeAllModals();
        initializeApp();
    }
}
async function handleRemoveAssignment(imageId, personId) {
    const { error } = await supabase.from('assignments').delete()
        .eq('image_id', imageId)
        .eq('person_id', personId);
    if (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment.');
    } else {
        initializeApp();
    }
}
async function handleTaskUpdate(imageId, taskColumn, isChecked) {
  const { error } = await supabase
    .from('images')
    .update({ [taskColumn]: isChecked })
    .eq('id', imageId);
    
  if (error) {
    console.error('Error updating task:', error);
    alert('Could not save task status.');
  }
}
async function handleImageUpload(event) {
    event.preventDefault();
    const caption = document.getElementById('image-caption-input').value.trim();
    const imageFile = document.getElementById('image-file-input').files[0];

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
    const publicURL = urlData.publicUrl;

    const { error: insertError } = await supabase.from('images').insert({
        caption: caption,
        image_url: publicURL
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

// =====================util and init==================================
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

    if (event.deltaY < 0) { scale += zoomSpeed; } 
    else { scale -= zoomSpeed; }
    
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
// ========================event listeners===============================
document.addEventListener('DOMContentLoaded', initializeApp);

addPersonBtn.addEventListener('click', handleAddPerson);
addImageForm.addEventListener('submit', handleImageUpload);
addImageBtn.addEventListener('click', () => addImageModal.style.display = 'block');

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