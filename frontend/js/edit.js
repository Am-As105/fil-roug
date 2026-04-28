const API = "https://savehaven.aminearar.com/api";

const id = new URLSearchParams(window.location.search).get("id");
const token = localStorage.getItem("token");

const form = document.getElementById("editForm");
const citySelect = document.getElementById("citySelect");
const typeSelect = document.getElementById("typeSelect");

let selectedCity = "";

fetch("https://countriesnow.space/api/v0.1/countries/cities", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ country: "Morocco" })
})
.then(res => res.json())
.then(data => {
  citySelect.innerHTML = "";
  (data.data || []).forEach(city => {
    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
  });
  if (selectedCity) citySelect.value = selectedCity;
})
.catch(() => {
  if (citySelect) citySelect.innerHTML = "<option>Error</option>";
});

if (typeSelect) {
  fetch(API + "/types", {
    headers: { "Authorization": "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
    const types = data.data || data;
    typeSelect.innerHTML = "";
    types.forEach(t => {
      typeSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
  })
  .catch(() => {
    typeSelect.innerHTML = "<option>Error</option>";
  });
}

if (form && id) {
  fetch(API + "/catastrophes/" + id)
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      return data;
    })
    .then(res => {
      const d = res.data || res;

      form.title.value = d.title || "";
      selectedCity = d.description || "";
      form.date.value = d.date || "";
      form.latitude.value = d.latitude || "";
      form.longitude.value = d.longitude || "";
      form.severity.value = d.severity || "low";

      const status = (d.status || "").toLowerCase();
      if (status.includes("en cours")) {
        form.status.value = "progress";
      } else if (status.includes("crit")) {
        form.status.value = "critical";
      } else if (status.includes("elevee") || status.includes("élevée")) {
        form.status.value = "high";
      }

      form.type_id.value = d.type_id || "";
      form.victims.value = d.victims || 0;
      form.injured.value = d.injured || 0;
      form.damage.value = d.damage || 0;
    })
    .catch(() => {
      alert("Error loading catastrophe");
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    fetch(API + "/catastrophes/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        title: this.title.value,
        description: citySelect.value,
        date: this.date.value,
        latitude: this.latitude.value,
        longitude: this.longitude.value,
        severity: this.severity.value,
        status: this.status.value,
        type_id: this.type_id.value,
        victims: this.victims.value,
        injured: this.injured.value,
        damage: this.damage.value
      })
    })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      return data;
    })
    .then(() => {
      alert("Updated successfully");
      window.location.href = "index.html";
    })
    .catch(() => alert("Error"));
  });
}