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

    function closeLightbox() {
      lightbox.style.display = 'none';
    }

    // Close when clicking outside the image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });


    //even listener for highlighting image elements when clicking to the nav menu
    
      document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".sidebar a");
    const figures = document.querySelectorAll(".gallery figure");

    links.forEach(link => {
      link.addEventListener("click", (e) => {
        // Remove highlight from all figures
        figures.forEach(fig => fig.classList.remove("highlight"));

        // Find target ID
        const targetId = link.getAttribute("href").substring(1);
        const targetFigure = document.getElementById(targetId);

        if (targetFigure) {
          // Highlight it
          targetFigure.classList.add("highlight");

          // Optional: auto-remove highlight after 3 seconds
          setTimeout(() => {
            targetFigure.classList.remove("highlight");
          }, 3000);
        }
      });
    });
  });