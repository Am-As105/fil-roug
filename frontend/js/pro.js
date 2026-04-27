const token = localStorage.getItem("token");
const PROFILE_API_BASE_URL = "https://savehaven.aminearar.com/api";

if (!token) {
  window.location.href = "login.html";
}

const navbar = document.querySelector(".navbar");
const menuBtn = document.querySelector(".menu-btn");

if (navbar && menuBtn) {
  const closeMenu = () => {
    navbar.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navbar.querySelectorAll(".nav-link, .nav-secondary, .nav-primary").forEach(link => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        closeMenu();
      }
    });
  });
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.innerText = value;
  }
}

fetch(`${PROFILE_API_BASE_URL}/user`, {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error loading profile");
  }

  return data;
})
.then(user => {
  const displayName = user.name || "Utilisateur";
  const email = user.email || "";
  const phone = user.phone || user.telephone || "Non renseigné";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "SH";

  document.title = `Profil de ${displayName} | SafeHaven`;

  setText("profileHeading", `Bonjour, ${displayName}`);
  setText("profileAvatar", initials);
  setText("profileName", displayName);
  setText("profileEmailPreview", email || "Aucune adresse e-mail");
  setText("userName", displayName);
  setText("userEmail", email || "Non renseigné");
  setText("userPhone", phone);
})
.catch(() => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });
}
