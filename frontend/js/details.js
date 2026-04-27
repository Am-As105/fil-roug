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

function setDetailsText(elementId, value) {
  const element = document.getElementById(elementId);

  if (element) {
    element.innerText = value;
  }
}

function updateDetailsTimeline(status) {
  const key = normalizeDetailsKey(status);
  const startStep = document.getElementById("step-start");
  const currentStep = document.getElementById("step-current");
  const endStep = document.getElementById("step-end");

  [startStep, currentStep, endStep].forEach(el => el && el.classList.remove("active"));

  if (startStep) startStep.classList.add("active");

  if (currentStep && [
    "encours",
    "inprogress",
    "progress",
    "elevee",
    "high",
    "critique",
    "critical"
  ].includes(key)) {
    currentStep.classList.add("active");
  }

  if (endStep && ["termine", "terminee", "resolved", "completed"].includes(key)) {
    if (currentStep) currentStep.classList.add("active");
    endStep.classList.add("active");
  }
}

function updateDetailsProgress(status) {
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const key = normalizeDetailsKey(status);

  let percent = 33;
  let label = "Signalement recu";

  if (["encours", "inprogress", "progress", "elevee", "high", "critique", "critical"].includes(key)) {
    percent = 66;
    label = "Incident en cours";
  }

  if (["termine", "terminee", "resolved", "completed"].includes(key)) {
    percent = 100;
    label = "Incident termine";
  }

  if (progressBar) {
    const container = progressBar.parentElement;

    if (container) {
      container.style.height = "10px";
      container.style.background = "#d1d6e6";
      container.style.borderRadius = "999px";
      container.style.overflow = "hidden";
      container.style.marginBottom = "16px";
    }

    progressBar.style.display = "block";
    progressBar.style.height = "100%";
    progressBar.style.width = `${percent}%`;
    progressBar.style.background = "#f22f46";
  }

  if (progressText) {
    progressText.innerText = label;
  }
}

function renderDetailsMap(disaster) {
  const mapContainer = document.getElementById("detail-map");

  if (!mapContainer || typeof L === "undefined") {
    return;
  }

  const lat = parseFloat(disaster.latitude);
  const lng = parseFloat(disaster.longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return;
  }

  const map = L.map("detail-map").setView([lat, lng], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(disaster.title || "")
    .openPopup();

  let radius = 500;
  const severityKey = normalizeDetailsKey(disaster.severity);

  if (severityKey === "high" || severityKey === "critique") radius = 2000;
  else if (severityKey === "medium" || severityKey === "elevee") radius = 1200;
  else if (severityKey === "low" || severityKey === "moyenne") radius = 800;

  L.circle([lat, lng], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.3,
    radius
  }).addTo(map);
}

function renderDetailsDisaster(disaster) {
  setDetailsText("title", disaster.title || "");
  setDetailsText("desc", disaster.description || "");
  setDetailsText("date", disaster.date || "");
  setDetailsText("severity", disaster.severity || "");
  setDetailsText("lat", disaster.latitude ?? "");
  setDetailsText("lng", disaster.longitude ?? "");
  setDetailsText("victims", disaster.victims ?? 0);
  setDetailsText("injured", disaster.injured ?? 0);
  setDetailsText("damage", `${Number(disaster.damage ?? 0).toLocaleString()} DH`);

  const statusEl = document.getElementById("status");

  if (statusEl) {
    statusEl.className = `status-badge status-${getDetailsStatusVariant(disaster.status)}`;
    statusEl.innerText = disaster.status || "";
  }

  updateDetailsTimeline(disaster.status);
  updateDetailsProgress(disaster.status);
  renderDetailsMap(disaster);
}

function showDetailsError() {
  setDetailsText("title", "Erreur chargement");
  setDetailsText("progressText", "");
}

if (!detailsId) {
  showDetailsError();
} else {
  const headers = detailsToken ? { Authorization: `Bearer ${detailsToken}` } : {};

  fetch(`${DETAILS_API_BASE_URL}/catastrophes/${detailsId}`, { headers })
    .then(async response => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Error loading catastrophe");
      }

      return data;
    })
    .then(renderDetailsDisaster)
    .catch(() => {
      showDetailsError();
    });
}
