// src/components/lightbox.js

import { state, dom } from './state.js';

function updateImageTransform() {
    dom.lightboxImg.style.transform = `translate(${state.lightbox.translateX}px, ${state.lightbox.translateY}px) scale(${state.lightbox.scale})`;
}

function resetZoom() {
    state.lightbox.scale = 1;
    state.lightbox.translateX = 0;
    state.lightbox.translateY = 0;
    state.lightbox.isPanning = false;
    updateImageTransform();
}

function closeLightbox() {
  dom.lightbox.style.display = 'none';
  resetZoom();
}

function handleZoom(event) {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const oldScale = state.lightbox.scale;

    if (event.deltaY < 0) state.lightbox.scale += zoomSpeed; 
    else state.lightbox.scale -= zoomSpeed;
    
    state.lightbox.scale = Math.min(Math.max(0.5, state.lightbox.scale), 4);
    
    const rect = dom.lightboxImg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    state.lightbox.translateX = mouseX - (mouseX - state.lightbox.translateX) * (state.lightbox.scale / oldScale);
    state.lightbox.translateY = mouseY - (mouseY - state.lightbox.translateY) * (state.lightbox.scale / oldScale);

    updateImageTransform();
}

export function addLightboxListeners() {
    dom.gallery.addEventListener('click', (e) => {
        const img = e.target.closest('figure img');
        if (img) {
            dom.lightbox.style.display = 'flex';
            dom.lightboxImg.src = img.src;
        }
    });
}

export function addHighlightListeners() {
  const links = document.querySelectorAll(".sidebar a.nav-link-container");
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

export function setupLightboxListeners() {
    document.querySelector('.close-lightbox').onclick = closeLightbox;
    dom.lightbox.addEventListener('click', (e) => {
        if (e.target === dom.lightbox) closeLightbox();
    });

    dom.lightboxImg.addEventListener('wheel', handleZoom);
    dom.lightboxImg.addEventListener('mousedown', (e) => {
        e.preventDefault();
        state.lightbox.isPanning = true;
        state.lightbox.startX = e.clientX - state.lightbox.translateX;
        state.lightbox.startY = e.clientY - state.lightbox.translateY;
        dom.lightboxImg.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        state.lightbox.isPanning = false;
        dom.lightboxImg.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.lightbox.isPanning) return;
        e.preventDefault();
        state.lightbox.translateX = e.clientX - state.lightbox.startX;
        state.lightbox.translateY = e.clientY - state.lightbox.startY;
        updateImageTransform();
    });

    dom.zoomInBtn.addEventListener('click', () => {
        state.lightbox.scale = Math.min(4, state.lightbox.scale + 0.2);
        updateImageTransform();
    });

    dom.zoomOutBtn.addEventListener('click', () => {
        state.lightbox.scale = Math.max(0.5, state.lightbox.scale - 0.2);
        updateImageTransform();
    });
}