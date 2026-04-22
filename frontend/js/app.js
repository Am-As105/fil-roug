const API_BASE_URL = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role") || "";
const isAdmin = role === "admin";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeKey(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getStatusVariant(status = "") {
  const key = normalizeKey(status);

  if (key === "critique" || key === "critical") {
    return "critical";
  }

  if (key === "encours" || key === "inprogress" || key === "progress") {
    return "progress";
  }

  if (key === "elevee" || key === "high") {
    return "high";
  }

  return "neutral";
}

function setMessage(element, text = "", type = "") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("success", "error");

  if (type) {
    element.classList.add(type);
  }
}

function setFormBusy(form, isBusy) {
  if (!form) {
    return;
  }

  form.classList.toggle("loading", isBusy);

  const submitButton = form.querySelector(".form-submit");
  if (submitButton) {
    submitButton.disabled = isBusy;
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Une erreur est survenue.");
  }

  return payload;
}

const navbar = document.querySelector(".navbar");
const menuBtn = document.querySelector(".menu-btn");

if (navbar && menuBtn) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

const addDisasterLinks = document.querySelectorAll(".add-disaster-toggle");
const addDisasterSection = document.getElementById("add-disaster");

if (!token) {
  document.querySelectorAll(".nav-primary, #logoutBtn").forEach((element) => {
    element.style.display = "none";
  });
}

if (addDisasterSection) {
  if (!token) {
    addDisasterSection.classList.add("is-hidden");
  } else if (window.location.hash === "#add-disaster") {
    addDisasterSection.classList.remove("is-hidden");

    window.setTimeout(() => {
      addDisasterSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }
}

if (addDisasterLinks.length && addDisasterSection) {
  addDisasterLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      addDisasterSection.classList.toggle("is-hidden");
    });
  });
}

const dashboardMap = document.getElementById("map");
const cardsContainer = document.getElementById("cards-container");

if (dashboardMap && cardsContainer && typeof L !== "undefined") {
  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: true,
  }).setView([31.7917, -7.0926], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const redIcon = L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  L.marker([33.5731, -7.5898], { icon: redIcon }).addTo(map).bindPopup("Casablanca");
}

const registerForm = document.getElementById("registerForm");
const registerMessage = document.querySelector("#registerForm .message");

if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    setFormBusy(registerForm, true);
    setMessage(registerMessage, "");

    try {
      const data = await requestJson(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: this.nom.value,
          email: this.email.value,
          telephone: this.telephone.value,
          adress: this.adress.value,
          password: this.password.value,
        }),
      });

      setMessage(registerMessage, data.message || "Compte créé avec succès. Redirection...", "success");
      registerForm.reset();

      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      setMessage(registerMessage, error.message, "error");
    } finally {
      setFormBusy(registerForm, false);
    }
  });
}

const loginForm = document.getElementById("loginForm");
const loginMessage = document.querySelector("#loginForm .message");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    setFormBusy(loginForm, true);
    setMessage(loginMessage, "");

    try {
      const data = await requestJson(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email.value,
          password: this.password.value,
        }),
      });

      if (!data.token) {
        throw new Error("Réponse de connexion invalide.");
      }

      localStorage.setItem("token", data.token);

      if (Object.prototype.hasOwnProperty.call(data, "role")) {
        if (data.role) {
          localStorage.setItem("role", data.role);
        } else {
          localStorage.removeItem("role");
        }
      }

      window.location.href = "index.html";
    } catch (error) {
      setMessage(loginMessage, error.message, "error");
    } finally {
      setFormBusy(loginForm, false);
    }
  });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });
}

const disasterForm = document.getElementById("disasterForm");
const disasterMessage = document.getElementById("msg");

if (disasterForm) {
  disasterForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    setFormBusy(disasterForm, true);
    setMessage(disasterMessage, "");

    try {
      const headers = { "Content-Type": "application/json" };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const data = await requestJson(`${API_BASE_URL}/catastrophes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: this.title.value,
          description: this.description.value,
          latitude: this.latitude.value,
          longitude: this.longitude.value,
          date: this.date.value,
          severity: this.severity.value,
          status: this.status.value,
          type_id: this.type_id.value,
        }),
      });

      setMessage(disasterMessage, data.message || "Signalement ajouté avec succès.", "success");
      disasterForm.reset();

      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (error) {
      setMessage(disasterMessage, error.message, "error");
    } finally {
      setFormBusy(disasterForm, false);
    }
  });
}

if (cardsContainer) {
  const options = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  requestJson(`${API_BASE_URL}/catastrophes`, options)
    .then((data) => {
      const disasters = Array.isArray(data) ? data : data.data || [];

      if (!disasters.length) {
        cardsContainer.innerHTML = `
          <p class="empty-state">Aucun signalement pour le moment.</p>
        `;
        return;
      }

      cardsContainer.innerHTML = disasters
        .map((disaster) => {
          const statusVariant = getStatusVariant(disaster.status);

          return `
            <article class="card">
              <div class="card-header">
                <div>
                  <p class="card-eyebrow">Signalement #${escapeHtml(disaster.id)}</p>
                  <h3>${escapeHtml(disaster.title || "Sans titre")}</h3>
                </div>

                <span class="badge badge--${statusVariant}">
                  ${escapeHtml(disaster.status || "Inconnu")}
                </span>
              </div>

              <div class="card-body">
                <p><strong>Zone:</strong> ${escapeHtml(disaster.description || "-")}</p>
                <p><strong>Date:</strong> ${escapeHtml(disaster.date || "-")}</p>
                ${
                  disaster.severity
                    ? `<p><strong>Niveau:</strong> ${escapeHtml(disaster.severity)}</p>`
                    : ""
                }
              </div>

              <div class="card-footer">
                <a href="details.html?id=${encodeURIComponent(disaster.id)}" class="btn btn-view">Details</a>

                ${
                  isAdmin
                    ? `
                      <button class="btn edit" type="button" onclick='editDisaster(${JSON.stringify(disaster.id)})'>Edit</button>
                      <button class="btn delete" type="button" onclick='deleteDisaster(${JSON.stringify(disaster.id)})'>Delete</button>
                    `
                    : ""
                }
              </div>
            </article>
          `;
        })
        .join("");
    })
    .catch((error) => {
      cardsContainer.innerHTML = `
        <p class="empty-state error">${escapeHtml(error.message || "Impossible de charger les signalements.")}</p>
      `;
    });
}

const citySelect = document.getElementById("citySelect");

if (citySelect) {
  const fallbackCities = [
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Fes",
    "Tangier",
    "Agadir",
    "Oujda",
    "Meknes",
  ];

  const populateCities = (cities) => {
    citySelect.innerHTML = "<option value=''>Choisir une ville</option>";

    cities.forEach((city) => {
      citySelect.innerHTML += `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`;
    });
  };

  fetch("https://countriesnow.space/api/v0.1/countries/cities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: "Morocco",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const cities = Array.isArray(data?.data) && data.data.length ? data.data : fallbackCities;
      populateCities(cities);
    })
    .catch(() => {
      populateCities(fallbackCities);
    });
}

// CRUD helpers used by the card buttons.
function deleteDisaster(id) {
  if (!window.confirm("Supprimer ce signalement ?")) {
    return;
  }

  requestJson(`${API_BASE_URL}/catastrophes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || token || ""}`,
    },
  })
    .then(() => window.location.reload())
    .catch((error) => {
      window.alert(error.message || "Impossible de supprimer le signalement.");
    });
}

function editDisaster(id) {
  window.location.href = `edit.html?id=${encodeURIComponent(id)}`;
}
