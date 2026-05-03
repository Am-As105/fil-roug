const DETAILS_API_BASE_URL = "https://savehaven.aminearar.com/api";

const detailsId = new URLSearchParams(window.location.search).get("id");
const detailsToken = localStorage.getItem("token");

function normalizeDetailsKey(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}



function getDetailsStatusVariant(status = "") {
  const key = normalizeDetailsKey(status);

  if (key === "critique" || key === "critical") return "critical";
  if (key === "encours" || key === "inprogress" || key === "progress") return "progress";
  if (key === "elevee" || key === "high") return "high";

  return "muted";
}

function setDetailsText(id, value)
 {
  const el = document.getElementById(id);
  if (el) el.innerText = value; 
}

function updateDetailsTimeline(status) {
  const key = normalizeDetailsKey(status);
  const steps = ["step-start", "step-current", "step-end"];

  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  }); 

  document.getElementById("step-start")?.classList.add("active");

  if (["encours","progress","high","critique","critical"].includes(key)) {
    document.getElementById("step-current")?.classList.add("active");
  }

  if (["termine","terminee","resolved"].includes(key)) {
    document.getElementById("step-current")?.classList.add("active");
    document.getElementById("step-end")?.classList.add("active");
  }
}

function updateDetailsProgress(status) {
  const key = normalizeDetailsKey(status);
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("progressText");

  let percent = 33;
  let label = "Signalement reçu";

  if (["encours","progress","high","critique","critical"].includes(key)) {
    percent = 66;
    label = "Incident en cours"; 
  }

  if (["termine","terminee","resolved"].includes(key)) {
    percent = 100;
    label = "Incident terminé";
  }

  if (bar) {
    const container = bar.parentElement;
    container.style.height = "10px";
    container.style.background = "#ddd";
    container.style.borderRadius = "999px";
    container.style.overflow = "hidden";

    bar.style.width = percent + "%";
    bar.style.height = "100%";
    bar.style.background = "#f22f46";
  }

  if (text) text.innerText = label;
}

function renderDetailsMap(disaster) {
  const mapEl = document.getElementById("detail-map");
  if (!mapEl || typeof L === "undefined") return;

  const lat = parseFloat(disaster.latitude);
  const lng = parseFloat(disaster.longitude);
  if (isNaN(lat) || isNaN(lng)) return;

  if (window.detailsMap) {
    window.detailsMap.remove();
  }

  window.detailsMap = L.map("detail-map").setView([lat, lng], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(window.detailsMap);

  const severity = normalizeDetailsKey(disaster.severity);

  let color = "green";
  let radius = 800;

  if (severity === "critique") {
    color = "red";
    radius = 2000;
  } else if (severity === "high") {
    color = "orange";
    radius = 1500;
  } else if (severity === "medium") {
    color = "yellow";
    radius = 1200;
  } 

  L.marker([lat, lng])
    .addTo(window.detailsMap)
    .bindPopup(`
      <strong>${disaster.title}</strong><br>
      Gravité: ${disaster.severity}<br>
      Statut: ${disaster.status}
    `)
    .openPopup();

  L.circle([lat, lng], {
    color,
    fillColor: color,
    fillOpacity: 0.3,
    radius
  }).addTo(window.detailsMap);
}

function renderDetailsDisaster(d) {
  setDetailsText("title", d.title || "Non défini");
  setDetailsText("desc", d.description || "Non précisé");
  setDetailsText("date", d.date || "-");
  setDetailsText("severity", d.severity || "-"); 
  setDetailsText("lat", d.latitude || "-");
  setDetailsText("lng", d.longitude || "-");
  setDetailsText("victims", d.victims ?? 0);
  setDetailsText("injured", d.injured ?? 0);

  const damage = Number(d.damage || 0);
  setDetailsText("damage", damage ? damage.toLocaleString() + " DH" : "Non précisé");

  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.className = "status-badge status-" + getDetailsStatusVariant(d.status);
    statusEl.innerText = d.status || "-";
  }

  updateDetailsTimeline(d.status);
  updateDetailsProgress(d.status);
  renderDetailsMap(d);
}

function showDetailsError() {
  setDetailsText("title", "Erreur de chargement");
  setDetailsText("desc", "Impossible de récupérer les données");
}

if (!detailsId) {
  showDetailsError();
} else {
  fetch(`${DETAILS_API_BASE_URL}/catastrophes/${detailsId}`, {
    headers: detailsToken ? { Authorization: `Bearer ${detailsToken}` } : {}
  })
    .then(r => r.json())
    .then(data => {
      if (!data) throw new Error();
      renderDetailsDisaster(data.data || data);
    })
    .catch(showDetailsError);
}