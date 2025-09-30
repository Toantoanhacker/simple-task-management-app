// src/components/ui.js

// Note: We will create state.js and handlers.js in the next step.
// For now, this code is ready for them.
import { dom } from './state.js';
import * as handlers from './handlers.js';
import { addLightboxListeners, addHighlightListeners } from './lightbox.js';

/**
 * Renders the entire image gallery and sidebar based on the provided data.
 * @param {Array} images - The array of image objects to render.
 * @param {Array} people - The array of all people.
 * @param {Array} assignments - The array of all assignments.
 */
export function renderGallery(images, people, assignments) {
  dom.gallery.innerHTML = '';
  dom.sidebar.innerHTML = '<h2>Navigation</h2><hr/>';

  if (!images || images.length === 0) {
    dom.gallery.innerHTML = '<p style="color: white; font-size: 1.2em;">No images yet. Add one with the "+" button!</p>';
    return;
  }
    
  images.forEach(image => {
    const figure = document.createElement('figure');
    figure.id = image.id;

    // --- Create all elements ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-image-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.title = 'Delete Image';
    deleteBtn.onclick = () => handlers.handleDeleteImage(image.id, image.image_url);

    const img = document.createElement('img');
    img.src = image.image_url;
    img.alt = image.caption;

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = image.caption;
    figcaption.contentEditable = true;
    figcaption.addEventListener('blur', () => handlers.handleCaptionUpdate(image.id, figcaption.textContent));

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
        <span class="checkmark"></span> Front-end
      </label>
      <label class="custom-checkbox">
        <input type="checkbox" class="task-checkbox" data-task="backend_done" ${image.backend_done ? 'checked' : ''}>
        <span class="checkmark"></span> Back-end
      </label>`;

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
    notesContent.textContent = image.notes || '';
    notesContent.addEventListener('blur', () => handlers.handleNotesUpdate(image.id, notesContent.textContent));
    notesSection.appendChild(notesContent);
    notesToggleBtn.onclick = () => {
        const isHidden = notesSection.style.display === 'none' || !notesSection.style.display;
        notesSection.style.display = isHidden ? 'block' : 'none';
        if (isHidden) notesContent.focus();
    };
    
    const assignBtn = document.createElement('button');
    assignBtn.className = 'assign-button';
    assignBtn.textContent = '+ Assign Person';
    assignBtn.onclick = () => handlers.openAssignModal(image.id, image.caption, people);
    
    // --- Append all elements in order ---
    figure.appendChild(deleteBtn);
    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.appendChild(assignedTagsDiv);
    figure.appendChild(tasksDiv);
    figure.appendChild(notesToggleBtn);
    figure.appendChild(notesSection);
    figure.appendChild(assignBtn);
    
    // --- Add event listeners ---
    tasksDiv.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => handlers.handleTaskUpdate(image.id, checkbox.dataset.task, checkbox.checked));
    });
    assignedTagsDiv.querySelectorAll('.remove-assignment').forEach(btn => {
        btn.onclick = () => handlers.handleRemoveAssignment(image.id, btn.dataset.personId);
    });

    // --- Sidebar Link ---
    const sidebarLinkContainer = document.createElement('a');
    sidebarLinkContainer.href = `#${image.id}`;
    sidebarLinkContainer.className = 'nav-link-container';
    const linkText = document.createElement('span');
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
    dom.sidebar.appendChild(sidebarLinkContainer);
    
    dom.gallery.appendChild(figure);
  });

  addLightboxListeners();
  addHighlightListeners();
}

/**
 * Renders the person tags in the management panel.
 * @param {Array} people - The array of all people.
 */
export function renderPeople(people) {
    dom.peopleTagsContainer.innerHTML = '';
    people.forEach(person => {
        const personTag = document.createElement('span');
        personTag.className = 'person-tag';
        personTag.style.backgroundColor = person.tag_color;
        personTag.innerHTML = `${person.name} <span class="delete-person" title="Delete person">&times;</span>`;
        personTag.querySelector('.delete-person').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete ${person.name}? This cannot be undone.`)) {
                handlers.handleDeletePerson(person.id);
            }
        };
        dom.peopleTagsContainer.appendChild(personTag);
    });
}