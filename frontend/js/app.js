const API_BASE_URL = "http://127.0.0.1:8000/api";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role") || "";
const isAdmin = role === "admin";

const addBtn = document.querySelector(".add-disaster-toggle");
const form = document.getElementById("add-disaster");

if (!isAdmin) {
  if (addBtn) addBtn.style.display = "none";
  if (form) form.style.display = "none";
}
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

  if (key === "critique" || key === "critical") return "critical";
  if (key === "encours" || key === "inprogress") return "progress";
  if (key === "elevee" || key === "high") return "high";

  return "neutral";
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Erreur");
  }

  return data;
}

const navbar = document.querySelector(".navbar");
const menuBtn = document.querySelector(".menu-btn");

if (navbar && menuBtn) {
  menuBtn.addEventListener("click", () => {
    navbar.classList.toggle("is-open");
  });
}

const addDisasterLinks = document.querySelectorAll(".add-disaster-toggle");
const addDisasterSection = document.getElementById("add-disaster");

if (!token) {
  document.querySelectorAll(".nav-primary, #logoutBtn").forEach(el => {
    el.style.display = "none";
  });
}

if (addDisasterLinks.length && addDisasterSection) {
  addDisasterLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      addDisasterSection.classList.toggle("is-hidden");
    });
  }); 
}













const cardsContainer = document.getElementById("cards-container");

if (cardsContainer) {
  const options = token
    ? { headers: { Authorization: "Bearer " + token } }
    : {};

  requestJson(API_BASE_URL +  "/catastrophes", options)
    .then(data => {

      const list = Array.isArray(data) ? data : data.data || [];

      let total = 0;
      let critical = 0;
      let progress = 0;

      cardsContainer.innerHTML = "";

      list.forEach(d => {

        total++;

        const statusKey = normalizeKey(d.status);

        if (statusKey === "critique") critical++;
        if (statusKey === "encours" || statusKey === "progress") progress++;

        const status = getStatusVariant(d.status);
        cardsContainer.innerHTML += `
  <div class="card">
    <div class="card-image">
      <img src="${d.image_url || 'assets/placeholder.jpg'}" alt="${escapeHtml(d.title)}">
    </div>
    <div class="card-content">
      <span class="badge ${status}">${escapeHtml(d.status)}</span>
      <h3>${escapeHtml(d.title)}</h3>
      <p>${escapeHtml(d.description)}</p>
      <p><strong>Date:</strong> ${escapeHtml(d.date)}</p>
      
      <div class="card-actions">
        <a href="details.html?id=${d.id}" class="btn-details">View Details →</a>
        ${isAdmin ? `<button class="btn-delete" onclick="deleteDisaster(${d.id})">Delete</button>` : ""}
        ${isAdmin ? `<a href="edit.html?id=${d.id}" class="btn-edit">Edit</a>` : ""}
      </div>
    </div>
  </div>
`;
      });

      const totalEl = document.getElementById("totalCount");
      const criticalEl = document.getElementById("criticalCount");
      const progressEl = document.getElementById("progressCount");

      if (totalEl) totalEl.innerText = total;
      if (criticalEl) criticalEl.innerText = critical;
      if (progressEl) progressEl.innerText = progress;

    })
    .catch(err => {
      console.log(err);
      cardsContainer.innerHTML = "Erreur chargement";
    });
}









const disasterForm = document.getElementById("disasterForm");

if (disasterForm) {
  disasterForm.addEventListener("submit", function(e) {
    e.preventDefault();

    fetch(API_BASE_URL + "/catastrophes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        title: this.title.value,
        description: this.description.value,
        latitude: this.latitude.value,
        longitude: this.longitude.value,
        date: this.date.value,
        severity: this.severity.value,
        status: this.status.value,
        type_id: this.type_id.value
      })
    })
    .then(res => res.json())
    .then(() => location.reload())
    .catch(() => alert("Erreur"));
  });
}

// function deleteDisaster(id) {
//   fetch(API_BASE_URL + "/catastrophes/" + id, {
//     method: "DELETE",
//     headers: {
//       Authorization: "Bearer " + token
//     }
//   })
//   .then(() => location.reload())
//   .catch(() => alert("Error"));
// }




// const citySelect = document.getElementById("citySelect");

