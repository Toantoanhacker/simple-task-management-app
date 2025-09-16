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

// Modal Elements
const addImageBtn = document.getElementById('add-image-btn');
const modal = document.getElementById('add-image-modal');
const closeModalBtn = document.querySelector('.close-modal');
const addImageForm = document.getElementById('add-image-form');

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
    
    tasksDiv.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => handleTaskUpdate(image.id, checkbox.dataset.task, checkbox.checked));
    });

    const sidebarLink = document.createElement('a');
    sidebarLink.href = `#${image.id}`;
    sidebarLink.textContent = image.caption;
    sidebar.appendChild(sidebarLink);
    
    gallery.appendChild(figure);
  });

  addLightboxListeners();
  addHighlightListeners(); //Activate the highlight feature
}

function renderPeople(people) {
    peopleTagsContainer.innerHTML = '';
    people.forEach(person => {
        const personTag = document.createElement('span');
        personTag.className = 'person-tag';
        personTag.textContent = person.name;
        personTag.dataset.personId = person.id;
        peopleTagsContainer.appendChild(personTag);
    });
}

// =======================even handling and data operations================================

async function handleAddPerson() {
  const name = personNameInput.value.trim();
  if (!name) return;

  const { data, error } = await supabase.from('people').insert({ name: name }).select();
  if (error) {
    console.error('Error adding person:', error);
    alert('Failed to add person.');
  } else {
    personNameInput.value = '';
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
        modal.style.display = 'none';
        addImageForm.reset();
        initializeApp();
    }
}

// =====================util and init==================================

function addLightboxListeners() {
    const figures = document.querySelectorAll('.gallery figure img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    figures.forEach(img => {
      img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      });
    });
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}

// NEW: Function to add highlight listeners from the original site
function addHighlightListeners() {
  const links = document.querySelectorAll(".sidebar a");
  const figures = document.querySelectorAll(".gallery figure");

  links.forEach(link => {
    link.addEventListener("click", (event) => {
      // Prevent default jump, smooth scroll instead
      event.preventDefault();
      
      figures.forEach(fig => fig.classList.remove("highlight"));

      const targetId = link.getAttribute("href").substring(1);
      const targetFigure = document.getElementById(targetId);

      if (targetFigure) {
        // Scroll to the figure
        targetFigure.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight it
        targetFigure.classList.add("highlight");

        // Remove highlight after 3 seconds
        setTimeout(() => {
          targetFigure.classList.remove("highlight");
        }, 3000);
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

addImageBtn.addEventListener('click', () => modal.style.display = 'block');
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});
addImageForm.addEventListener('submit', handleImageUpload);

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
});