const navbar = document.querySelector('.navbar');
const menuBtn = document.querySelector('.menu-btn');

if (navbar && menuBtn) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });
}

const riskMapElement = document.getElementById('risk-map');

if (riskMapElement && window.L) {
  const riskMap = L.map('risk-map', {
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false,
    keyboard: false,
    dragging: false,
    tap: false,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(riskMap);

  const zones = [
    {
      name: 'Al Haouz',
      status: 'Zone touchee',
      coords: [31.1, -8.0],
      color: '#dc2626'
    },
    {
      name: 'Casablanca',
      status: 'Zone non sure',
      coords: [33.5731, -7.5898],
      color: '#d97706'
    },
    {
      name: 'Chefchaouen',
      status: 'Sous suivi',
      coords: [35.1688, -5.2636],
      color: '#1d4ed8'
    },
    {
      name: 'Marrakech',
      status: 'Zone non sure',
      coords: [31.6295, -7.9811],
      color: '#d97706'
    },
    {
      name: 'Agadir',
      status: 'Zone touchee',
      coords: [30.4278, -9.5981],
      color: '#dc2626'
    }
  ];

  async function loadMoroccoMap() {
    try {
      const metaResponse = await fetch('https://www.geoboundaries.org/api/current/gbOpen/MAR/ADM0/');
      const meta = await metaResponse.json();
      const geoResponse = await fetch(meta.simplifiedGeometryGeoJSON || meta.gjDownloadURL);
      const geojson = await geoResponse.json();

      const moroccoLayer = L.geoJSON(geojson, {
        style: {
          color: '#1d4ed8',
          weight: 2,
          fillColor: '#dbeafe',
          fillOpacity: 0.32
        }
      }).addTo(riskMap);

      riskMap.fitBounds(moroccoLayer.getBounds().pad(0.08));
      riskMap.setMaxBounds(moroccoLayer.getBounds().pad(0.2));

      zones.forEach((zone) => {
        L.circleMarker(zone.coords, {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: zone.color,
          fillOpacity: 0.95
        })
          .addTo(riskMap)
          .bindPopup(`<strong>${zone.name}</strong><br>${zone.status}`);
      });
    } catch (error) {
      riskMapElement.innerHTML = '<div class="map-error">Impossible de charger la carte du Maroc.</div>';
    }
  }

  loadMoroccoMap();
}