// if (citySelect) {
//   fetch("https://countriesnow.space/api/v0.1/countries/cities", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       country: "Morocco"
//     })
//   })
//   .then(res => res.json())
//   .then(data => {

//     console.log(data);

//     citySelect.innerHTML = "";

//     if (data.data) {
//       data.data.forEach(city => {
//         citySelect.innerHTML += `<option value="${city}">${city}</option>`;
//       });
//     }

//   })
//   .catch(err => {
//     console.log(err);
//     citySelect.innerHTML = "<option>Error</option>";
//   });
// }


// const searchInput = document.querySelector(".search");

// if (searchInput && cardsContainer) {
//   searchInput.addEventListener("input", function () {

//     const value = this.value.toLowerCase();

//     const cards = document.querySelectorAll(".card");

//     cards.forEach(card => {
//       const text = card.innerText.toLowerCase();

//       card.style.display = text.includes(value) ? "block" : "none";
//     });

//   });
// }




// const filter = document.querySelector(".filter");

// if (filter && cardsContainer) {
//   filter.addEventListener("change", function () {

//     const value = this.value.toLowerCase();

//     const cards = document.querySelectorAll(".card");

//     cards.forEach(card => {
//       const text = card.innerText.toLowerCase();

//       if (value === "toutes") {
//         card.style.display = "block";
//       } else {
//         card.style.display = text.includes(value) ? "block" : "none";
//       }
//     });

//   });
// }



// const registerForm = document.getElementById("registerForm");
// const registerMessage = document.getElementById("message");

// if (registerForm) {
//   registerForm.addEventListener("submit", function (e) {
//     e.preventDefault();

//     fetch(API_BASE_URL + "/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name: this.nom.value,
//         email: this.email.value,
//         telephone: this.telephone.value,
//         adress: this.adress.value,
//         password: this.password.value
//       })
//     })
//     .then(res => res.json())
//     .then(data => {
//       registerMessage.innerText = "Compte créé avec succès";
//       registerMessage.style.color = "green";
//       registerForm.reset();
//       setTimeout(() => {
//         window.location.href = "login.html";
//       }, 1000);
//     })
//     .catch(() => {
//       registerMessage.innerText = "Erreur inscription";
//       registerMessage.style.color = "red";
//     });
//   });
// }

// const loginForm = document.getElementById("loginForm");
// const loginMessage = document.getElementById("loginMessage");

// if (loginForm) {
//   loginForm.addEventListener("submit", function (e) {
//     e.preventDefault();

//     fetch(API_BASE_URL + "/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         email: this.email.value,
//         password: this.password.value
//       })
//     })
//     .then(res => res.json())
//     .then(data => {

//       if (!data.token) {
//         throw new Error("Login failed");
//       }

//       localStorage.setItem("token", data.token);

//       if (data.role) {
//         localStorage.setItem("role", data.role);
//       }

//       loginMessage.innerText = "Connexion réussie";
//       loginMessage.style.color = "green";

//       setTimeout(() => {
//         window.location.href = "index.html";
//       }, 800);

//     })
//     .catch(() => {
//       loginMessage.innerText = "Email ou mot de passe incorrect";
//       loginMessage.style.color = "red";
//     });
//   });
// }








// const mapElement = document.getElementById("map");

// if (mapElement && typeof L !== "undefined") {

//   const map = L.map("map").setView([31.7917, -7.0926], 6);

//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
//     .addTo(map);

//   fetch("http://127.0.0.1:8000/api/catastrophes")
//     .then(res => res.json())
//     .then(data => {

//       const list = Array.isArray(data) ? data : data.data || [];

//       list.forEach(d => {

//         const lat = parseFloat(d.latitude);
//         const lng = parseFloat(d.longitude);

//         if (!isNaN(lat) && !isNaN(lng)) {

//           L.marker([lat, lng])
//             .addTo(map)
//             .bindPopup(`
//               <b>${d.title}</b><br>
//               ${d.description}
//             `);

//         }

//       });

//     })
//     .catch(() => {
//       console.log("Error loading disasters");
//     });
// }

// const logoutBtn = document.getElementById("logoutBtn");

// if (logoutBtn) {
//   logoutBtn.addEventListener("click", () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     window.location.href = "login.html";
//   });
// }
//