const id = new URLSearchParams(window.location.search).get("id");
const token = localStorage.getItem("token");

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
  if (key === "encours" || key === "inprogress" || key === "progress") return "progress";
  if (key === "elevee" || key === "high") return "high";

  return "neutral";
}

if (!id) {
  document.getElementById("title").innerText = "Aucun ID";
}

const headers = {};
if (token) headers.Authorization = "Bearer " + token;


fetch("https://16.170.217.143/api/catastrophes/" + id, { headers })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(d => {

    document.getElementById("title").innerText = d.title;
    document.getElementById("desc").innerText = d.description;
    document.getElementById("date").innerText = d.date;
    document.getElementById("severity").innerText = d.severity;
    document.getElementById("lat").innerText = d.latitude;
    document.getElementById("lng").innerText = d.longitude;

    const status = document.getElementById("status");
    status.innerText = d.status;
    status.classList.add("status-" + getStatusVariant(d.status));

    const lat = parseFloat(d.latitude);
    const lng = parseFloat(d.longitude);

    const map = L.map("map").setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(d.title)
      .openPopup();

    let radius = 500;

    if (d.severity === "Critique") radius = 2000;
    else if (d.severity === "Élevée") radius = 1200;
    else if (d.severity === "Moyenne") radius = 800;

    L.circle([lat, lng], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.3,
      radius: radius
    }).addTo(map);

    const ctx = document.getElementById("myChart");

    if (ctx) {

      const start = new Date(d.date);
      const today = new Date();

      let endDate;
      let progress = 0;

      const status = normalizeKey(d.status);

      if (status === "termine" || status === "resolved") {
        endDate = new Date(d.updated_at || today);
        progress = 100;
      } else {
        endDate = today;

        if (status === "critique") progress = 25;
        else if (status === "encours" || status === "progress") progress = 60;
      }

      const labels = [
        start.toLocaleDateString(),
        endDate.toLocaleDateString()
      ];

      const data = [
        0,
        progress
      ];

      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: "Suivi",
            data: data,
            borderColor: "red",
            fill: false
          }]
        },
        options: {
          scales: {
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });
    }

  })
  .catch(() => {
    document.getElementById("title").innerText = "Erreur chargement";
  });