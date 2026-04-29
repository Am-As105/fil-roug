const token = localStorage.getItem("token");
const API = "https://savehaven.aminearar.com/api";

if (!token) location.href = "login.html";

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
};

fetch(API + "/user", {  
  headers: {
    Authorization: "Bearer " + token
  } 
})
.then(res => res.json())
.then(user => {
  if (!user || user.error) throw new Error();

  const name = user.name || "Utilisateur";
  const email = user.email || "Aucune adresse e-mail";
  const phone = user.phone || user.telephone || "Non renseigné";

  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  document.title = "Profil - " + name;

  setText("profileHeading", "Bonjour, " + name);
  setText("profileAvatar", initials || "SH");
  setText("profileName", name);
  setText("profileEmailPreview", email);
  setText("userName", name);
  setText("userEmail", email);
  setText("userPhone", phone);
})
.catch(() => {
  localStorage.clear();
  location.href = "login.html";
});

const logout = () => {
  localStorage.clear();
  location.href = "login.html";
};

// const logoutBtn = document.getElementById("logoutBtn");
// if (logoutBtn) logoutBtn.onclick = logout;