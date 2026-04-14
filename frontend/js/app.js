const navbar = document.querySelector('.navbar');
const menuBtn = document.querySelector('.menu-btn');
const addDisasterLinks = document.querySelectorAll('.add-disaster-toggle');
const addDisasterSection = document.getElementById('add-disaster');

if (navbar && menuBtn) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });
}

if (addDisasterLinks.length && addDisasterSection) {
  addDisasterLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const isHidden = addDisasterSection.classList.toggle('is-hidden');

      if (!isHidden) {
        addDisasterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
