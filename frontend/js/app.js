const API_BASE_URL = "https://savehaven.aminearar.com/api";
const token = localStorage.getItem("token") || "";
const role = localStorage.getItem("role") || "";
const isLoggedIn = Boolean(token);
const isAdmin = isLoggedIn && role === "admin";
const navbar = document.querySelector(".navbar");
const menuBtn = document.querySelector(".menu-btn");
const addBtn = document.querySelector(".add-disaster-toggle");
const addSection = document.getElementById("add-disaster");
const cardsContainer = document.getElementById("cards-container");
const searchInput = document.querySelector(".search");
const filterSelect = document.querySelector(".filter");
const recordsCount = document.getElementById("recordsCount");
const recordsEmpty = document.getElementById("recordsEmpty");
const totalCount = document.getElementById("totalCount");
const criticalCount = document.getElementById("criticalCount");
const progressCount = document.getElementById("progressCount");
const disasterForm = document.getElementById("disasterForm");
const formMessage = document.getElementById("msg");
const citySelect = document.getElementById("citySelect");
const typeSelect = document.getElementById("typeSelect");
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const mapElement = document.getElementById("map");
let markersLayer = null;  


function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function cleanText(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}




async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erreur");
  return data; 
} 

function updateStats(total, critical, progress) {
  if (totalCount) totalCount.innerText = total;
  if (criticalCount) criticalCount.innerText = critical;
  if (progressCount) progressCount.innerText = progress;
  if (recordsCount) recordsCount.innerText = `${total} entrée${total === 1 ? "" : "s"}`;
} 
function toggleEmpty(show, text = "") {
  if (!recordsEmpty) return;
  recordsEmpty.innerText = show ? text : "";
  recordsEmpty.classList.toggle("hidden", !show);
}

function setMessage(element, text, color) {
  if (!element) return;
  element.innerText = text;
  element.style.color = color;
}

function openAddForm() {
  if (!addSection) return;
  addSection.classList.remove("is-hidden");
  addSection.scrollIntoView({ behavior: "smooth", block: "start" });
  const field = addSection.querySelector("input, select, textarea, button");
  if (field && typeof field.focus === "function") field.focus({ preventScroll: true });
}



if (!isLoggedIn) {
  document.querySelectorAll(".nav-primary, #logoutBtn").forEach(el => {
    el.style.display = "none";
  });
}  

if (!isAdmin)
{
  if (addBtn) addBtn.style.display = "none";
  if (addSection) addSection.style.display = "none";
} 

if (addBtn && addSection) {
  addBtn.addEventListener("click", e => {
    e.preventDefault();
    openAddForm();
  });
}

if (addSection && isAdmin && window.location.hash === "#add-disaster") {
  requestAnimationFrame(openAddForm);
}

//card info
function renderCard(disaster) {
  const title = escapeHtml(disaster.title || "Signalement");
  const description = escapeHtml(disaster.description || "Zone non précisée");
  const date = escapeHtml(disaster.date || "Date inconnue");
  const severity = escapeHtml(disaster.severity || "Non précisée");
  const statusText = escapeHtml(disaster.status || "Inconnu");
  const statusClass = getStatusClass(disaster.status);
const imageUrl = escapeHtml(disaster.image_url || "/wp2381593-natural-disasters-wallpapers.jpg");  return `<article class="card" data-status="${statusClass}"><div class="card-image"><img src="${imageUrl}" alt="${title}"></div><div class="card-content"><div class="card-head"><span class="badge ${statusClass}">${statusText}</span><span class="card-date">${date}</span></div><p class="card-label">Zone signalée</p><h3>${title}</h3><p class="card-summary">${description}</p><div class="card-meta"><div class="card-meta-item"><span>Sévérité</span><strong>${severity}</strong></div><div class="card-meta-item"><span>Date</span><strong>${date}</strong></div></div><div class="card-actions"><a href="details.html?id=${disaster.id}" class="btn-details">Voir les détails</a>${isAdmin ? `<a href="edit.html?id=${disaster.id}" class="btn-edit">Modifier</a>` : ""}${isAdmin ? `<button class="btn-delete" onclick="deleteDisaster(${disaster.id})" type="button">Supprimer</button>` : ""}</div></div></article>`;
} 


function renderMarkers(list)
 {
  if (!markersLayer) 
    return;

  markersLayer.clearLayers();
  list.forEach(disaster => {
    const lat = parseFloat(disaster.latitude);
    const lng = parseFloat(disaster.longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      L.marker([lat, lng]).addTo(markersLayer).bindPopup(`<b>${escapeHtml(disaster.title || "")}</b><br>${escapeHtml(disaster.description || "")}`);
    } 
  });
} 



function applyFilters() {
  const cards = document.querySelectorAll(".card");

  const query = searchInput.value.toLowerCase();
  const selected = filterSelect.value;

  let found = false;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const status = card.dataset.status;

    if (
      (text.includes(query) || query === "") &&
      (selected === "all" || status === selected)
    ) {
      card.style.display = "block";
      found = true;
    } else {
      card.style.display = "none";
    }
  });

  if (!found) {
    recordsEmpty.innerText = "not found ";
  } else {
    recordsEmpty.innerText = "";
  }
}




