const API = "https://16.170.217.143/api";

const id = new URLSearchParams(window.location.search).get("id");
const token = localStorage.getItem("token");

const form = document.getElementById("editForm");
const citySelect = document.getElementById("citySelect");

fetch("https://countriesnow.space/api/v0.1/countries/cities", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ country: "Morocco" })
})
.then(res => res.json())
.then(data => {
  citySelect.innerHTML = "";
  data.data.forEach(city => {
    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
  });
});

if (form && id) {
  fetch(API + "/catastrophes/" + id)
    .then(res => res.json())
    .then(d => {
      form.title.value = d.title || "";
      citySelect.value = d.description || "";
      form.date.value = d.date || "";
      form.latitude.value = d.latitude || "";
      form.longitude.value = d.longitude || "";
      form.severity.value = d.severity || "low";
      form.status.value = d.status || "";

      form.type_id.value = d.type_id || "";
      form.victims.value = d.victims || 0;
      form.injured.value = d.injured || 0;
      form.damage.value = d.damage || 0;
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
    .then(() => {
      alert("Updated successfully");
      window.location.href = "index.html";
    })
    .catch(() => alert("Error"));
  });
}

const typeSelect = document.getElementById("typeSelect");

if (typeSelect) {
  const token = localStorage.getItem("token");

  fetch(API + "/types", {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(types => {
    typeSelect.innerHTML = "";

    types.forEach(t => {
      typeSelect.innerHTML += `
        <option value="${t.id}">${t.name}</option>
      `;
    });
  })
  .catch(() => {
    typeSelect.innerHTML = "<option>Error</option>";
  });
}