


const citySelect = document.getElementById("citySelect");

if (citySelect) {
  fetch("https://countriesnow.space/api/v0.1/countries/cities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      country: "Morocco"
    })
  })
  .then(res => res.json())
  .then(data => {

    citySelect.innerHTML = "";

    data.data.forEach(city => {
      citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });

  });
}


// const API = "http://127.0.0.1:8000/api";
// const id = new URLSearchParams(window.location.search).get("id");
// const token = localStorage.getItem("token");

// const form = document.getElementById("editForm");


// fetch(API + "/catastrophes/" + id)
// .then(res => res.json())
// .then(d => {
//   form.title.value = d.title;
//   form.description.value = d.description;
//   form.latitude.value = d.latitude;
//   form.longitude.value = d.longitude;
//   form.date.value = d.date;
//   form.severity.value = d.severity;
//   form.status.value = d.status;
// });



// form.addEventListener("submit", function(e){
//   e.preventDefault();

//   fetch(API + "/catastrophes/" + id, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": "Bearer " + token
//     },
//     body: JSON.stringify({
//       title: this.title.value,
//       description: this.description.value,
//       latitude: this.latitude.value,
//       longitude: this.longitude.value,
//       date: this.date.value,
//       severity: this.severity.value,
//       status: this.status.value
//     })
//   })
//   .then(() => {
//     alert("Updated");
//     window.location.href = "index.html";
//   })
//   .catch(() => alert("Error"));//
// });
