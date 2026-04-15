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
const map = L.map('map').setView([31.7917, -7.0926], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

L.marker([33.5731, -7.5898]).addTo(map)
  .bindPopup("Casablanca")
  .openPopup();

const redIcon = L.icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

L.marker([31.6295, -7.9811], { icon: redIcon })
  .addTo(map)
  .bindPopup("Séisme - Al Haouz");

L.marker([33.5731, -7.5898], { icon: redIcon })
  .addTo(map)
  .bindPopup("Inondation - Casablanca");

L.marker([34.0331, -5.0003], { icon: redIcon })
  .addTo(map)
  .bindPopup("Incendie - Taza");

L.marker([35.1688, -5.2636], { icon: redIcon })
  .addTo(map)
  .bindPopup("Glissement - Chefchaouen");