function renderDisasters(list) {
  if (!cardsContainer) return;

  if (!list || list.length === 0) {
    cardsContainer.innerHTML = "No disasters found";
    updateStats(0, 0, 0);
    renderMarkers([]);
    return;
  }

  let critical = 0;
  let progress = 0;

  list.forEach(d => 
  {
    const status = getStatusClass(d.status);
    if (status === "critical") critical++;
    if (status === "progress") progress++;
  }); 

cardsContainer.innerHTML = list.slice().reverse().map(renderCard).join("");
  updateStats(list.length, critical, progress);

  renderMarkers(list);
  applyFilters();
}



async function loadDisasters() {
  if (!cardsContainer) return;
  try {
    const data = await requestJson(`${API_BASE_URL}/catastrophes`, isLoggedIn ? { headers: { Authorization: `Bearer ${token}` } } : {});
    const list = Array.isArray(data) ? data : data.data || [];

renderDisasters(list);

if (list.length > 0) {
  const last = list[list.length - 1];
  renderLiveAlert(last);
}

  } catch (error) {
    console.error(error);
    cardsContainer.innerHTML = "";
    updateStats(0, 0, 0);
    toggleEmpty(true, "Erreur de chargement des signalements.");
  }
}
if (searchInput && cardsContainer) searchInput.addEventListener("input", applyFilters);
if (filterSelect && cardsContainer) filterSelect.addEventListener("change", applyFilters);


if (disasterForm) 
  {
  disasterForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    setMessage(formMessage, "Envoi...", "blue");
    try {
      const response = await fetch(`${API_BASE_URL}/catastrophes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: this.title.value,
          description: this.description.value,
           latitude: parseFloat(this.latitude.value),
          longitude: parseFloat(this.longitude.value),
          date: this.date.value,
          severity: this.severity.value,
          status: this.status.value,
          type_id: this.type_id.value,
          victims: parseInt(this.victims.value) || 0,
        injured: parseInt(this.injured.value) || 0,
        damage: parseFloat(this.damage.value) || 0,
        })
      });
     const data = await response.json().catch(() => ({}));

if (!response.ok)
  
  {
 
  
}
      setMessage(formMessage, "Catastrophe ajoutée avec succès", "green");
      this.reset();
      setTimeout(() => location.reload(), 800);
    } catch (error) {
      setMessage(formMessage, "Erreur lors de l'ajout", "red");
    }
  });
}


function deleteDisaster(id) {
  fetch(`${API_BASE_URL}/catastrophes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      if (!res.ok) throw new Error();
      location.reload();
    })
    .catch(() => alert("Erreur suppression"));
}
window.deleteDisaster = deleteDisaster;


async function loadCities() {
  if (!citySelect) return;
  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: "Morocco" }) });
    const data = await response.json();
    const cities = data.data || [];
    citySelect.innerHTML = cities.length ? cities.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join("") : "<option value=\"\">Aucune ville</option>";
  } catch (error) {
    citySelect.innerHTML = "<option value=\"\">Erreur de chargement</option>";
  }
}

async function loadTypes()
 {
  if (!typeSelect) return;
  try {
    const data = await requestJson(`${API_BASE_URL}/types`);
    const types = Array.isArray(data) ? data : data.data || [];
    typeSelect.innerHTML = types.length ? types.map(type => `<option value="${type.id}">${escapeHtml(type.name)}</option>`).join("") : "<option value=\"\">Aucun type</option>";
  } catch (error) {
    typeSelect.innerHTML = "<option value=\"\">Erreur de chargement</option>";
  }
}

function getStatusClass(status = "") {
  const value = cleanText(status);
  if (value.includes("crit")) return "critical";
  if (value.includes("en cours") || value.includes("progress")) return "progress";
  if (value.includes("elevee") || value.includes("high")) return "high";
  return "neutral";
}



if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault(); 
    try { 
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: this.nom.value,
          email: this.email.value,
          telephone: this.telephone.value,
          adress: this.adress.value,
          password: this.password.value
        }) 
      });  
      if (!response.ok) throw new Error();
      setMessage(registerMessage, "Compte créé avec succès", "green");
      registerForm.reset();
      setTimeout(() => { window.location.href = "login.html"; }, 1000);
    } catch (error) {
      setMessage(registerMessage, "Erreur inscription", "red");
    }
  });
}


if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email.value,
          password: this.password.value
        })
      });
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error();
      localStorage.setItem("token", data.token);
      if (data.role) localStorage.setItem("role", data.role);
      setMessage(loginMessage, "Connexion réussie", "green");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
    } catch (error) {
      setMessage(loginMessage, "Email ou mot de passe incorrect", "red");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });
}


if (mapElement && typeof L !== "undefined") {
  const map = L.map("map").setView([31.7917, -7.0926], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  markersLayer = L.layerGroup().addTo(map);
} 

loadCities(); 
loadTypes();
loadDisasters();

document.addEventListener("DOMContentLoaded", function () {

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

if (!menuBtn || !nav) return;

  menuBtn.addEventListener("click", function () {
    nav.classList.toggle("is-open");

    const spans = menuBtn.querySelectorAll("span");

    if (nav.classList.contains("is-open")) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(7px, -8px)";
    } else {
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }
  });

}); 


const liveList = document.getElementById("liveList");

function renderLiveAlert(disaster) {
  if (!liveList || !disaster) return;

  const title = disaster.title || "Alert";
  const time = disaster.date || "";

  liveList.innerHTML = `
    <div class="live-item">
      <span class="dot"></span>
      <p>${title} - ${time}</p>
    </div>
  `;
}