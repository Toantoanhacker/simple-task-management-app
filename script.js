const db_URL = ''; 
const db_ANON_KEY = '';

const supabase = supabase.createClient(db_URL, db_ANON_KEY);

// doom
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

// ===================fetch functions====================================

// Fetch all images from the 'images' table
async function fetchImages() {
  const { data, error } = await supabase.from('images').select('*').order('created_at');
  if (error) console.error('Error fetching images:', error);
  return data;
}

// Fetch all people from the 'people' table
async function fetchPeople() {
    const { data, error } = await supabase.from('people').select('*');
    if (error) console.error('Error fetching people:', error);
    return data;
}

// Fetch all assignments (linking images and people)
async function fetchAssignments() {
    const { data, error } = await supabase.from('assignments').select('image_id, person_id');
    if (error) console.error('Error fetching assignments:', error);
    return data;
}

// ===================rendering functions====================================

// Create the HTML for the entire gallery
function renderGallery(images, people, assignments) {
  gallery.innerHTML = ''; // Clear existing gallery
  sidebar.innerHTML = '<h2>Navigation</h2><hr/>'; // Clear and reset sidebar

  if (!images || images.length === 0) {
    gallery.innerHTML = '<p>No images yet. Add one with the "+" button!</p>';
    return;
  }
    
  images.forEach(image => {
    // Create the main figure element
    const figure = document.createElement('figure');
    figure.id = image.id; // Use database ID for the element ID

    // Create the image and caption
    figure.innerHTML = `
      <img src="${image.image_url}" alt="${image.caption}">
      <figcaption>${image.caption}</figcaption>
    `;

    // Create the task management section (checkboxes)
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
    
    // Add event listeners for the checkboxes
    tasksDiv.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => handleTaskUpdate(image.id, checkbox.dataset.task, checkbox.checked));
    });

    // Create sidebar link for this image
    const sidebarLink = document.createElement('a');
    sidebarLink.href = `#${image.id}`;
    sidebarLink.textContent = image.caption;
    sidebar.appendChild(sidebarLink);
    
    gallery.appendChild(figure);
  });

  // Re-add lightbox functionality to new images
  addLightboxListeners();
}

// Render the tags for people at the top
function renderPeople(people) {
    peopleTagsContainer.innerHTML = ''; // Clear existing tags
    people.forEach(person => {
        const personTag = document.createElement('span');
        personTag.className = 'person-tag';
        personTag.textContent = person.name;
        personTag.dataset.personId = person.id;
        peopleTagsContainer.appendChild(personTag);
    });
}


// =================even handler and data operations======================================

// Handles adding a new person
async function handleAddPerson() {
  const name = personNameInput.value.trim();
  if (!name) return;

  const { data, error } = await supabase.from('people').insert({ name: name }).select();
  if (error) {
    console.error('Error adding person:', error);
    alert('Failed to add person.');
  } else {
    personNameInput.value = '';
    initializeApp(); // Refresh the whole app state
  }
}

// Handles updating a task checkbox
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

// Handles the form submission for a new image
async function handleImageUpload(event) {
    event.preventDefault();
    const caption = document.getElementById('image-caption-input').value.trim();
    const imageFile = document.getElementById('image-file-input').files[0];

    if (!caption || !imageFile) {
        alert('Please provide a caption and select an image file.');
        return;
    }

    // 1. Upload the file to Supabase Storage
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Failed to upload image.');
        return;
    }

    // 2. Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    const publicURL = urlData.publicUrl;

    // 3. Insert the new image record into the 'images' table
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
        initializeApp(); // Refresh the app to show the new image
    }
}


// =========================util==============================

// Lightbox functionality
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

// Main function to start the application
async function initializeApp() {
  const [images, people, assignments] = await Promise.all([
    fetchImages(),
    fetchPeople(),
    fetchAssignments()
  ]);
  
  renderGallery(images, people, assignments);
  renderPeople(people);
}

// ========================even listeners===============================

// Initial load
document.addEventListener('DOMContentLoaded', initializeApp);

// Listen for clicks to add a person
addPersonBtn.addEventListener('click', handleAddPerson);

// Modal listeners
addImageBtn.addEventListener('click', () => modal.style.display = 'block');
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});
addImageForm.addEventListener('submit', handleImageUpload);

// Global lightbox listeners
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
});